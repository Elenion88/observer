"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, ExternalLink } from "lucide-react";

export function EvidenceQR({ engagementId }: { engagementId: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(
      `${window.location.protocol}//${window.location.host}/audit/${engagementId}/capture`
    );
  }, [engagementId]);

  if (!url) return null;

  return (
    <div className="rounded-[var(--radius)] bg-paper-soft/60 ring-1 ring-line/80 p-5 flex items-center gap-5">
      <div className="rounded-md bg-paper-card p-3 ring-1 ring-line">
        <QRCodeSVG
          value={url}
          size={104}
          fgColor="#0f2d4a"
          bgColor="transparent"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-navy">
          <Smartphone size={16} />
          <span className="font-serif text-[18px] font-medium">
            Capture, or share with the auditee
          </span>
        </div>
        <p className="mt-1 text-[13px] text-ink-mute leading-relaxed">
          Scan to open on-site capture, or send the link to the client&apos;s
          team and they upload evidence themselves. Each photo auto-labels and
          lands in the evidence log.
        </p>
        <a
          href={`/audit/${engagementId}/capture`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-link hover:underline"
        >
          Or open here
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
