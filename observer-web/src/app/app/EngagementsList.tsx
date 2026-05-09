"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Search,
  X,
} from "lucide-react";
import {
  STATUS_DOT,
  STATUS_LABEL,
  STATUS_TEXT,
  type Status,
} from "@/lib/status";

export type EngagementRow = {
  id: string;
  organizationName: string;
  status: Status;
  contactPerson: string;
  contractNumber: string;
  clientReference: string;
  intimationDate: string;
  auditDateRange: string;
  updatedAt: string;
  evidenceCount: number;
  documentCount: number;
};

type GroupKey =
  | "active"
  | "awaiting_qms"
  | "stage1_ready"
  | "stage2_ready"
  | "certified"
  | "surveillance"
  | "recert_due";

const GROUP_LABEL: Record<GroupKey, string> = {
  active: "Active",
  awaiting_qms: "Awaiting QMS",
  stage1_ready: "Stage 1 ready",
  stage2_ready: "Stage 2 ready",
  certified: "Certified",
  surveillance: "Surveillance",
  recert_due: "Recert due",
};

// Status dot color per group, drawn from the same status palette used on
// engagement cards so the filter row reads as the same visual language.
const GROUP_DOT: Record<GroupKey, string> = {
  active: "bg-status-active",
  awaiting_qms: "bg-status-grey",
  stage1_ready: "bg-status-done",
  stage2_ready: "bg-status-done",
  surveillance: "bg-status-done",
  recert_due: "bg-status-await",
  certified: "bg-status-cert",
};

const GROUP_ORDER: GroupKey[] = [
  "active",
  "awaiting_qms",
  "stage1_ready",
  "stage2_ready",
  "surveillance",
  "recert_due",
  "certified",
];

function groupOf(status: Status): GroupKey | null {
  if (status === "awaiting_qms") return "awaiting_qms";
  if (status === "extracting" || status.endsWith("_in_progress"))
    return "active";
  if (status === "stage1_done") return "stage1_ready";
  if (status === "stage2_done") return "stage2_ready";
  if (status === "cert_issued") return "certified";
  if (status === "surveillance_1_done" || status === "surveillance_2_done")
    return "surveillance";
  if (status === "recert_due") return "recert_due";
  return null;
}

type SortKey = "updated" | "name_az" | "name_za" | "intimation" | "audit_date";

const SORT_LABEL: Record<SortKey, string> = {
  updated: "Recently updated",
  name_az: "Name (A → Z)",
  name_za: "Name (Z → A)",
  intimation: "Intimation date",
  audit_date: "Audit date",
};

const SORT_ORDER: SortKey[] = [
  "updated",
  "name_az",
  "name_za",
  "intimation",
  "audit_date",
];

const STATUS_RANK: Record<Status, number> = {
  extracting: 0,
  stage1_in_progress: 1,
  stage2_in_progress: 2,
  surveillance_1_in_progress: 3,
  surveillance_2_in_progress: 4,
  recert_due: 5,
  stage1_done: 6,
  stage2_done: 7,
  surveillance_1_done: 8,
  surveillance_2_done: 9,
  awaiting_qms: 10,
  cert_issued: 11,
};

// Free-form date parser. Pulls the first plausible date out of strings like
// "2026-05-08", "6/12-15/2026", "8/4-9/2025". Returns Number.MAX_SAFE_INTEGER
// for anything we can't parse, so blanks sort last on ascending date sorts.
function parseFirstDate(s: string): number {
  if (!s) return Number.MAX_SAFE_INTEGER;
  const iso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const t = Date.parse(
      `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`
    );
    if (!Number.isNaN(t)) return t;
  }
  const mdy = s.match(/(\d{1,2})\/(\d{1,2})(?:-\d{1,2})?\/(\d{2,4})/);
  if (mdy) {
    const yr = mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3];
    const t = Date.parse(
      `${yr}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`
    );
    if (!Number.isNaN(t)) return t;
  }
  return Number.MAX_SAFE_INTEGER;
}

function sortEngagements(
  rows: EngagementRow[],
  sort: SortKey
): EngagementRow[] {
  const arr = [...rows];
  switch (sort) {
    case "name_az":
      arr.sort((a, b) =>
        a.organizationName.localeCompare(b.organizationName, undefined, {
          sensitivity: "base",
        })
      );
      break;
    case "name_za":
      arr.sort((a, b) =>
        b.organizationName.localeCompare(a.organizationName, undefined, {
          sensitivity: "base",
        })
      );
      break;
    case "intimation":
      arr.sort(
        (a, b) =>
          parseFirstDate(a.intimationDate) - parseFirstDate(b.intimationDate)
      );
      break;
    case "audit_date":
      arr.sort(
        (a, b) =>
          parseFirstDate(a.auditDateRange) - parseFirstDate(b.auditDateRange)
      );
      break;
    case "updated":
    default:
      arr.sort((a, b) => {
        const t = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
        if (t !== 0) return t;
        return STATUS_RANK[a.status] - STATUS_RANK[b.status];
      });
      break;
  }
  return arr;
}

