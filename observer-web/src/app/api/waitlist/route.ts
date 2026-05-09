import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PROBLEMS = 12;

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    practice?: string;
    source?: string;
    problems?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const practice = (body.practice ?? "").trim().slice(0, 500);
  const source = (body.source ?? "").trim().slice(0, 80);
  const problems = Array.isArray(body.problems)
    ? body.problems
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, MAX_PROBLEMS)
    : [];

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "enter a valid email" }, { status: 400 });
  }

  const referrer = req.headers.get("referer") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";
  const problemsJson = JSON.stringify(problems);

  try {
    await db.signup.upsert({
      where: { email },
      create: {
        email,
        practice,
        source,
        problemsJson,
        referrer,
        userAgent,
      },
      update: {
        practice: practice || undefined,
        source: source || undefined,
        problemsJson: problems.length > 0 ? problemsJson : undefined,
      },
    });
  } catch (err) {
    console.error("waitlist signup failed", err);
    return NextResponse.json({ error: "signup failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
