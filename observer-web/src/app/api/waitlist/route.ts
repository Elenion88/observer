import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; practice?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const practice = (body.practice ?? "").trim().slice(0, 500);

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "enter a valid email" }, { status: 400 });
  }

  const referrer = req.headers.get("referer") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    await db.signup.upsert({
      where: { email },
      create: { email, practice, referrer, userAgent },
      update: { practice: practice || undefined },
    });
  } catch (err) {
    console.error("waitlist signup failed", err);
    return NextResponse.json({ error: "signup failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
