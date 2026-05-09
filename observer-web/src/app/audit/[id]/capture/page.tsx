import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CaptureClient } from "./CaptureClient";

export const dynamic = "force-dynamic";

export default async function CapturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await db.engagement.findUnique({
    where: { id },
    select: { id: true, organizationName: true },
  });
  if (!e) notFound();

  return (
    <CaptureClient
      engagementId={e.id}
      orgName={e.organizationName}
    />
  );
}
