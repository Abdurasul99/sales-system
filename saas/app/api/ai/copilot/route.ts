import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionFromRequest } from "@/lib/auth/session";
import { buildSystemPrompt, type UserContext, type PageContext } from "@/lib/ai/copilot-context";
import prisma from "@/lib/db/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      error: "AI_NOT_CONFIGURED",
      message: "Для использования AI-копилота необходимо добавить OPENAI_API_KEY в настройки окружения.",
    }, { status: 503 });
  }

  const body = await req.json();
  const { message, pageContext, history = [] } = body as {
    message: string;
    pageContext: PageContext;
    history: { role: "user" | "assistant"; content: string }[];
  };

  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  // Build user context from DB
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      fullName: true,
      role: true,
      branch: { select: { name: true } },
      organization: {
        select: {
          name: true,
          subscription: {
            select: {
              plan: {
                select: { name: true, features: { select: { feature: true, enabled: true } } }
              }
            }
          }
        }
      }
    }
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userCtx: UserContext = {
    role: user.role,
    fullName: user.fullName,
    organizationName: user.organization?.name ?? null,
    planName: user.organization?.subscription?.plan?.name ?? null,
    branchName: user.branch?.name ?? null,
    planFeatures: user.organization?.subscription?.plan?.features
      ?.filter(f => f.enabled)
      .map(f => f.feature) ?? [],
  };

  const systemPrompt = buildSystemPrompt(userCtx, pageContext);

  // Build message history (limit to last 8 turns to control token usage)
  const recentHistory = history.slice(-8).map(h => ({
    role: h.role as "user" | "assistant",
    content: h.content,
  }));

  // Use streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          temperature: 0.4,
          max_tokens: 500,
          messages: [
            { role: "system", content: systemPrompt },
            ...recentHistory,
            { role: "user", content: message },
          ],
        });

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
