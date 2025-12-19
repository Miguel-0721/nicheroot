import { NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchSearchInterest } from "@/lib/serpapi";
import { buildPass1SystemPrompt, buildPass1UserPrompt } from "./_prompts/pass1";
import { buildPass2SystemPrompt, buildPass2UserPrompt } from "./_prompts/pass2";
import { buildPass3SystemPrompt, buildPass3UserPrompt } from "./_prompts/pass3";



const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});


const SERPAPI_BLUEPRINT_ENABLED =
  process.env.ENABLE_SERPAPI_BLUEPRINT === "true";





// Extract JSON wrapped inside <json> ... </json>
function extractJson(text: string) {
  const start = text.indexOf("<json>");
  const end = text.indexOf("</json>");

  if (start === -1 || end === -1) {
    throw new Error("JSON wrapper not found");
  }

  const jsonText = text.slice(start + 6, end).trim();
  return JSON.parse(jsonText);
}



function assertHasBlocks(part: any, passLabel: string) {
  if (!part || !Array.isArray(part.sections)) {
    throw new Error(`${passLabel}: Missing sections array`);
  }

  for (const s of part.sections) {
    if (!s?.id || !s?.title) {
      throw new Error(`${passLabel}: Section missing id/title`);
    }

    if (!s?.content || !Array.isArray(s.content.blocks)) {
      throw new Error(`${passLabel}: Section ${s?.id ?? "(unknown)"} missing content.blocks`);
    }

    for (const block of s.content.blocks) {
      if (!block?.type || block.value === undefined) {
        throw new Error(`${passLabel}: Section ${s.id} has invalid block (missing type/value)`);
      }

      if (!["paragraph", "list", "table"].includes(block.type)) {
        throw new Error(`${passLabel}: Section ${s.id} has unsupported block type: ${block.type}`);
      }

      if (block.type === "paragraph") {
        if (typeof block.value !== "string") {
          throw new Error(`${passLabel}: Section ${s.id} paragraph value must be string`);
        }
      }

      if (block.type === "list") {
        if (!block.value || !Array.isArray(block.value.items)) {
          throw new Error(`${passLabel}: Section ${s.id} list value must have items[]`);
        }
      }

      if (block.type === "table") {
        if (
          !block.value ||
          !Array.isArray(block.value.columns) ||
          !Array.isArray(block.value.rows)
        ) {
          throw new Error(`${passLabel}: Section ${s.id} table value must have columns[] and rows[][]`);
        }
      }
    }
  }
}





function safeGetText(response: any): string {
  let fullText = "";

  if (Array.isArray(response.output)) {
    for (const block of response.output) {
      if (Array.isArray(block.content)) {
        for (const item of block.content) {
          if (typeof item.text === "string") {
            fullText += item.text;
          }
        }
      }
    }
  }

  return fullText.trim();
}



function normalizeQueries(queries: string[]) {
  return queries.map((q) => q.toLowerCase());
}

function analyzeQueryPatterns(queries: string[]) {
  const normalized = normalizeQueries(queries);

  const hasFreeIntent = normalized.some(
    (q) => q.includes("free") || q.includes("without paying")
  );

  const hasHowToIntent = normalized.some(
    (q) => q.startsWith("how to") || q.includes("how do")
  );

  const hasPaidLanguage = normalized.some(
    (q) => q.includes("price") || q.includes("pricing") || q.includes("cost")
  );

  return {
    hasFreeIntent,
    hasHowToIntent,
    hasPaidLanguage,
  };
}






// ✅ ADD THIS HERE
async function runModel(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
) {
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_output_tokens: maxTokens,
  });

  const raw = safeGetText(response);
  if (!raw) throw new Error("No output from model");
  return raw;
}



