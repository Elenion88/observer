"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { resizeImage } from "@/lib/resizeImage";

export function UploadEvidenceButton({
  engagementId,
}: {
  engagementId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const onFiles = async (files: FileList) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    setError(null);
    setProgress({ done: 0, total: list.length });
    try {
      let done = 0;
      for (const raw of list) {
        const file = await resizeImage(raw);
        const fd = new FormData();
        fd.append("photo", file);
        const res = await fetch(`/api/engagement/${engagementId}/evidence`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `upload failed (${res.status})`);
        }
        done += 1;
        setProgress({ done, total: list.length });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setBusy(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) onFiles(e.target.files);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="btn-secondary"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {busy && progress
          ? `Uploading ${progress.done}/${progress.total}…`
          : "Upload evidence"}
      </button>
      {error && (
        <span className="text-[12px] text-status-active ml-2">{error}</span>
      )}
    </>
  );
}
