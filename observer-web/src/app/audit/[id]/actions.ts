"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const ALLOWED_FIELDS = new Set([
  "organizationName",
  "postalAddress",
  "auditSite",
  "contactPerson",
  "contactDesignation",
  "contactNumber",
  "contactEmail",
  "auditScope",
  "employeeCount",
  "iafCode",
  "clientReference",
  "contractNumber",
  "intimationDate",
  "auditDateRange",
  "auditManDays",
  "auditStage",
  "auditTeamJson",
  "status",
]);

export async function updateField(
  id: string,
  field: string,
  value: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ALLOWED_FIELDS.has(field)) {
    return { ok: false, error: `unknown field: ${field}` };
  }
  await db.engagement.update({
    where: { id },
    data: { [field]: value },
  });
  revalidatePath(`/audit/${id}`);
  return { ok: true };
}

export async function updateEvidenceLabel(
  evidenceId: string,
  label: string
): Promise<{ ok: true }> {
  const evidence = await db.evidence.update({
    where: { id: evidenceId },
    data: { label },
  });
  revalidatePath(`/audit/${evidence.engagementId}`);
  return { ok: true };
}

export async function deleteEvidence(evidenceId: string): Promise<{ ok: true }> {
  const evidence = await db.evidence.delete({ where: { id: evidenceId } });
  revalidatePath(`/audit/${evidence.engagementId}`);
  return { ok: true };
}

export type ApprovalSection = "client" | "audit";

const SECTION_FIELD: Record<ApprovalSection, "clientApprovedAt" | "auditApprovedAt"> = {
  client: "clientApprovedAt",
  audit: "auditApprovedAt",
};

export async function setApproval(
  id: string,
  section: ApprovalSection,
  approved: boolean
): Promise<{ ok: true; approvedAt: string | null }> {
  const field = SECTION_FIELD[section];
  const value = approved ? new Date() : null;
  await db.engagement.update({
    where: { id },
    data: { [field]: value },
  });
  revalidatePath(`/audit/${id}`);
  return { ok: true, approvedAt: value ? value.toISOString() : null };
}
