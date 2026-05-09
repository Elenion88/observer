import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { db } from "@/lib/db";
import {
  fillTemplates,
  type AuditorInputs,
  type DocumentKind,
  type ExtractedFields,
} from "@/lib/python";

const UPLOADS = path.resolve(process.cwd(), "uploads");

const STAGE1_KINDS: DocumentKind[] = [
  "stage1_plan",
  "stage1_intimation",
  "attendance",
  "stage1_report",
];
const STAGE2_KINDS: DocumentKind[] = [
  "stage2_plan",
  "stage2_intimation",
  "stage2_report",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const stage = (body?.stage || "1") as "1" | "2" | "both";

  const e = await db.engagement.findUnique({ where: { id } });
  if (!e) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let kinds: DocumentKind[] = [];
  if (stage === "1" || stage === "both") kinds = kinds.concat(STAGE1_KINDS);
  if (stage === "2" || stage === "both") kinds = kinds.concat(STAGE2_KINDS);

  const fields: ExtractedFields = {
    organization_name: e.organizationName,
    postal_address: e.postalAddress,
    audit_site: e.auditSite,
    contact_person: e.contactPerson,
    contact_designation: e.contactDesignation,
    contact_number: e.contactNumber,
    contact_email: e.contactEmail,
    audit_scope: e.auditScope,
    employee_count: e.employeeCount,
    iaf_code: e.iafCode,
    standards: JSON.parse(e.standardsJson || "[]"),
  };

  const auditor: AuditorInputs = {
    client_reference: e.clientReference,
    contract_number: e.contractNumber,
    intimation_date: e.intimationDate,
    audit_date_range: e.auditDateRange,
    audit_man_days: e.auditManDays,
    audit_stage: e.auditStage,
    audit_team: JSON.parse(e.auditTeamJson || "[]"),
  };

  const outDirRel = path.join("docs", id);
  const outDirAbs = path.resolve(UPLOADS, outDirRel);
  await mkdir(outDirAbs, { recursive: true });

  try {
    const results = await fillTemplates(fields, auditor, outDirAbs, kinds);
    for (const r of results) {
      const relPath = path.relative(UPLOADS, r.filePath);
      await db.document.upsert({
        where: { engagementId_kind: { engagementId: id, kind: r.kind } },
        create: { engagementId: id, kind: r.kind, filePath: relPath },
        update: { filePath: relPath, createdAt: new Date() },
      });
    }
    // Bump status if generation crossed a milestone.
    let newStatus = e.status;
    if (stage === "1" || stage === "both") newStatus = "stage1_done";
    if (stage === "2" || stage === "both") newStatus = "stage2_done";
    if (newStatus !== e.status) {
      await db.engagement.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ ok: true, generated: results.length });
  } catch (err) {
    console.error("generate failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 500 }
    );
  }
}
