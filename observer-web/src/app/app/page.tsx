import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Status } from "@/lib/status";
import { EngagementsList, type EngagementRow } from "./EngagementsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const engagements = await db.engagement.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { evidence: true, documents: true } } },
  });

  const rows: EngagementRow[] = engagements.map((e) => ({
    id: e.id,
    organizationName: e.organizationName,
    status: e.status as Status,
    contactPerson: e.contactPerson,
    contractNumber: e.contractNumber,
    clientReference: e.clientReference,
    intimationDate: e.intimationDate,
    auditDateRange: e.auditDateRange,
    updatedAt: e.updatedAt.toISOString(),
    evidenceCount: e._count.evidence,
    documentCount: e._count.documents,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[40px] leading-tight font-medium text-ink">
          Engagements
        </h1>
        <p className="mt-1.5 text-sm text-ink-mute">
          {rows.length} {rows.length === 1 ? "active audit" : "active audits"}{" "}
          across your practice.
        </p>
      </div>

      {rows.length === 0 ? <EmptyState /> : <EngagementsList rows={rows} />}
    </div>
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
