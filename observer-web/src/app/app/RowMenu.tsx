"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteEngagement } from "../audit/[id]/actions";

export function RowMenu({
  engagementId,
  orgName,
}: {
  engagementId: string;
  orgName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onDelete = () => {
    if (
      !confirm(
        `Delete "${orgName}" and all of its evidence and documents?\n\nThis can't be undone.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteEngagement(engagementId);
      router.refresh();
    });
  };

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${orgName}`}
        className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-paper-soft transition ${
          open ? "bg-paper-soft text-ink" : "opacity-0 group-hover:opacity-100"
        } focus:opacity-100 focus:outline-none`}
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MoreVertical size={14} />
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-20 w-48 rounded-[var(--radius)] bg-paper-card ring-1 ring-line shadow-[var(--shadow-lift)] py-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            disabled={pending}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-[13px] text-ink-mute hover:bg-paper-soft hover:text-status-active transition-colors disabled:opacity-50"
          >
            <Trash2 size={13} />
            Delete engagement
          </button>
        </div>
      )}
    </div>
  );
}
