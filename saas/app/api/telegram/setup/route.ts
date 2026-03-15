import { NextRequest, NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram/bot";

// GET /api/telegram/setup — registers the webhook with Telegram
// Call this once after deploying: curl https://yourapp.vercel.app/api/telegram/setup?secret=CRON_SECRET
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://project-mdd25.vercel.app";
  const result = await setWebhook(`${appUrl}/api/telegram/webhook`);

  return NextResponse.json(result);
}
