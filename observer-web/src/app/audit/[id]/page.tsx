import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  Camera,
  FileStack,
} from "lucide-react";
import { db } from "@/lib/db";
import { STATUS_DOT, STATUS_LABEL, STATUS_TEXT, type Status } from "@/lib/status";
import { EditableField } from "./EditableField";
import { AuditTeamEditor } from "./AuditTeamEditor";
import { EvidenceItem } from "./EvidenceItem";
import { DocumentsPanel } from "./DocumentsPanel";
import { StageSelectClient } from "./StageSelectClient";
import { StatusTimeline } from "./StatusTimeline";
import { ApprovalChip, SectionApprovalFooter } from "./SectionApproval";
import { CaptureButton } from "./CaptureButton";
import { UploadEvidenceButton } from "./UploadEvidenceButton";
import { DangerZone } from "./DangerZone";
export const dynamic = "force-dynamic";

export default async function EngagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await db.engagement.findUnique({
    where: { id },
    include: {
      evidence: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!e) notFound();

  const status = e.status as Status;
  const hasFields =
    e.organizationName !== "Untitled audit" && e.organizationName !== "";
  const clientLocked = !!e.clientApprovedAt;
  const auditLocked = !!e.auditApprovedAt;
  const evidenceLocked = !!e.evidenceApprovedAt;
  const clientApprovedISO = e.clientApprovedAt?.toISOString() ?? null;
  const auditApprovedISO = e.auditApprovedAt?.toISOString() ?? null;
  const evidenceApprovedISO = e.evidenceApprovedAt?.toISOString() ?? null;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <header>
        <Link
          href="/app"
          className="inline-flex items-center gap-1 text-[12px] text-ink-mute hover:text-ink"
        >
          <ArrowLeft size={13} />
          Engagements
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
                aria-hidden
              />
              <span
                className={`text-[11px] font-medium uppercase tracking-wider ${STATUS_TEXT[status]}`}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-[44px] leading-tight font-medium text-ink">
              {e.organizationName}
            </h1>
            <p className="mt-1 text-[13px] text-ink-mute">
              {[e.auditStage, e.contractNumber, e.clientReference]
                .filter(Boolean)
                .map((s, i, arr) => (
                  <span key={i}>
                    <span
                      className={
                        i === 0 ? "" : i === 2 ? "font-mono" : "font-mono"
                      }
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-ink-faint mx-2">·</span>
                    )}
                  </span>
                ))}
            </p>
          </div>
        </div>
        <StatusTimeline status={status} />
      </header>

      {/* Client + Audit. 2-col grid is permanent — never reflow when one collapses. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        <Section
          id="section-client"
          icon={<Building2 size={16} />}
          eyebrow="Client"
          title="Who they are"
          subtitle="Auto-extracted from the QMS. Click any field to refine."
          headerSlot={<ApprovalChip approvedAt={clientApprovedISO} />}
          locked={clientLocked}
        >
          <div className="space-y-5">
            <EditableField
              engagementId={e.id}
              field="organizationName"
              initialValue={e.organizationName}
              label="Organization name"
              locked={clientLocked}
            />
            <EditableField
              engagementId={e.id}
              field="postalAddress"
              initialValue={e.postalAddress}
              label="Postal address"
              multiline
              locked={clientLocked}
            />
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                engagementId={e.id}
                field="contactPerson"
                initialValue={e.contactPerson}
                label="Contact person"
                locked={clientLocked}
              />
              <EditableField
                engagementId={e.id}
                field="contactDesignation"
                initialValue={e.contactDesignation}
                label="Designation"
                locked={clientLocked}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                engagementId={e.id}
                field="contactNumber"
                initialValue={e.contactNumber}
                label="Phone"
                locked={clientLocked}
              />
              <EditableField
                engagementId={e.id}
                field="contactEmail"
                initialValue={e.contactEmail}
                label="Email"
                locked={clientLocked}
              />
            </div>
            <EditableField
              engagementId={e.id}
              field="auditScope"
              initialValue={e.auditScope}
              label="Audit scope"
              multiline
              locked={clientLocked}
            />
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                engagementId={e.id}
                field="employeeCount"
                initialValue={e.employeeCount}
                label="Employees"
                locked={clientLocked}
              />
              <EditableField
                engagementId={e.id}
                field="iafCode"
                initialValue={e.iafCode}
                label="IAF / NACE code"
                locked={clientLocked}
              />
            </div>
            <SectionApprovalFooter
              engagementId={e.id}
              section="client"
              approvedAt={clientApprovedISO}
            />
          </div>
        </Section>

        <Section
          id="section-audit"
          icon={<ClipboardList size={16} />}
          eyebrow="Audit"
          title="The engagement"
          subtitle="What you, the auditor, bring to the file."
          headerSlot={<ApprovalChip approvedAt={auditApprovedISO} />}
          locked={auditLocked}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                engagementId={e.id}
                field="clientReference"
                initialValue={e.clientReference}
                label="Client reference"
                placeholder="2026/ABC/001"
                locked={auditLocked}
              />
              <EditableField
                engagementId={e.id}
                field="contractNumber"
                initialValue={e.contractNumber}
                label="Contract no."
                placeholder="ARS-2026-0042"
                locked={auditLocked}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                engagementId={e.id}
                field="intimationDate"
                initialValue={e.intimationDate}
                label="Intimation date"
                placeholder="2026-05-08"
                locked={auditLocked}
              />
              <EditableField
                engagementId={e.id}
                field="auditDateRange"
                initialValue={e.auditDateRange}
                label="Audit dates"
                placeholder="6/12-15/2026"
                locked={auditLocked}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                engagementId={e.id}
                field="auditManDays"
                initialValue={e.auditManDays}
                label="Man-days"
                placeholder="4"
                locked={auditLocked}
              />
              <label className="block">
                <span className="block mb-1.5 eyebrow">Stage</span>
                <StageSelectClient
                  engagementId={e.id}
                  initialValue={e.auditStage}
                  locked={auditLocked}
                />
              </label>
            </div>
            <AuditTeamEditor
              engagementId={e.id}
              initialJson={e.auditTeamJson}
              locked={auditLocked}
            />
            <SectionApprovalFooter
              engagementId={e.id}
              section="audit"
              approvedAt={auditApprovedISO}
            />
          </div>
        </Section>
      </div>

      {/* Evidence — always rendered so the capture/upload affordances are
          discoverable even when the gallery is empty. */}
      <Section
        icon={<Camera size={16} />}
        eyebrow="Evidence"
        title={
          e.evidence.length === 0
            ? "On-site captures"
            : `On-site captures (${e.evidence.length})`
        }
        subtitle="Photos from the audit. AI labels each shot — click any title to edit."
        full
        locked={evidenceLocked}
        headerSlot={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ApprovalChip approvedAt={evidenceApprovedISO} />
            {!evidenceLocked && (
              <>
                <UploadEvidenceButton engagementId={e.id} />
                <CaptureButton
                  engagementId={e.id}
                  count={e.evidence.length}
                />
              </>
            )}
          </div>
        }
      >
        {e.evidence.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-paper-soft flex items-center justify-center">
              <Camera size={16} className="text-ink-mute" />
            </div>
            <p className="text-sm text-ink-mute">No evidence yet.</p>
            <p className="mt-1 text-[12px] text-ink-faint">
              Use <span className="font-medium text-ink-mute">Upload evidence</span>{" "}
              for files on this device, or{" "}
              <span className="font-medium text-ink-mute">Capture evidence</span>{" "}
              to scan a QR onto your phone.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {e.evidence.map((ev) => (
              <EvidenceItem
                key={ev.id}
                id={ev.id}
                filePath={ev.filePath}
                label={ev.label}
                caption={ev.caption}
                createdAt={ev.createdAt.toISOString()}
                locked={evidenceLocked}
              />
            ))}
          </div>
        )}
        {e.evidence.length > 0 && (
          <SectionApprovalFooter
            engagementId={e.id}
            section="evidence"
            approvedAt={evidenceApprovedISO}
          />
        )}
      </Section>

      {/* Documents */}
      <Section
        icon={<FileStack size={16} />}
        eyebrow="Packet"
        title="Submission documents"
        subtitle="Generate the audit packet. Each .docx opens cleanly in Word for final review."
        full
      >
        <DocumentsPanel
          engagementId={e.id}
          initialDocs={e.documents.map((d) => ({
            kind: d.kind,
            filePath: d.filePath,
            createdAt: d.createdAt.toISOString(),
          }))}
          hasFields={hasFields}
          clientApproved={clientLocked}
          auditApproved={auditLocked}
          auditStage={e.auditStage}
        />
      </Section>

      <DangerZone engagementId={e.id} orgName={e.organizationName} />
    </div>
  );
}

function Section({
  id,
  icon,
  eyebrow,
  title,
  subtitle,
  children,
  full,
  headerSlot,
  locked,
}: {
  id?: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  full?: boolean;
  headerSlot?: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <section id={id} className={full ? "lg:col-span-2" : ""}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-navy/10 text-navy translate-y-[3px]">
            {icon}
          </span>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="font-serif text-[24px] leading-tight font-medium text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-[13px] text-ink-mute">{subtitle}</p>
            )}
          </div>
        </div>
        {headerSlot && <div className="shrink-0 mt-1">{headerSlot}</div>}
      </header>
      <div
        className={`card p-6 transition-colors ${
          locked ? "border-l-2 border-l-status-done/60" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
