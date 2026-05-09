"use client";

import { useState, useTransition } from "react";
import { updateField } from "./actions";

const STAGES = [
  "Stage 1",
  "Stage 2",
  "Surveillance 1",
  "Surveillance 2",
  "Recertification",
];

export function StageSelectClient({
  engagementId,
  initialValue,
  locked,
}: {
  engagementId: string;
  initialValue: string;
  locked?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  if (locked) {
    return <p className="text-[14px] text-ink leading-snug">{value}</p>;
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          startTransition(async () => {
            await updateField(engagementId, "auditStage", e.target.value);
          });
        }}
        className="input-paper pr-6"
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {pending && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint">
          saving…
        </span>
      )}
    </div>
  );
}
