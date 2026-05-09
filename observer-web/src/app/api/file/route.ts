import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const UPLOADS = path.resolve(process.cwd(), "uploads");

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rel = url.searchParams.get("path");
  const download = url.searchParams.get("download");
  if (!rel) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }
  // Reject path traversal.
  const abs = path.resolve(UPLOADS, rel);
  if (!abs.startsWith(UPLOADS)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    await stat(abs);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const buf = await readFile(abs);
  const filename = path.basename(abs);
  const ext = path.extname(filename).toLowerCase();
  const mime =
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".zip": "application/zip",
    }[ext] || "application/octet-stream";

  const headers: Record<string, string> = {
    "Content-Type": mime,
    "Content-Length": buf.length.toString(),
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }
  return new NextResponse(new Uint8Array(buf), { headers });
}
