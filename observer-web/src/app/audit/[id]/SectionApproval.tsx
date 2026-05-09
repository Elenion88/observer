"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Lock, Pencil } from "lucide-react";
import { setApproval, type ApprovalSection } from "./actions";

const LABEL: Record<ApprovalSection, string> = {
  client: "Client info",
  audit: "Audit info",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ApprovalChip({ approvedAt }: { approvedAt: string | null }) {
  if (!approvedAt) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-done/10 text-status-done px-2 py-0.5 text-[11px] font-medium">
      <Check size={11} strokeWidth={2.5} />
      Approved
      <span className="text-status-done/70">· {formatTime(approvedAt)}</span>
    </span>
  );
}

export function SectionApprovalFooter({
  engagementId,
  section,
  approvedAt,
}: {
  engagementId: string;
  section: ApprovalSection;
  approvedAt: string | null;
}) {
  const [optimistic, setOptimistic] = useState<string | null>(approvedAt);
  const [pending, startTransition] = useTransition();

  const onApprove = () => {
    startTransition(async () => {
      const res = await setApproval(engagementId, section, true);
      setOptimistic(res.approvedAt);
    });
  };
  const onUnapprove = () => {
    startTransition(async () => {
      const res = await setApproval(engagementId, section, false);
      setOptimistic(res.approvedAt);
    });
  };

  if (optimistic) {
    return (
      <div className="mt-6 pt-5 border-t border-line/70 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-status-done">
          <Lock size={12} />
          {LABEL[section]} confirmed · {formatTime(optimistic)}
        </span>
        <button
          type="button"
          onClick={onUnapprove}
          disabled={pending}
          className="btn-ghost"
        >
          {pending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Pencil size={13} />
          )}
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-5 border-t border-line/70 flex items-center justify-between">
      <span className="text-[12px] text-ink-faint">
        Review the values above. Confirm when accurate.
      </span>
      <button
        type="button"
        onClick={onApprove}
        disabled={pending}
        className="btn-primary !bg-status-done hover:!bg-status-done/90"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Check size={14} strokeWidth={2.5} />
        )}
        Confirm {LABEL[section]}
      </button>
    </div>
  );
}
