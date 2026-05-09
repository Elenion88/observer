import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { db } from "@/lib/db";

const UPLOADS = path.resolve(process.cwd(), "uploads");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const e = await db.engagement.findUnique({
    where: { id },
    include: { documents: true },
  });
  if (!e || e.documents.length === 0) {
    return NextResponse.json(
      { error: "no documents to zip" },
      { status: 404 }
    );
  }

  const zip = new JSZip();
  const slug = e.organizationName.toLowerCase().split(/\s+/)[0] || "audit";
  for (const doc of e.documents) {
    try {
      const abs = path.resolve(UPLOADS, doc.filePath);
      if (!abs.startsWith(UPLOADS)) continue;
      const buf = await readFile(abs);
      zip.file(`${slug}_${doc.kind}.docx`, buf);
    } catch {
      // skip missing files
    }
  }
  const buf = await zip.generateAsync({ type: "uint8array" });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}_audit_packet.zip"`,
    },
  });
}
