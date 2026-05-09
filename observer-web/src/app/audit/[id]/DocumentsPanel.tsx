"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Check,
  Download,
  FileText,
  Loader2,
  RotateCw,
  Sparkles,
} from "lucide-react";

const KIND_LABEL: Record<string, string> = {
  stage1_plan: "Stage-1 Audit Plan",
  stage1_intimation: "Stage-1 Intimation Letter",
  attendance: "Attendance Sheet",
  stage1_report: "Stage-1 Audit Report",
  stage2_plan: "Stage-2 Audit Plan",
  stage2_intimation: "Stage-2 Intimation Letter",
  stage2_report: "Stage-2 Audit Report",
};

const STAGE1_KINDS = [
  "stage1_plan",
  "stage1_intimation",
  "attendance",
  "stage1_report",
];
const STAGE2_KINDS = ["stage2_plan", "stage2_intimation", "stage2_report"];

type GenerateStage = "1" | "2" | "both";

type StageContext = {
  primaryKey: GenerateStage;
  primaryLabel: string;
  primaryKinds: string[];
  secondaryKey: GenerateStage | null;
  secondaryLabel: string | null;
  secondaryKinds: string[];
  noteIfMapped: string | null;
};

// Map the engagement's auditStage value to the right packet to generate.
// Surveillance + Recert engagements re-use the Stage-2 templates for now.
function getStageContext(auditStage: string): StageContext {
  switch (auditStage) {
    case "Stage 1":
      return {
        primaryKey: "1",
        primaryLabel: "Stage 1",
        primaryKinds: STAGE1_KINDS,
        secondaryKey: "2",
        secondaryLabel: "Stage 2",
        secondaryKinds: STAGE2_KINDS,
        noteIfMapped: null,
      };
    case "Stage 2":
      return {
        primaryKey: "2",
        primaryLabel: "Stage 2",
        primaryKinds: STAGE2_KINDS,
        secondaryKey: "1",
        secondaryLabel: "Stage 1",
        secondaryKinds: STAGE1_KINDS,
        noteIfMapped: null,
      };
    case "Surveillance 1":
    case "Surveillance 2":
    case "Recertification":
      return {
        primaryKey: "2",
        primaryLabel: auditStage,
        primaryKinds: STAGE2_KINDS,
        secondaryKey: null,
        secondaryLabel: null,
        secondaryKinds: [],
        noteIfMapped: `${auditStage} packets reuse the Stage-2 template set.`,
      };
    default:
      return {
        primaryKey: "1",
        primaryLabel: "Stage 1",
        primaryKinds: STAGE1_KINDS,
        secondaryKey: "2",
        secondaryLabel: "Stage 2",
        secondaryKinds: STAGE2_KINDS,
        noteIfMapped: null,
      };
  }
}

type ExistingDoc = { kind: string; filePath: string; createdAt: string };

