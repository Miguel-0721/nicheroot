import { NextResponse } from "next/server";
import OpenAI from "openai";
import { BusinessBlueprint } from "@/types/blueprint-types";
import { HistoryItem } from "@/types/question-types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Small helper to safely pull JSON out of the model text
function extractJson(text: string): any | null {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    const jsonStr = text.slice(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to parse JSON from model:", err, text);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userInput: string = body.userInput ?? "";
    const history: HistoryItem[] = body.history ?? [];

    // Turn the decision history into something the model can reason about
    const decisionsSummary =
      history && history.length
        ? history
            .map(
              (item) =>
                `Step ${item.step}: "${item.question}" → Chosen: "${item.optionLabel}" (choice ${item.optionKey})`
            )
            .join("\n")
        : "No structured answers were provided, only the free-text description.";

    // ---------- BLUEPRINT PROMPT (much more specific!) ----------
    const prompt = `
You are an experienced business strategist and niche-selection expert.

Your job:
- Read the user's description and their A/B trade-off decisions.
- Decide on ONE clear, coherent business direction that truly fits them.
- Then fill a detailed business blueprint in JSON format ONLY.

The business must be:
- Internally consistent across all sections (same niche, same offer, same customer).
- Realistic for a solo founder using AI tools (like ChatGPT / code assistants).
- Based on the user's constraints: time, money, risk tolerance, skills, lifestyle.

Avoid vagueness and clichés like "leverage social media" or "offer value".
Instead, be concrete and practical:
- Mention platforms (e.g. "Reddit communities for indie hackers", "YouTube automation creators").
- Mention approximate prices (e.g. "$19/month starter", "$49 standard").
- Mention concrete actions ("Publish 2 videos per week", "DM 5 potential users per day").

------------------------
USER FREE-TEXT DESCRIPTION
------------------------
${userInput || "No extra description provided."}

------------------------
WIZARD DECISION ANSWERS
(each step is a binary trade-off the user chose)
------------------------
${decisionsSummary}

------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
------------------------
Now return ONLY a JSON object (no markdown, no comments) with this exact shape:

{
  "title": "Short clear name for the business direction",
  "subtitle": "1–2 sentence explanation of what this business is about",
  "whyThisFitsYou": "Explain in 3–6 sentences why this model fits the user's situation and decisions",
  "situationSummary": "Summarize the user's current situation, constraints and goals in 1 short paragraph",
  "businessIdea": "Describe the core business model in 1 short paragraph: what you sell, to whom, and how",

  "idealCustomer": {
    "profile": "Who they are in 3–5 sentences (job, stage, mindset)",
    "painPoints": [
      "List 3–6 specific pains or frustrations this business solves",
      "Each item should be concrete and realistic"
    ],
    "whereTheyAre": [
      "List 3–6 places where they can be found (platforms, communities, channels)"
    ]
  },

  "offerExamples": [
    "2–4 example offers or packages the user could sell for this business"
  ],

  "pricing": {
    "starter": "Describe starter tier and an approximate monthly price",
    "standard": "Describe standard tier and an approximate monthly price",
    "premium": "Describe premium tier and an approximate monthly price"
  },

  "monetization": [
    "3–6 ways this business makes money (subscriptions, upsells, add-ons, templates, support, etc.)"
  ],

  "marketingPlan": {
    "organic": [
      "3–6 specific organic strategies tied to the same niche and platforms"
    ],
    "paid": [
      "2–4 paid strategies, if relevant (or explain why paid ads are low priority right now)"
    ]
  },

  "stepByStepGuide": [
    "6–10 higher-level phases from idea validation → first users → stable revenue"
  ],

  "dayOneActions": [
    "3–5 concrete tasks to do on Day 1 that directly move this business forward"
  ],

  "first30Days": [
    "5–8 concrete actions across the first 30 days (weeks or milestones)"
  ],

  "keyRisks": [
    "3–6 realistic risks / failure modes"
  ],

  "howToDeRisk": [
    "3–6 strategies that directly address the risks above"
  ],

  "growthLevers": [
    "3–6 levers that can meaningfully grow this business once the basics work"
  ]
}

Requirements:
- Always fill ALL fields with non-empty, useful content.
- Keep the entire blueprint focused on ONE specific business model.
- Make sure 'offerExamples', 'monetization', 'marketingPlan', and 'growthLevers'
  all point in the same direction, for the same type of customer and product.
`;

    // ---------- CALL OPENAI ----------
    const completion = await client.responses.create({
      model: "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You are a precise business-strategy generator. You ALWAYS respond with raw JSON only, never with markdown or explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = completion.output_text ?? "";
    const json = extractJson(raw);

    if (!json) {
      console.error("❌ Invalid blueprint JSON from model:", raw);
      return NextResponse.json(
        { success: false, error: "Invalid blueprint JSON" },
        { status: 500 }
      );
    }

    // ---------- TYPE-SAFE FALLBACKS TO MATCH BusinessBlueprint ----------
    const finalBlueprint: BusinessBlueprint = {
      title: json.title || "",
      subtitle: json.subtitle || "",
      whyThisFitsYou: json.whyThisFitsYou || "",
      situationSummary: json.situationSummary || "",
      businessIdea: json.businessIdea || "",

      idealCustomer: json.idealCustomer || {
        profile: "",
        painPoints: [],
        whereTheyAre: [],
      },

      offerExamples: json.offerExamples ?? [],

      pricing: json.pricing ?? {
        starter: "",
        standard: "",
        premium: "",
      },

      monetization: json.monetization ?? [],

      marketingPlan: json.marketingPlan ?? {
        organic: [],
        paid: [],
      },

      stepByStepGuide: json.stepByStepGuide ?? [],
      dayOneActions: json.dayOneActions ?? [],
      first30Days: json.first30Days ?? [],

      keyRisks: json.keyRisks ?? [],
      howToDeRisk: json.howToDeRisk ?? [],
      growthLevers: json.growthLevers ?? [],
    };

    return NextResponse.json({ success: true, blueprint: finalBlueprint });
  } catch (error) {
    console.error("Error in /api/generate-blueprint:", error);
    return NextResponse.json(
      { success: false, error: "Server error generating blueprint" },
      { status: 500 }
    );
  }
}
