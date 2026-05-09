"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileSearch, Sparkles } from "lucide-react";

type ExtractedFields = {
  organizationName: string;
  postalAddress: string;
  auditSite: string;
  contactPerson: string;
  contactDesignation: string;
  contactNumber: string;
  contactEmail: string;
  auditScope: string;
  employeeCount: string;
  iafCode: string;
  standards: string[];
};

type FieldKey = keyof Omit<ExtractedFields, "standards"> | "standards";

const TYPICAL_HUMAN_SECONDS = 4 * 3600 + 12 * 60; // 4h 12m
const MIN_CHOREOGRAPHY_MS = 5400;

// Card reveal schedule. Order matters — these animate in sequence.
const SCHEDULE: { key: FieldKey; label: string; landAt: number; lines: 1 | 2 | 3 }[] = [
  { key: "organizationName",   label: "Organization name",   landAt:  450, lines: 1 },
  { key: "postalAddress",      label: "Postal address",      landAt:  950, lines: 2 },
  { key: "auditSite",          label: "Audit site",          landAt: 1350, lines: 1 },
  { key: "contactPerson",      label: "Contact person",      landAt: 1750, lines: 1 },
  { key: "contactDesignation", label: "Designation",         landAt: 2050, lines: 1 },
  { key: "contactNumber",      label: "Phone",               landAt: 2350, lines: 1 },
  { key: "contactEmail",       label: "Email",               landAt: 2600, lines: 1 },
  { key: "auditScope",         label: "Audit scope",         landAt: 3000, lines: 3 },
  { key: "employeeCount",      label: "Employees",           landAt: 3900, lines: 1 },
  { key: "iafCode",            label: "IAF / NACE code",     landAt: 4200, lines: 1 },
  { key: "standards",          label: "Standards",           landAt: 4600, lines: 1 },
];

function formatElapsed(ms: number) {
  const total = Math.max(0, ms);
  const seconds = total / 1000;
  return seconds.toFixed(2);
}

