import Link from "next/link";
import { ArrowUpRight, FileText, Image as ImageIcon, Plus } from "lucide-react";
import { db } from "@/lib/db";
import {
  STATUS_DOT,
  STATUS_LABEL,
  STATUS_TEXT,
  type Status,
} from "@/lib/status";

export const dynamic = "force-dynamic";

const STATUS_ORDER: Status[] = [
  "extracting",
  "stage1_in_progress",
  "stage2_in_progress",
  "surveillance_1_in_progress",
  "surveillance_2_in_progress",
  "recert_due",
  "stage1_done",
  "stage2_done",
  "surveillance_1_done",
  "surveillance_2_done",
  "awaiting_qms",
  "cert_issued",
];

export default async function Home() {
  const engagements = await db.engagement.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { evidence: true, documents: true } } },
  });

  engagements.sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status as Status) -
      STATUS_ORDER.indexOf(b.status as Status)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[40px] leading-tight font-medium text-ink">
          Engagements
        </h1>
        <p className="mt-1.5 text-sm text-ink-mute">
          {engagements.length}{" "}
          {engagements.length === 1 ? "active audit" : "active audits"} across
          your practice.
        </p>
      </div>

      {engagements.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-line">
            {engagements.map((e) => {
              const status = e.status as Status;
              return (
                <li key={e.id}>
                  <Link
                    href={`/audit/${e.id}`}
                    className="group flex items-center gap-6 px-6 py-5 hover:bg-paper-soft transition-colors"
                  >
                    <div className="flex-1 min-w-0">
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
                        n={e._count.evidence}
                        label="evidence"
                      />
                      <Stat
                        icon={<FileText size={13} />}
                        n={e._count.documents}
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
    </div>
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

function EmptyState() {
  return (
    <div className="card p-16 text-center">
      <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-paper-soft flex items-center justify-center">
        <FileText size={20} className="text-ink-mute" />
      </div>
      <h2 className="font-serif text-2xl text-ink">No audits yet</h2>
      <p className="mt-2 text-sm text-ink-mute max-w-md mx-auto">
        Drop a client&apos;s QMS PDF and Observer will turn it into a Stage-1
        packet in about five seconds.
      </p>
      <Link href="/audit/new" className="btn-primary mt-6 inline-flex">
        <Plus size={16} />
        Start your first audit
      </Link>
    </div>
  );
}
