import { NextResponse } from "next/server";

// Simple in-memory rate limiter. Resets if the server restarts/redeploys —
// fine for a small app; protects the shared free Gemini quota from being
// exhausted by one user or a bot. No database or extra service needed.
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60 * 60 * 1000; // per hour, per IP
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "You've reached the AI Companion limit for now. Please try again in a bit." },
        { status: 429 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep it under 4000 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 503 }
      );
    }

    const systemInstruction =
      "You are StudyFlow AI Companion, an educational assistant. Help students understand concepts clearly, create study plans, explain difficult topics, and improve their learning. Be concise but useful. Do not simply give answers when guiding a student through learning; explain the reasoning when appropriate.";

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini API error:", res.status, detail);
      return NextResponse.json(
        { error: "Unable to get a response from AI." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";

    if (!answer.trim()) {
      return NextResponse.json(
        { error: "AI returned an empty response. Try rephrasing your question." },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      { error: "Unable to get a response from AI." },
      { status: 500 }
    );
  }
}
