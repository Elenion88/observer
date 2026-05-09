"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEvidence, updateEvidenceLabel } from "./actions";

type Props = {
  id: string;
  filePath: string;
  label: string;
  caption?: string;
  createdAt: string;
};

export function EvidenceItem({ id, filePath, label, caption, createdAt }: Props) {
  const [value, setValue] = useState(label);
  const [pending, startTransition] = useTransition();
  const url = `/api/file?path=${encodeURIComponent(filePath)}`;

  const save = () => {
    if (value === label) return;
    startTransition(async () => {
      await updateEvidenceLabel(id, value);
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius)] bg-paper-card ring-1 ring-line shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-paper-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          className="block w-full bg-transparent text-[13px] font-medium text-ink leading-snug focus:outline-none"
        />
        {caption && (
          <p className="mt-1 text-[11px] text-ink-mute">{caption}</p>
        )}
        <div className="mt-1 flex items-center justify-between text-[10px] text-ink-faint">
          <span>{new Date(createdAt).toLocaleString()}</span>
          <span>{pending ? "saving…" : ""}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm("Delete this evidence?")) {
            startTransition(async () => {
              await deleteEvidence(id);
            });
          }
        }}
        className="absolute top-2 right-2 hidden group-hover:inline-flex items-center gap-1 rounded-md bg-paper-card/95 px-2 py-1 text-[11px] font-medium text-ink-mute ring-1 ring-line hover:text-status-active"
      >
        <Trash2 size={11} />
        Delete
      </button>
    </div>
  );
}
