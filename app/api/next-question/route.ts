import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Extract JSON safely from GPT response
function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("JSON not found in OpenAI response");
  }
  return JSON.parse(match[0]);
}

// FINAL 6 DIMENSIONS
const DIMENSIONS = [
  { id: "lifestyle_pace", label: "Business pace and lifestyle alignment" },
  { id: "skills_vs_capital", label: "Skill-driven vs capital-driven approach" },
  { id: "involvement_level", label: "Active involvement vs strategic oversight" },
  { id: "digital_vs_physical", label: "Digital-first vs physical/local business" },
  { id: "risk_profile", label: "Innovative vs proven business model" },
  { id: "solo_vs_social", label: "Solo work vs client-facing work" }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, history, userInput } = body;

    const MAX_STEPS = DIMENSIONS.length;

    if (step > MAX_STEPS) {
      return NextResponse.json({ success: true, done: true });
    }

    const dimension = DIMENSIONS[step - 1];

    const formattedHistory = history.map((h: any) => ({
      step: h.step,
      question: h.question,
      choice: h.choice,
      option: h.optionLabel,
    }));

    const prompt = `
You are NicheRoot, an elite business decision engine.  
Your job: generate ONE unique, personalized A/B question about THIS dimension:

"${dimension.label}"

────────────────────────────────
USER STORY (USE HEAVILY)
────────────────────────────────
${userInput}

────────────────────────────────
PREVIOUS ANSWERS
────────────────────────────────
${JSON.stringify(formattedHistory, null, 2)}

────────────────────────────────
STRICT RULES
────────────────────────────────

1. The question MUST be about the current dimension ONLY.
2. It MUST feel personal and specific to the user's life.
3. It MUST NOT repeat any previous question structure.
4. Each option MUST represent a STRONG opposite trade-off.
5. Each option MUST include:

{
  "key": "A",
  "label": "short label",
  "details": {
    "description": "1–2 sentences",
    "pros": ["pro1", "pro2"],
    "cons": ["con1", "con2"],
    "example": "one short real example",
    "why_this_fits": "personalized explanation for THIS user"
  }
}

6. Return ONLY this JSON:

{
  "step": ${step},
  "question": "Your personalized question...",
  "options": [OPTION_A_OBJECT, OPTION_B_OBJECT]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.55,
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = extractJson(raw);

    return NextResponse.json({
      success: true,
      done: false,
      question: parsed,
    });

  } catch (error) {
    console.error("❌ Error generating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate next question" },
      { status: 500 }
    );
  }
}
