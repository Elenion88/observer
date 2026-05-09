"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import { resizeImage } from "@/lib/resizeImage";

type Capture = {
  id: string;
  filePath: string;
  label: string;
  pending?: boolean;
  labelling?: boolean;
};

async function pollForLabel(
  evidenceId: string,
  onLabel: (label: string) => void,
  maxAttempts = 30
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const res = await fetch(`/api/evidence/${evidenceId}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.label && data.label.length > 0) {
        onLabel(data.label);
        return;
      }
    } catch {
      // ignore transient errors, keep polling
    }
  }
  onLabel("(label unavailable)");
}

export function CaptureClient({
  engagementId,
  orgName,
}: {
  engagementId: string;
  orgName: string;
}) {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (rawFile: File) => {
    setError(null);
    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(rawFile);
    setCaptures((prev) => [
      {
        id: tempId,
        filePath: previewUrl,
        label: "Uploading…",
        pending: true,
        labelling: true,
      },
      ...prev,
    ]);

    try {
      // Downscale on-device before upload — multi-MB phone shots → ~150KB.
      const file = await resizeImage(rawFile);

      const fd = new FormData();
      fd.append("photo", file);

      const res = await fetch(
        `/api/engagement/${engagementId}/evidence`,
        { method: "POST", body: fd }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `upload failed (${res.status})`);
      }
      const j = await res.json();

      // Photo is now uploaded — show it immediately, mark the label as still
      // resolving in the background.
      setCaptures((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                id: j.id,
                filePath: j.filePath,
                label: "Labelling…",
                pending: false,
                labelling: true,
              }
            : c
        )
      );

      // Poll for the label.
      pollForLabel(j.id, (label) => {
        setCaptures((prev) =>
          prev.map((c) =>
            c.id === j.id ? { ...c, label, labelling: false } : c
          )
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
      setCaptures((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const updateLabel = async (id: string, newLabel: string) => {
    setCaptures((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label: newLabel } : c))
    );
    startTransition(async () => {
      await fetch(`/api/evidence/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel }),
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#101826] text-[#ece6d3]">
      <header className="px-5 py-5 sm:px-8 border-b border-white/5 bg-[#0c1220]/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <a
            href={`/audit/${engagementId}`}
            className="inline-flex items-center gap-2 px-3 py-2 -ml-3 rounded-md text-[14px] text-[#bdb59f] hover:text-[#ece6d3] hover:bg-white/5 transition"
          >
            <ArrowLeft size={16} />
            Done
          </a>
          <div className="text-right min-w-0">
            <p className="text-[10px] tracking-[0.18em] uppercase text-[#7c8493]">
              Capture mode
            </p>
            <p className="font-serif text-[18px] sm:text-[20px] text-[#ece6d3] truncate">
              {orgName}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-8 sm:py-10 flex flex-col items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full max-w-md rounded-[20px] bg-[#c8a951] hover:bg-[#d6b95c] text-[#101826] font-medium py-7 text-[18px] shadow-[0_8px_24px_-12px_rgba(200,169,81,0.5)] active:scale-[0.985] transition inline-flex items-center justify-center gap-3"
        >
          <Camera size={24} strokeWidth={2.25} />
          Take photo of evidence
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        <p className="mt-4 text-[13px] text-[#7c8493] text-center max-w-sm">
          AI auto-labels each photo for the evidence log. Review or edit
          inline as you go.
        </p>
        {error && (
          <p className="mt-4 rounded-md bg-red-900/40 px-3 py-2 text-[13px] text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-5 sm:px-8 pb-16">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#7c8493]">
            Captured
          </p>
          <span className="text-[12px] text-[#bdb59f] tabular-nums">
            {captures.length} {captures.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        {captures.length === 0 ? (
          <p className="text-[14px] text-[#7c8493] py-6 text-center">
            Nothing yet. Tap the button to start.
          </p>
        ) : (
          <ul className="space-y-4">
            {captures.map((c) => (
              <li
                key={c.id}
                className="rounded-[16px] bg-[#171f30] ring-1 ring-white/5 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-black/30 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      c.filePath.startsWith("blob:")
                        ? c.filePath
                        : `/api/file?path=${encodeURIComponent(c.filePath)}`
                    }
                    alt={c.label}
                    className="h-full w-full object-cover"
                  />
                  {c.pending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                      <Loader2
                        size={22}
                        className="animate-spin text-[#c8a951]"
                      />
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center gap-2.5">
                  {c.pending || c.labelling ? (
                    <Loader2
                      size={14}
                      className="animate-spin text-[#c8a951] shrink-0"
                    />
                  ) : (
                    <Check size={14} className="text-[#9bbf6e] shrink-0" />
                  )}
                  <input
                    type="text"
                    value={c.label}
                    disabled={c.pending || c.labelling}
                    onChange={(e) => updateLabel(c.id, e.target.value)}
                    className="block w-full bg-transparent text-[15px] font-medium text-[#ece6d3] focus:outline-none disabled:text-[#7c8493] disabled:italic"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
