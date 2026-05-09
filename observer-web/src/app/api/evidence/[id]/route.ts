import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ev = await db.evidence.findUnique({
    where: { id },
    select: { id: true, label: true, filePath: true },
  });
  if (!ev) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(ev);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: { label?: string; category?: string; caption?: string } = {};
  if (typeof body.label === "string") data.label = body.label;
  if (typeof body.category === "string") data.category = body.category;
  if (typeof body.caption === "string") data.caption = body.caption;
  await db.evidence.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.evidence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
