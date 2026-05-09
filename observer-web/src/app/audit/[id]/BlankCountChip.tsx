"use client";

import { useRef } from "react";

export function BlankCountChip({
  count,
  scopeId,
}: {
  count: number;
  scopeId: string;
}) {
  const cursorRef = useRef(0);

  if (count <= 0) return null;

  const onClick = () => {
    if (typeof document === "undefined") return;
    const scope = document.getElementById(scopeId);
    if (!scope) return;
    const blanks = scope.querySelectorAll<HTMLElement>('[data-blank="true"]');
    if (blanks.length === 0) return;
    const idx = cursorRef.current % blanks.length;
    cursorRef.current = idx + 1;
    const target = blanks[idx];
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = target.querySelector<HTMLElement>(
      "input, textarea, select, button"
    );
    setTimeout(() => focusable?.focus({ preventScroll: true }), 250);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title="Jump to the next empty field"
      className="inline-flex items-center gap-1.5 rounded-full bg-status-await/10 text-status-await/90 px-2.5 py-0.5 text-[11px] font-medium hover:bg-status-await/15 transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-status-await" />
      {count} blank
    </button>
  );
}
