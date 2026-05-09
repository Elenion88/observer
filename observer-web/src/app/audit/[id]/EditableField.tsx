"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateField } from "./actions";

type Props = {
  engagementId: string;
  field: string;
  initialValue: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
  locked?: boolean;
};

export function EditableField({
  engagementId,
  field,
  initialValue,
  label,
  multiline,
  placeholder,
  locked,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  const save = () => {
    if (value === savedValue) return;
    startTransition(async () => {
      await updateField(engagementId, field, value);
      setSavedValue(value);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1400);
    });
  };

  if (locked) {
    return (
      <div className="block">
        <span className="block mb-1.5 eyebrow">{label}</span>
        {value ? (
          <p
            className={`text-[14px] text-ink leading-snug ${
              multiline ? "whitespace-pre-line" : ""
            }`}
          >
            {value}
          </p>
        ) : (
          <p className="text-[14px] italic text-ink-faint">— not set</p>
        )}
      </div>
    );
  }

  const isEmpty = value.trim() === "";

  return (
    <label className="block" data-blank={isEmpty || undefined}>
      <span className="flex items-center justify-between mb-1.5 eyebrow">
        <span className="inline-flex items-center gap-1.5">
          {label}
          {isEmpty && (
            <span
              className="h-1.5 w-1.5 rounded-full bg-status-await"
              aria-label="needs input"
              title="Needs input"
            />
          )}
        </span>
        <span className="!text-[10px] !tracking-wider normal-case text-ink-faint inline-flex items-center gap-1 h-3">
          {pending ? (
            <>
              <Loader2 size={9} className="animate-spin" />
              saving
            </>
          ) : savedFlash ? (
            <>
              <Check size={10} className="text-status-done" />
              saved
            </>
          ) : null}
        </span>
      </span>
      {multiline ? (
        <textarea
          className="input-paper min-h-[5rem]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="input-paper"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
