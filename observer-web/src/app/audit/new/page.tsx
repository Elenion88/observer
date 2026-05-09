"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Loader2, Play, Sparkles } from "lucide-react";

const DEMO_QMS_URL = "/demo/qms-demo.pdf";
const DEMO_QMS_NAME = "NWCR-QSEMS_v2.2.pdf";

export default function NewAuditPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [demoLoading, setDemoLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const uploadFile = (toUpload: File) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("qms", toUpload);
      const res = await fetch("/api/engagement/new", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || `Upload failed (${res.status})`);
        return;
      }
      const j = await res.json();
      router.push(`/audit/${j.id}`);
    });
  };

  const submit = () => {
    if (!file) return;
    uploadFile(file);
  };

  const loadDemo = async () => {
    if (demoLoading || pending) return;
    setError(null);
    setDemoLoading(true);
    try {
      const res = await fetch(DEMO_QMS_URL);
      if (!res.ok) throw new Error(`Couldn't fetch demo (${res.status})`);
      const blob = await res.blob();
      const demoFile = new File([blob], DEMO_QMS_NAME, {
        type: "application/pdf",
      });
      setFile(demoFile);
      setIsDemo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo failed to load");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/app"
        className="inline-flex items-center gap-1 text-[12px] text-ink-mute hover:text-ink"
      >
        <ArrowLeft size={13} />
        Engagements
      </Link>

      <div className="mt-3 mb-8">
        <p className="eyebrow mb-2">Intake</p>
        <h1 className="font-serif text-[36px] leading-tight font-medium text-ink">
          New audit
        </h1>
        <p className="mt-2 text-[14px] text-ink-mute leading-relaxed">
          Upload the client&apos;s QMS manual. Observer reads it once and
          pre-fills the audit packet — you review, refine, and ship.
        </p>
      </div>

      <label className="block">
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setIsDemo(false);
          }}
          className="sr-only"
        />
        <div
          className={`rounded-[var(--radius-lg)] border border-dashed px-8 py-12 text-center transition-colors cursor-pointer ${
            file
              ? "border-navy/50 bg-navy/5"
              : "border-line-strong bg-paper-card hover:bg-paper-soft"
          }`}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-paper-soft text-navy">
            <FileUp size={20} />
          </div>
          {file ? (
            <>
              <p className="font-serif text-[18px] text-ink">{file.name}</p>
              <p className="mt-1 text-[12px] text-ink-mute">
                {(file.size / 1024).toFixed(0)} KB ·{" "}
                {isDemo ? "demo manual loaded" : "click to choose another"}
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-[18px] text-ink">
                Choose the QMS manual (PDF)
              </p>
              <p className="mt-1 text-[12px] text-ink-mute">
                The bigger the better — Observer handles 100+ page documents.
              </p>
            </>
          )}
        </div>
      </label>

      <div className="mt-4 flex items-center gap-3 text-[12px] text-ink-mute">
        <span className="h-px flex-1 bg-line" />
        <span>or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={runDemo}
        disabled={demoLoading || pending}
        className="mt-4 w-full rounded-[var(--radius)] border border-line bg-paper-card px-4 py-3 text-left transition-colors hover:bg-paper-soft hover:border-line-strong disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-bright/10 text-navy ring-1 ring-navy-bright/25">
            {demoLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={14} className="translate-x-px" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-ink">
              Try a demo · NWCR Quality Manual
            </p>
            <p className="text-[12px] text-ink-mute">
              90-page sample QMS — watch Observer extract the org details and
              draft the Stage-1 packet in seconds.
            </p>
          </div>
        </div>
      </button>

      {error && (
        <p className="mt-4 rounded-[var(--radius-sm)] bg-status-active/15 px-3 py-2 text-[13px] text-status-active">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12px] text-ink-faint">
          Extraction takes about five seconds.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/app" className="btn-ghost">
            Cancel
          </Link>
          <button
            type="button"
            disabled={!file || pending}
            onClick={submit}
            className="btn-primary"
          >
            {pending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {pending ? "Extracting…" : "Upload + extract"}
          </button>
        </div>
      </div>
    </div>
  );
}
