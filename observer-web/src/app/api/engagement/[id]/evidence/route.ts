import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { labelImageFromPath } from "@/lib/labelImage";

const UPLOADS = path.resolve(process.cwd(), "uploads");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const t0 = Date.now();
  const { id } = await params;
  const e = await db.engagement.findUnique({ where: { id } });
  if (!e) {
    return NextResponse.json({ error: "engagement not found" }, { status: 404 });
  }

  const fd = await req.formData();
  const file = fd.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing photo" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const dirRel = path.join("evidence", id);
  const dirAbs = path.resolve(UPLOADS, dirRel);
  await mkdir(dirAbs, { recursive: true });
  const fileAbs = path.join(dirAbs, filename);
  const fileRel = path.join(dirRel, filename);
  await writeFile(fileAbs, Buffer.from(await file.arrayBuffer()));

  // Insert with empty label; client polls /api/evidence/[id] for the real label.
  const ev = await db.evidence.create({
    data: {
      engagementId: id,
      filePath: fileRel,
      mimeType: file.type || "image/jpeg",
      label: "",
    },
  });

  // Fire labelling in the background (no await) so the client can render the
  // photo immediately and pick up the label via polling when it lands.
  // updateMany with `label: ""` filter so a manual label set in the meantime
  // (by the user) is never overwritten by the AI.
  void labelImageFromPath(fileAbs)
    .then((label) =>
      db.evidence.updateMany({
        where: { id: ev.id, label: "" },
        data: { label },
      })
    )
    .catch(async (err) => {
      console.error("[evidence] background label failed:", err);
      await db.evidence
        .updateMany({
          where: { id: ev.id, label: "" },
          data: { label: "(label unavailable)" },
        })
        .catch(() => {});
    });

  return NextResponse.json({
    id: ev.id,
    filePath: fileRel,
    label: "",
    serverMs: Date.now() - t0,
  });
}