export function EngagementsList({ rows }: { rows: EngagementRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [groups, setGroups] = useState<Set<GroupKey>>(new Set());

  // Search applies to both the per-group counts and the visible list, so the
  // numbers next to each filter reflect what clicking it would yield.
  const searched = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = [
        r.organizationName,
        r.contactPerson,
        r.contractNumber,
        r.clientReference,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  const groupCounts = useMemo(() => {
    const counts: Record<GroupKey, number> = {
      active: 0,
      awaiting_qms: 0,
      stage1_ready: 0,
      stage2_ready: 0,
      certified: 0,
      surveillance: 0,
      recert_due: 0,
    };
    for (const r of searched) {
      const g = groupOf(r.status);
      if (g) counts[g] += 1;
    }
    return counts;
  }, [searched]);

  const filtered = useMemo(() => {
    let arr = searched;
    if (groups.size > 0) {
      arr = arr.filter((r) => {
        const g = groupOf(r.status);
        return g !== null && groups.has(g);
      });
    }
    return sortEngagements(arr, sort);
  }, [searched, sort, groups]);

  const toggleGroup = (g: GroupKey) => {
    setGroups((cur) => {
      const next = new Set(cur);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const clear = () => {
    setQ("");
    setGroups(new Set());
    setSort("updated");
  };

  const filtersActive = q !== "" || groups.size > 0 || sort !== "updated";

  return (
    <div>
      <div className="card p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search organization, contact, or contract no.…"
              className="w-full bg-paper-soft/60 ring-1 ring-line rounded-md pl-9 pr-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-navy-bright/40 focus:bg-paper-card"
            />
          </div>
          <SortDropdown value={sort} onChange={setSort} />
          {filtersActive && (
            <button
              type="button"
              onClick={clear}
              className="btn-ghost text-[12px]"
              title="Clear filters"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        <div className="mt-4 pt-3.5 border-t border-line/70 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="eyebrow text-[10px] tracking-[0.16em]">Status</span>
          {GROUP_ORDER.map((g, i) => {
            const active = groups.has(g);
            const count = groupCounts[g];
            const dim = count === 0 && !active;
            return (
              <span
                key={g}
                className="inline-flex items-baseline gap-x-1.5"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(g)}
                  aria-pressed={active}
                  className={`group inline-flex items-baseline gap-1.5 border-b-2 pb-0.5 transition-colors ${
                    active
                      ? "border-navy-bright text-ink font-medium"
                      : "border-transparent hover:border-line-strong " +
                        (dim ? "text-ink-faint" : "text-ink-mute hover:text-ink")
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full self-center ${
                      GROUP_DOT[g]
                    } ${dim ? "opacity-40" : ""}`}
                    aria-hidden
                  />
                  <span className="text-[13px]">{GROUP_LABEL[g]}</span>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      active
                        ? "text-navy-bright"
                        : dim
                        ? "text-ink-faint"
                        : "text-ink-faint"
                    }`}
                  >
                    {count}
                  </span>
                </button>
                {i < GROUP_ORDER.length - 1 && (
                  <span
                    className="text-ink-faint/50 select-none"
                    aria-hidden
                  >
                    ·
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-ink-mute">
            No engagements match{" "}
            <span className="font-medium text-ink">
              {q ? `"${q}"` : "the current filters"}
            </span>
            .
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clear}
              className="btn-secondary mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((e) => {
              const status = e.status;
              const isActive =
                status === "extracting" || status.endsWith("_in_progress");
              return (
                <li key={e.id}>
                  <Link
                    href={`/audit/${e.id}`}
                    className="group flex items-center gap-6 px-6 py-5 hover:bg-paper-soft transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            STATUS_DOT[status]
                          } ${isActive ? "status-pulse" : ""}`}
                          aria-hidden
                        />
                        <span
                          className={`text-[11px] font-medium uppercase tracking-wider ${STATUS_TEXT[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>
                      <h3 className="font-serif text-[22px] leading-tight font-medium text-ink mt-1.5 group-hover:text-navy transition-colors">
                        {e.organizationName}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-4 text-[13px] text-ink-mute flex-wrap">
                        {e.contactPerson && e.contactPerson !== "—" && (
                          <span>{e.contactPerson}</span>
                        )}
                        {e.auditDateRange && (
                          <span>
                            <span className="text-ink-faint">·</span>{" "}
                            {e.auditDateRange}
                          </span>
                        )}
                        {e.clientReference && (
                          <span className="font-mono text-[12px] text-ink-faint">
                            {e.clientReference}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-6 text-[12px] text-ink-mute">
                      <Stat
                        icon={<ImageIcon size={13} />}
                        n={e.evidenceCount}
                        label="evidence"
                      />
                      <Stat
                        icon={<FileText size={13} />}
                        n={e.documentCount}
                        label="docs"
                      />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-ink-faint group-hover:text-navy group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[12px] text-ink-faint">
        {filtered.length === rows.length
          ? `${rows.length} ${rows.length === 1 ? "engagement" : "engagements"}`
          : `${filtered.length} of ${rows.length} ${
              rows.length === 1 ? "engagement" : "engagements"
            }`}
      </p>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="appearance-none pl-3 pr-8 py-2 text-[13px] bg-paper-card ring-1 ring-line rounded-md text-ink hover:ring-line-strong focus:outline-none focus:ring-navy-bright/40 cursor-pointer"
      >
        {SORT_ORDER.map((s) => (
          <option key={s} value={s}>
            {SORT_LABEL[s]}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </label>
  );
}

function Stat({
  icon,
  n,
  label,
}: {
  icon: React.ReactNode;
  n: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-ink-faint">{icon}</span>
      <span className="tabular-nums font-medium text-ink-2">{n}</span>
      <span className="text-ink-faint">{label}</span>
    </span>
  );
}
