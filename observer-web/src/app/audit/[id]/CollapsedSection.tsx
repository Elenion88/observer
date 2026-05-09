"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { setApproval, type ApprovalSection } from "./actions";

const SECTION_LABEL: Record<ApprovalSection, string> = {
  client: "Client",
  audit: "Audit",
};

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function CollapsedSection({
  engagementId,
  section,
  approvedAt,
  summaryParts,
}: {
  engagementId: string;
  section: ApprovalSection;
  approvedAt: string;
  summaryParts: (string | null | undefined)[];
}) {
  const [pending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);
  const summary = summaryParts.filter(Boolean);

  const onEdit = () => {
    setHidden(true);
    startTransition(async () => {
      await setApproval(engagementId, section, false);
    });
  };

  if (hidden) return null;

  return (
    <div className="card border-l-2 border-l-status-done/60 px-5 py-4 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-status-done/10 text-status-done shrink-0">
            <Check size={13} strokeWidth={2.5} />
          </span>
          <span className="eyebrow !text-status-done/90 truncate">
            {SECTION_LABEL[section]} · confirmed
          </span>
        </div>
        <span className="text-[11px] text-ink-faint shrink-0">
          {relTime(approvedAt)}
        </span>
      </div>

      {summary.length > 0 ? (
        <ul className="text-[13px] text-ink-mute space-y-0.5 mb-3">
          {summary.map((line, i) => (
            <li
              key={i}
              className={i === 0 ? "text-ink font-medium" : "truncate"}
            >
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] italic text-ink-faint mb-3">
          no fields filled
        </p>
      )}

      <div className="mt-auto pt-2 border-t border-line/60 flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">
          Locked. Edit to change anything.
        </span>
        <button
          type="button"
          onClick={onEdit}
          disabled={pending}
          className="btn-ghost !py-1"
        >
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Pencil size={12} />
          )}
          Edit
        </button>
      </div>
    </div>
  );
}
