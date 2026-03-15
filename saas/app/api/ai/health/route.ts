import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  return NextResponse.json({
    configured: hasKey,
    model: "gpt-4o-mini",
    status: hasKey ? "ready" : "missing_api_key",
  }, { status: hasKey ? 200 : 503 });
}
