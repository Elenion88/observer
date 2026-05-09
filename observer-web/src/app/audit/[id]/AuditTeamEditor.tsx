"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { updateField } from "./actions";

type Member = { name: string; role: string };

const ROLES = ["Lead Auditor", "Auditor", "Technical Expert", "Observer"];

export function AuditTeamEditor({
  engagementId,
  initialJson,
  locked,
}: {
  engagementId: string;
  initialJson: string;
  locked?: boolean;
}) {
  const [team, setTeam] = useState<Member[]>(() => {
    try {
      return JSON.parse(initialJson) ?? [];
    } catch {
      return [];
    }
  });
  const [pending, startTransition] = useTransition();

  const persist = (next: Member[]) => {
    startTransition(async () => {
      await updateField(engagementId, "auditTeamJson", JSON.stringify(next));
    });
  };

  const updateMember = (idx: number, patch: Partial<Member>) => {
    const next = team.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    setTeam(next);
    persist(next);
  };

  const addMember = () => {
    const next = [...team, { name: "", role: "Auditor" }];
    setTeam(next);
    persist(next);
  };

  const removeMember = (idx: number) => {
    const next = team.filter((_, i) => i !== idx);
    setTeam(next);
    persist(next);
  };

  if (locked) {
    return (
      <div>
        <span className="block mb-1.5 eyebrow">Audit team</span>
        {team.length === 0 ? (
          <p className="text-[14px] italic text-ink-faint">— none assigned</p>
        ) : (
          <ul className="space-y-1">
            {team.map((m, idx) => (
              <li key={idx} className="text-[14px] text-ink">
                {m.name || <span className="italic text-ink-faint">unnamed</span>}{" "}
                <span className="text-ink-mute">·</span>{" "}
                <span className="text-ink-mute">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">Audit team</span>
        <span className="!text-[10px] text-ink-faint h-3">
          {pending ? "saving…" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {team.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={m.name}
              onChange={(e) => updateMember(idx, { name: e.target.value })}
              placeholder="Name"
              className="input-paper flex-1"
            />
            <select
              value={m.role}
              onChange={(e) => updateMember(idx, { role: e.target.value })}
              className="input-paper !w-auto pr-6 text-ink-mute"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeMember(idx)}
              className="text-ink-faint hover:text-status-active p-1"
              aria-label="Remove member"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addMember}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-link hover:underline"
      >
        <Plus size={12} />
        Add team member
      </button>
    </div>
  );
}
