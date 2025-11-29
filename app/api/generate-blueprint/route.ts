// /app/api/generate-blueprint/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { BusinessBlueprint } from "@/types/blueprint-types";

// Helper: extract JSON from model output
function extractJson(content: string): any {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return {};
    return JSON.parse(match[0]);
  } catch (e) {
    console.error("Failed to parse JSON from OpenAI:", content);
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userInput = body.userInput ?? "";
    const history = body.history ?? [];

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `
You are an AI that generates a structured business blueprint.

Return ONLY valid JSON in the following format:

{
  "title": "...",
  "subtitle": "...",
  "situationSummary": "...",
  "recommendedDirection": "...",
  "businessModelSummary": "...",
  "exampleOffers": ["...", "..."],
  "monetization": ["...", "..."],
  "howToFindCustomers": ["...", "..."],
  "stepByStepGuide": ["...", "..."],
  "dayOneActions": ["...", "..."],
  "first30Days": ["...", "..."],
  "keyRisks": ["...", "..."],
  "howToDeRisk": ["...", "..."],
  "growthLevers": ["...", "..."]
}

User input:
${userInput}

Choices history:
${JSON.stringify(history)}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    // Extract model raw output
    const raw = completion.output_text ?? "";

    // Parse JSON from model output
    const blueprint: BusinessBlueprint = extractJson(raw);

    // Build a SAFE object (never undefined / never crashes UI)
    const finalBlueprint: BusinessBlueprint = {
      title: blueprint.title ?? "",
      subtitle: blueprint.subtitle ?? "",
      situationSummary: blueprint.situationSummary ?? "",
      recommendedDirection: blueprint.recommendedDirection ?? "",
      businessModelSummary: blueprint.businessModelSummary ?? "",
      exampleOffers: Array.isArray(blueprint.exampleOffers) ? blueprint.exampleOffers : [],
      monetization: Array.isArray(blueprint.monetization) ? blueprint.monetization : [],
      howToFindCustomers: Array.isArray(blueprint.howToFindCustomers) ? blueprint.howToFindCustomers : [],
      stepByStepGuide: Array.isArray(blueprint.stepByStepGuide) ? blueprint.stepByStepGuide : [],
      dayOneActions: Array.isArray(blueprint.dayOneActions) ? blueprint.dayOneActions : [],
      first30Days: Array.isArray(blueprint.first30Days) ? blueprint.first30Days : [],
      keyRisks: Array.isArray(blueprint.keyRisks) ? blueprint.keyRisks : [],
      howToDeRisk: Array.isArray(blueprint.howToDeRisk) ? blueprint.howToDeRisk : [],
      growthLevers: Array.isArray(blueprint.growthLevers) ? blueprint.growthLevers : []
    };

    return NextResponse.json({
      success: true,
      blueprint: finalBlueprint,
    });

  } catch (err) {
    console.error("Error in /api/generate-blueprint:", err);
    return NextResponse.json(
      { success: false, error: "Server error while generating blueprint" },
      { status: 500 }
    );
  }
}