export async function POST(req: Request) {
  try {
    const { idea, userContext } = await req.json();


    if (!idea) {
      return NextResponse.json(
        { error: "Missing idea" },
        { status: 400 }
      );
    }


const primaryKeyword =
  idea?.name || idea?.title || idea?.niche || "business idea";

let searchData = null;

if (SERPAPI_BLUEPRINT_ENABLED) {
  searchData = await fetchSearchInterest(primaryKeyword);
}


// Dev-only: confirm SerpAPI data is being returned during blueprint testing
if (
  process.env.NODE_ENV === "development" &&
  SERPAPI_BLUEPRINT_ENABLED
) {
  console.log(
    "SERP QUERY SAMPLE:",
    searchData?.related_queries?.slice(0, 3)
  );
}





let searchSignalSummary = SERPAPI_BLUEPRINT_ENABLED
  ? "Search interest signals:\n"
  : "Search interest signals:\n- External search data collection is currently disabled.\n";


if (
  SERPAPI_BLUEPRINT_ENABLED &&
  searchData &&
  typeof searchData === "object" &&
  Array.isArray(searchData.related_queries)
) {


  const queries = searchData.related_queries.slice(0, 5);
  const patterns = analyzeQueryPatterns(queries);

  if (queries.length === 0) {
    searchSignalSummary +=
      "- No consistent or clearly attributable search queries were observed.\n" +
      "- Visibility may be fragmented or occur outside standard search patterns.";
  } else if (patterns.hasFreeIntent && !patterns.hasPaidLanguage) {
    searchSignalSummary +=
      "- Queries frequently reference free or informal alternatives.\n" +
      "- Search phrasing suggests information-seeking rather than transaction intent.\n" +
      "- Paid intent is not clearly distinguishable.";
  } else if (patterns.hasHowToIntent && !patterns.hasPaidLanguage) {
    searchSignalSummary +=
      "- Queries focus on self-guided or instructional phrasing.\n" +
      "- Search behavior overlaps with learning rather than purchasing.\n" +
      "- Commercial intent is difficult to isolate.";
  } else if (patterns.hasPaidLanguage) {
    searchSignalSummary +=
      "- Some queries reference pricing or paid access.\n" +
      "- Intent appears mixed rather than clearly transactional.\n" +
      "- Willingness to pay cannot be inferred from wording alone.";
  } else {
    searchSignalSummary +=
      "- Queries appear across multiple variations.\n" +
      "- Intent is mixed and overlaps with non-commercial exploration.\n" +
      "- Purchase motivation is not clearly expressed.";
  }
} else {
  searchSignalSummary +=
    "- No external search context was available for this idea.";
}





// Blueprint v2.1 — Content rules locked
// Purpose: decision-support, validation-first, non-promotional
// Do not modify content rules without deliberate version bump






// PASS 1 (meta + sections 1–3)
// Increased token limit to allow beginner-level explanations
const raw1 = await runModel(
  buildPass1SystemPrompt(),
  buildPass1UserPrompt(idea, userContext),
  2400
);

// 🔍 TEMP DEBUG — add this line
console.log("RAW FULL OUTPUT LENGTH (PASS 1):", raw1.length);

console.log("RAW PASS 1:\n", raw1);
const part1 = extractJson(raw1);

// ✅ NEW: validate block structure
assertHasBlocks(part1, "PASS 1");

if (
  !part1?.meta ||
  !Array.isArray(part1.sections) ||
  part1.sections.length !== 3
) {
  throw new Error("Pass 1 must return meta + exactly 3 sections");
}


// PASS 2 (sections 4–6)
// Still explanatory, but slightly more concise than Pass 1
const raw2 = await runModel(
  buildPass2SystemPrompt(),
  buildPass2UserPrompt(idea, userContext, searchSignalSummary),
  2000
);
console.log("RAW PASS 2:\n", raw2);
const part2 = extractJson(raw2);

// ✅ NEW
assertHasBlocks(part2, "PASS 2");

if (!Array.isArray(part2.sections) || part2.sections.length !== 3) {
  throw new Error("Pass 2 must return exactly 3 sections");
}


// PASS 3 (sections 7–10)
// Execution-heavy sections need space but less narrative explanation
const raw3 = await runModel(
  buildPass3SystemPrompt(),
  buildPass3UserPrompt(idea, userContext),
  2200
);
console.log("RAW PASS 3:\n", raw3);
const part3 = extractJson(raw3);

// ✅ NEW
assertHasBlocks(part3, "PASS 3");

if (!Array.isArray(part3.sections) || part3.sections.length !== 4) {
  throw new Error("Pass 3 must return exactly 4 sections");
}



// Merge result into final blueprint format expected by the UI
const merged = {
  meta: part1.meta,
  sections: [...part1.sections, ...part2.sections, ...part3.sections],
};


const expectedIds = [
  "what-this-business-actually-is",
  "who-this-is-for-and-who-it-isnt",
  "day-to-day-operational-reality",
  "problem-and-market-reality",
  "demand-signals-and-market-evidence",
  "pricing-reality-and-willingness-to-pay",
  "tools-skills-and-setup-required",
  "execution-path-first-30-days",
  "common-failure-patterns",
  "risks-tradeoffs-and-assumptions",
];

const receivedIds = merged.sections.map((s) => s.id);

for (const id of expectedIds) {
  if (!receivedIds.includes(id)) {
    throw new Error(`Missing required section id: ${id}`);
  }
}


// Final validation (must be 10)
if (!Array.isArray(merged.sections) || merged.sections.length !== 10) {
  throw new Error("Merged blueprint must contain exactly 10 sections");
}

return NextResponse.json(merged);

  } catch (err: any) {
    console.error("Blueprint V2 error:", err);
    return NextResponse.json(
      { error: "Failed to generate blueprint" },
      { status: 500 }
    );
  }
}
