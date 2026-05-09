"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteEvidence, updateEvidenceLabel } from "./actions";
import { registerLabelFlush } from "./pendingLabelSaves";

type Props = {
  id: string;
  filePath: string;
  label: string;
  caption?: string;
  createdAt: string;
  locked?: boolean;
};

export function EvidenceItem({
  id,
  filePath,
  label,
  caption,
  createdAt,
  locked,
}: Props) {
  const [value, setValue] = useState(label);
  const [labelling, setLabelling] = useState(label === "");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const dirtyRef = useRef(false);
  const valueRef = useRef(value);
  const router = useRouter();
  const url = `/api/file?path=${encodeURIComponent(filePath)}`;

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Sync the server label to the input ONLY when the user hasn't dirtied it.
  // The AI label arrives async after upload — we want it to fill in if the
  // user hasn't typed anything, but never overwrite their text.
  useEffect(() => {
    if (!dirtyRef.current && label !== valueRef.current) {
      setValue(label);
    }
    if (label !== "") {
      setLabelling(false);
    }
  }, [label]);

  // Poll for the AI label after upload. The server-side label call runs
  // detached from the request, so we check every second until it lands or
  // we give up (~30s).
  useEffect(() => {
    if (label !== "" || !labelling) return;
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await fetch(`/api/evidence/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { label?: string };
        if (data.label && data.label.length > 0) {
          if (!dirtyRef.current) setValue(data.label);
          setLabelling(false);
          // Refresh the server tree so the prop converges and other parts of
          // the page (e.g. counts) see the label.
          router.refresh();
          return;
        }
      } catch {
        /* transient — keep trying */
      }
      if (attempts < 30 && !cancelled) {
        setTimeout(tick, 1000);
      } else {
        setLabelling(false);
      }
    };
    const t = setTimeout(tick, 1000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [id, label, labelling, router]);

  const save = async () => {
    const v = valueRef.current;
    if (v === label) {
      dirtyRef.current = false;
      return;
    }
    await updateEvidenceLabel(id, v);
    dirtyRef.current = false;
  };

  // Register a flush function so the Confirm Evidence button can persist any
  // unsaved typing before locking the section.
  useEffect(() => {
    return registerLabelFlush(id, async () => {
      if (dirtyRef.current) await save();
    });
    // The save closure reads from refs, so it doesn't need to be a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, label]);

  const onBlur = () => {
    if (!dirtyRef.current) return;
    startTransition(async () => {
      await save();
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    dirtyRef.current = true;
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
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            readOnly={locked}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") inputRef.current?.blur();
            }}
            placeholder={
              locked ? "" : labelling ? "Labelling…" : "Add a label…"
            }
            title={locked ? undefined : "Click to edit"}
            className={`block w-full bg-transparent text-[13px] font-medium text-ink leading-snug pr-5 focus:outline-none focus:bg-paper-soft/40 rounded-sm transition-colors ${
              locked ? "cursor-default" : "cursor-text hover:bg-paper-soft/40"
            }`}
          />
          {!locked &&
            (labelling ? (
              <Loader2
                size={11}
                className="absolute right-1 top-1 text-navy-bright animate-spin"
              />
            ) : (
              <Pencil
                size={11}
                className="absolute right-1 top-1 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              />
            ))}
        </div>
        {caption && (
          <p className="mt-1 text-[11px] text-ink-mute">{caption}</p>
        )}
        <div className="mt-1 flex items-center justify-between text-[10px] text-ink-faint">
          <span>{new Date(createdAt).toLocaleString()}</span>
          <span>
            {pending
              ? "saving…"
              : labelling
              ? (
                  <span className="inline-flex items-center gap-1 text-navy-bright">
                    <Sparkles size={9} />
                    AI labelling
                  </span>
                )
              : ""}
          </span>
        </div>
      </div>
      {!locked && (
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
      )}
    </div>
  );
}
