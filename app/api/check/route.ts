import { NextRequest, NextResponse } from "next/server";

const TYPESAFE_API_URL = "https://api.typesafe.ai/v1/systemone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, state, labelA, labelB, runAll } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 400 }
      );
    }

    if (!state || !labelA || !labelB) {
      return NextResponse.json(
        { error: "State and labels required" },
        { status: 400 }
      );
    }

    const payload = {
      state,
      model: "jev-latest",
      questions: {
        forced: {
          type: "choice",
          instructions: "Which label best fits the state?",
          criteria: {
            [labelA]: labelA,
            [labelB]: labelB,
          },
        },
        idk: {
          type: "choice",
          instructions: "Which label best fits the state, or is there insufficient evidence?",
          criteria: {
            [labelA]: labelA,
            [labelB]: labelB,
            idk: "Not enough evidence to choose",
          },
        },
        noul: {
          type: "noul",
          instructions: `Does the state contain enough decision-relative evidence to choose between "${labelA}" and "${labelB}"?`,
        },
      },
    };

    const response = await fetch(TYPESAFE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `TypeSafe API error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