export function DocumentsPanel({
  engagementId,
  initialDocs,
  hasFields,
  clientApproved,
  auditApproved,
  auditStage,
}: {
  engagementId: string;
  initialDocs: ExistingDoc[];
  hasFields: boolean;
  clientApproved?: boolean;
  auditApproved?: boolean;
  auditStage: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingStage, setPendingStage] = useState<GenerateStage | null>(null);

  const ctx = getStageContext(auditStage);
  const docByKind = new Map(initialDocs.map((d) => [d.kind, d]));
  const hasGenerated = initialDocs.length > 0;

  const unconfirmed: string[] = [];
  if (hasFields && clientApproved === false) unconfirmed.push("Client info");
  if (hasFields && auditApproved === false) unconfirmed.push("Audit info");

  const generate = (stage: GenerateStage) => {
    setError(null);
    setPendingStage(stage);
    startTransition(async () => {
      const res = await fetch(`/api/engagement/${engagementId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      setPendingStage(null);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || `Generation failed (${res.status})`);
        return;
      }
      router.refresh();
    });
  };

  const Warning = unconfirmed.length > 0 && (
    <div className="mb-5 inline-flex items-start gap-2 rounded-[var(--radius-sm)] bg-status-await/15 px-3 py-2 text-[12px] text-ink-2">
      <AlertTriangle size={13} className="text-status-await mt-0.5 shrink-0" />
      <span>
        Heads up:{" "}
        <span className="font-medium">{unconfirmed.join(" and ")}</span>{" "}
        {unconfirmed.length === 1 ? "isn't" : "aren't"} confirmed yet — you
        can still generate, but the packet will reflect unverified values.
      </span>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────
  // STATE: not generated yet
  // ──────────────────────────────────────────────────────────────────
  if (!hasGenerated) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="not-generated"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
        {Warning}

        <div className="rounded-[var(--radius-lg)] bg-paper-soft/50 ring-1 ring-line p-8 text-center">
          <p className="eyebrow !text-navy/70 mb-2">
            Ready to assemble the packet
          </p>
          <h3 className="font-serif text-[26px] leading-tight text-ink">
            Generate the {ctx.primaryLabel} packet
          </h3>
          <p className="mt-2 text-[13px] text-ink-mute">
            {ctx.primaryKinds.length} documents · about 5 seconds
          </p>

          <button
            type="button"
            disabled={!hasFields || pending}
            onClick={() => generate(ctx.primaryKey)}
            className="btn-primary mt-5 !px-5 !py-3 !text-[15px] mx-auto"
          >
            {pendingStage === ctx.primaryKey ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {pendingStage === ctx.primaryKey
              ? "Generating…"
              : `Generate ${ctx.primaryLabel} packet`}
          </button>

          {ctx.secondaryKey && (
            <p className="mt-4 text-[12px] text-ink-mute">
              or{" "}
              <button
                type="button"
                onClick={() => generate(ctx.secondaryKey!)}
                disabled={!hasFields || pending}
                className="underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink-mute disabled:opacity-50"
              >
                generate the {ctx.secondaryLabel} packet
              </button>{" "}
              instead
            </p>
          )}

          {ctx.noteIfMapped && (
            <p className="mt-3 text-[11px] italic text-ink-faint">
              {ctx.noteIfMapped}
            </p>
          )}
        </div>

        {/* Preview list — what they'll get */}
        <div className="mt-6">
          <p className="eyebrow mb-2.5">{ctx.primaryLabel} contains</p>
          <ul className="rounded-[var(--radius)] ring-1 ring-line bg-paper-card/60 divide-y divide-line">
            {ctx.primaryKinds.map((kind) => (
              <li
                key={kind}
                className="flex items-center gap-3 px-4 py-3 opacity-60"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-paper-soft text-ink-faint">
                  <FileText size={14} />
                </span>
                <p className="text-[13px] text-ink-mute">{KIND_LABEL[kind]}</p>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="mt-4 rounded-[var(--radius-sm)] bg-status-active/15 px-3 py-2 text-[13px] text-status-active">
            {error}
          </p>
        )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // STATE: at least one packet already generated
  // ──────────────────────────────────────────────────────────────────
  const generatedKinds = new Set(initialDocs.map((d) => d.kind));
  const primaryDone = ctx.primaryKinds.every((k) => generatedKinds.has(k));
  const secondaryDone =
    ctx.secondaryKinds.length > 0 &&
    ctx.secondaryKinds.every((k) => generatedKinds.has(k));

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key="generated"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
      {Warning}

      <div className="rounded-[var(--radius-lg)] bg-status-done/8 ring-1 ring-status-done/25 p-5 sm:p-6 mb-6 flex items-start sm:items-center gap-4 flex-wrap">
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-status-done/15 text-status-done shrink-0">
          <Check size={18} strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[18px] text-ink">Ready to deliver</p>
          <p className="text-[12px] text-ink-mute mt-0.5">
            {initialDocs.length} document{initialDocs.length === 1 ? "" : "s"}{" "}
            in the packet · last generated{" "}
            {new Date(
              Math.max(...initialDocs.map((d) => +new Date(d.createdAt)))
            ).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/api/engagement/${engagementId}/zip`}
            className="btn-primary !bg-status-done hover:!bg-status-done/90"
          >
            <Download size={15} />
            Download all (.zip)
          </a>
          <button
            type="button"
            onClick={() => generate(ctx.primaryKey)}
            disabled={pending}
            className="btn-secondary"
          >
            {pendingStage === ctx.primaryKey ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCw size={13} />
            )}
            Regenerate {ctx.primaryLabel}
          </button>
        </div>
      </div>

      <DocList
        kinds={ctx.primaryKinds}
        title={ctx.primaryLabel}
        docByKind={docByKind}
        ctaIfMissing={
          !primaryDone
            ? {
                label: `Generate ${ctx.primaryLabel}`,
                onClick: () => generate(ctx.primaryKey),
                pending: pendingStage === ctx.primaryKey,
              }
            : null
        }
      />

      {ctx.secondaryKey && (
        <DocList
          className="mt-6"
          kinds={ctx.secondaryKinds}
          title={ctx.secondaryLabel!}
          docByKind={docByKind}
          ctaIfMissing={
            !secondaryDone
              ? {
                  label: `Generate ${ctx.secondaryLabel}`,
                  onClick: () => generate(ctx.secondaryKey!),
                  pending: pendingStage === ctx.secondaryKey,
                }
              : null
          }
        />
      )}

      {error && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-status-active/15 px-3 py-2 text-[13px] text-status-active">
          {error}
        </p>
      )}
      </motion.div>
    </AnimatePresence>
  );
}

function DocList({
  kinds,
  title,
  docByKind,
  className = "",
  ctaIfMissing,
}: {
  kinds: string[];
  title: string;
  docByKind: Map<string, ExistingDoc>;
  className?: string;
  ctaIfMissing?: {
    label: string;
    onClick: () => void;
    pending: boolean;
  } | null;
}) {
  return (
    <div className={className}>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="eyebrow">{title}</p>
        {ctaIfMissing && (
          <button
            type="button"
            onClick={ctaIfMissing.onClick}
            disabled={ctaIfMissing.pending}
            className="btn-ghost !text-[12px] !text-link"
          >
            {ctaIfMissing.pending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Sparkles size={11} />
            )}
            {ctaIfMissing.label}
          </button>
        )}
      </div>
      <ul className="rounded-[var(--radius)] ring-1 ring-line bg-paper-card divide-y divide-line">
        {kinds.map((kind) => {
          const doc = docByKind.get(kind);
          return (
            <li
              key={kind}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${
                    doc
                      ? "bg-status-done/10 text-status-done"
                      : "bg-paper-soft text-ink-faint"
                  }`}
                >
                  <FileText size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {KIND_LABEL[kind]}
                  </p>
                  <p className="text-[11px] text-ink-faint">
                    {doc
                      ? `Generated ${new Date(doc.createdAt).toLocaleString()}`
                      : "Not yet generated"}
                  </p>
                </div>
              </div>
              {doc ? (
                <a
                  href={`/api/file?path=${encodeURIComponent(doc.filePath)}&download=1`}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-link hover:underline"
                >
                  <Download size={12} />
                  Download
                </a>
              ) : (
                <span className="text-[11px] text-ink-faint">—</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
