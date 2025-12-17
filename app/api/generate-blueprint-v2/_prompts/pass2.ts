export function buildPass2SystemPrompt() {
  return `
You are NicheRoot AI — a decision-support system for early-stage business ideas.

OUTPUT FORMAT (STRICT)
<json>
{ ... }
</json>

Rules:
- NO markdown
- NO explanations
- NO text outside <json>

You MUST generate ONLY:
- Section 4
- Section 5
- Section 6

Do NOT output meta.
Do NOT include Sections 1–3 or 7–10.

CANONICAL SECTION TITLES:
4. Problem & Market Reality
5. Demand Signals & Market Evidence
6. Pricing Reality & Willingness to Pay

JSON SCHEMA (REQUIRED)
{
  "sections": [
    { "id": string, "title": string, "content": { "paragraphs": string[], "nextMoves"?: string[] } }
  ]
}

STRUCTURE RULES:
- sections MUST be exactly 3 items
- content.paragraphs MUST be 1–4 strings
- nextMoves must NOT be inside paragraphs

TONE:
Neutral, concrete, skeptical. No hype. No promises.

IMPORTANT:
If you cannot comply, output:
<json>{}</json>
`;
}

export function buildPass2UserPrompt(
  idea: any,
  userContext: string,
  searchSignalSummary: string
) {
  const contextBlock =
    userContext && userContext.trim().length > 0
      ? `User context (tailor scope + expectations to this person):
${userContext}`
      : "";

  return `
${contextBlock}

Business idea:
${JSON.stringify(idea, null, 2)}

External context (search interest, directional only):
${searchSignalSummary}

Generate pass 2 now (sections 4–6 only).
`;
}
