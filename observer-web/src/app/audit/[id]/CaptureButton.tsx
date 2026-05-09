"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";

export function CaptureButton({
  engagementId,
  count,
}: {
  engagementId: string;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(
      `${window.location.protocol}//${window.location.host}/audit/${engagementId}/capture`
    );
  }, [engagementId]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary"
      >
        <Camera size={14} />
        Capture evidence
        {count > 0 && (
          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-status-done/15 text-status-done text-[10px] font-semibold px-1.5">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && url && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-30 mt-2 w-[300px] rounded-[var(--radius)] bg-paper-card ring-1 ring-line shadow-[var(--shadow-lift)] p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-serif text-[16px] text-ink leading-tight">
                  Capture from your phone
                </p>
                <p className="text-[11px] text-ink-mute mt-0.5">
                  Scan to open the on-site capture mode.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-ink-faint hover:text-ink p-0.5 -mt-1"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <div className="rounded-md bg-paper-soft/60 p-3 flex items-center justify-center">
              <QRCodeSVG
                value={url}
                size={150}
                fgColor="#0f2d4a"
                bgColor="transparent"
              />
            </div>
            <a
              href={`/audit/${engagementId}/capture`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center text-[12px] text-link hover:underline"
            >
              Or open capture mode here →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