function formatSavedFor(savedSec: number) {
  const h = Math.floor(savedSec / 3600);
  const m = Math.floor((savedSec % 3600) / 60);
  const s = Math.floor(savedSec % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ExtractionScreen({
  file,
  onCancel,
}: {
  file: File;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [fields, setFields] = useState<ExtractedFields | null>(null);
  const [engagementId, setEngagementId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"running" | "complete">("running");
  const startRef = useRef<number>(performance.now());
  const fetchedRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kick off the upload + extraction once.
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fd = new FormData();
    fd.append("qms", file);
    fetch("/api/engagement/new", { method: "POST", body: fd })
      .then(async (res) => {
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(j.error || `Upload failed (${res.status})`);
        }
        return j;
      })
      .then((j: { id: string; fields?: ExtractedFields }) => {
        setEngagementId(j.id);
        if (j.fields) setFields(j.fields);
      })
      .catch((err: Error) => setError(err.message));
  }, [file]);

  // Drive the elapsed counter at ~30fps.
  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    const tick = () => {
      setElapsedMs(performance.now() - startRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Once both the fetch is done AND the choreography has had its minimum run
  // time, transition to "complete" → brief celebration → redirect.
  useEffect(() => {
    if (!engagementId) return;
    const now = performance.now();
    const elapsed = now - startRef.current;
    const wait = Math.max(0, MIN_CHOREOGRAPHY_MS - elapsed);
    const t1 = setTimeout(() => {
      setPhase("complete");
      redirectTimerRef.current = setTimeout(() => {
        router.push(`/audit/${engagementId}`);
      }, 850);
    }, wait);
    return () => {
      clearTimeout(t1);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [engagementId, router]);

  const elapsedDisplay = useMemo(() => {
    if (phase === "complete") {
      return formatElapsed(Math.max(elapsedMs, MIN_CHOREOGRAPHY_MS));
    }
    return formatElapsed(elapsedMs);
  }, [elapsedMs, phase]);

  const savedSec = Math.max(
    0,
    TYPICAL_HUMAN_SECONDS - Math.floor(elapsedMs / 1000)
  );

  const fileSizeKb = Math.round(file.size / 1024);

  if (error) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="eyebrow mb-2 !text-status-active">Extraction failed</p>
        <h1 className="font-serif text-[28px] text-ink leading-tight">
          {error}
        </h1>
        <button onClick={onCancel} className="btn-ghost mt-6">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero counter */}
      <div className="text-center mb-10">
        <p className="eyebrow mb-3 inline-flex items-center gap-2">
          <FileSearch size={12} />
          Reading {file.name} · {fileSizeKb} KB
        </p>
        <div className="flex items-baseline justify-center gap-6 flex-wrap">
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-ink-faint font-medium">
              Typical draft time
            </p>
            <p className="font-serif text-[40px] leading-none text-ink-faint line-through decoration-status-active/60 decoration-[2px]">
              4h 12m
            </p>
          </div>
          <span className="font-serif text-[28px] text-ink-faint -translate-y-1">
            →
          </span>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-navy-soft font-medium">
              {phase === "complete" ? "Done in" : "Observer"}
            </p>
            <p className="font-serif text-[64px] leading-none font-medium text-navy tabular-nums">
              0:{elapsedDisplay}
              <span className="text-[28px] text-ink-faint ml-1">s</span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-ink-mute">
          {phase === "complete" ? (
            <span className="inline-flex items-center gap-1.5 text-status-done">
              <CheckCircle2 size={14} />
              Stage&nbsp;1 packet ready — opening engagement…
            </span>
          ) : (
            <>
              Time saved so far ·{" "}
              <span className="font-medium text-ink">
                {formatSavedFor(savedSec)}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Field cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SCHEDULE.map((entry) => (
          <FieldCard
            key={entry.key}
            label={entry.label}
            value={resolveValue(entry.key, fields)}
            lines={entry.lines}
            landAt={entry.landAt}
          />
        ))}
      </div>

      {/* Footer tally */}
      <div className="mt-10 text-center text-[12px] text-ink-faint">
        <span>Quality manual fully parsed</span>
        <span className="mx-3">·</span>
        <span>{SCHEDULE.length} fields extracted</span>
        <span className="mx-3">·</span>
        <span>Stage&nbsp;1 packet drafting next</span>
      </div>
    </div>
  );
}

function resolveValue(
  key: FieldKey,
  fields: ExtractedFields | null
): string | null {
  if (!fields) return null;
  if (key === "standards") {
    return fields.standards?.length ? fields.standards.join(" · ") : null;
  }
  const v = fields[key];
  return v && v.trim() !== "" ? v : null;
}

function FieldCard({
  label,
  value,
  lines,
  landAt,
}: {
  label: string;
  value: string | null;
  lines: 1 | 2 | 3;
  landAt: number;
}) {
  const [landed, setLanded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLanded(true), landAt);
    return () => clearTimeout(t1);
  }, [landAt]);

  // Reveal the value the moment the card has landed AND the value exists.
  useEffect(() => {
    if (!landed) return;
    if (value === null) return;
    // Tiny delay so the "found" pulse reads before the value streams in.
    const t = setTimeout(() => setRevealed(true), 180);
    return () => clearTimeout(t);
  }, [landed, value]);

  return (
    <div
      className={`card p-4 ${landed ? "card-land" : "opacity-0"}`}
      style={landed ? undefined : { transform: "translateY(8px)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10.5px] uppercase tracking-wider text-ink-faint font-medium">
          {label}
        </p>
        {revealed ? (
          <CheckCircle2
            size={12}
            className="text-status-done shrink-0"
            aria-hidden
          />
        ) : landed ? (
          <Sparkles
            size={12}
            className="text-navy-bright shrink-0 animate-pulse"
            aria-hidden
          />
        ) : null}
      </div>

      {revealed ? (
        <p
          className={`value-stream text-[13px] leading-snug text-ink ${
            lines === 3 ? "line-clamp-4" : ""
          }`}
        >
          {value}
        </p>
      ) : (
        <div className="space-y-1.5" aria-hidden>
          <div
            className="skeleton-line"
            style={{ height: 9, width: lines === 1 ? "70%" : "92%" }}
          />
          {lines >= 2 && (
            <div
              className="skeleton-line"
              style={{ height: 9, width: lines === 2 ? "55%" : "84%" }}
            />
          )}
          {lines === 3 && (
            <div
              className="skeleton-line"
              style={{ height: 9, width: "62%" }}
            />
          )}
          {landed && (
            <span className="text-[11px] text-ink-faint inline-flex items-center gap-1">
              extracting
              <span className="blink-caret">▍</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
