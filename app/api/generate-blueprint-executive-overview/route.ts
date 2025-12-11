import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function extractFirstJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

export async function POST(req: Request) {
  try {
    const { userInput, history, meta } = await req.json();

    const prompt = `
You are NicheRoot AI. Generate the **most advanced Executive Overview** for a business blueprint.

OUTPUT MUST BE VALID JSON:

{
  "section": {
    "id": "executive-overview",
    "title": "Executive Overview",
    "content": {
      "paragraphs": [],
      "tables": [],
      "charts": [],
      "lists": [],
      "examples": [],
      "nextMoves": []
    }
  }
}

-------------------------------------------
EXECUTIVE OVERVIEW REQUIREMENTS
-------------------------------------------

WRITE **4 STRATEGIC PARAGRAPHS**:
1. *Business Overview* → What this model is, how it works, why it fits the user.
2. *Founder Fit* → Reference META (skills, profile, constraints, timeline).
3. *Market Timing* → Why now is a good time for this model.
4. *Strategic Angle* → What gives this user a comparative advantage.

-------------------------------------------
TABLE 1: BUSINESS SNAPSHOT
-------------------------------------------
Include this EXACT structure:

{
  "title": "Business Snapshot",
  "columns": ["Factor", "Assessment"],
  "rows": [
    ["Startup cost", "..."],
    ["Difficulty", "..."],
    ["Time to first results", "..."],
    ["Risk level", "..."],
    ["Market appetite", "..."]
  ],
  "explanation": "A quick overview that summarizes the core feasibility signals of this model."
}

Fill the assessments using meta.

-------------------------------------------
TABLE 2: MODEL STRENGTH SCORES (1–10)
-------------------------------------------
{
  "title": "Model Strength Scores (1–10)",
  "columns": ["Attribute", "Score"],
  "rows": [
    ["Ease of launch", number],
    ["Profit potential", number],
    ["Scalability", number],
    ["Skill match", number],
    ["Market demand", number]
  ],
  "explanation": "These scores show how well this model aligns with real-world expectations."
}

-------------------------------------------
CHART 1: BAR CHART
-------------------------------------------
A bar chart comparing:

xKey = "label"
yKeys = ["score"]

data = [
  { "label": "Ease of launch", "score": number },
  { "label": "Profit potential", "score": number },
  { "label": "Scalability", "score": number }
]

-------------------------------------------
CHART 2: 12-MONTH OUTCOME LINE CHART
-------------------------------------------
Show a realistic outcome curve:

xKey = "month"
yKeys = ["clients", "revenue"]

data example:
[
  { "month": "M1", "clients": 0, "revenue": 0 },
  { "month": "M3", "clients": 2, "revenue": 300 },
  { "month": "M6", "clients": 5, "revenue": 1200 },
  { "month": "M9", "clients": 8, "revenue": 2000 },
  { "month": "M12", "clients": 10, "revenue": 2800 }
]

-------------------------------------------
LIST BLOCKS (3 LISTS)
-------------------------------------------

LIST 1 → Strengths of this model (5 bullets)
LIST 2 → Potential weaknesses (3–4 bullets)
LIST 3 → Opportunities in the current market (3–5 bullets)

-------------------------------------------
EXAMPLES BLOCK
-------------------------------------------
Include:
{
  "title": "Example Scenarios",
  "items": [
    "A client hires you for...",
    "A scenario where the model adapts to...",
    "A growth example..."
  ]
}

-------------------------------------------
NEXT MOVES BLOCK
-------------------------------------------
6–8 actionable steps based on:
- userInput
- history
- meta


-------------------------------------------
⚠️ LEGAL / SAFETY REQUIREMENT (MUST FOLLOW)
-------------------------------------------

All numbers, charts, tables, revenue curves, outcomes, and timelines are **hypothetical illustrations only**.

- DO NOT imply predictions or guarantees.  
- DO NOT reference real statistics, external research, or government data.  
- Always use fictional, plausible example numbers.  
- Use language like “could”, “might”, “possible scenario”.  
- Avoid phrases like “will earn”, “guaranteed”, “proven”, “actual results”.

-------------------------------------------
IMPORTANT RULES
-------------------------------------------
- BE CONCRETE, not generic.
- REFERENCE META in multiple places.
- Keep formatting exactly JSON-compatible.

-------------------------------------------
USER INPUT
-------------------------------------------
${userInput}

-------------------------------------------
HISTORY
-------------------------------------------
${JSON.stringify(history)}

-------------------------------------------
META
-------------------------------------------
${JSON.stringify(meta)}
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      max_output_tokens: 5000,
    });

    const raw = response.output_text || "";
    const json = extractFirstJson(raw);

    return NextResponse.json(json);
  } catch (err: any) {
    console.error("EXEC OVERVIEW ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate advanced Executive Overview", message: err.message },
      { status: 500 }
    );
  }
}
