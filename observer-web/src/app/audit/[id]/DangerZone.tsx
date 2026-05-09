"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteEngagement } from "./actions";

export function DangerZone({
  engagementId,
  orgName,
}: {
  engagementId: string;
  orgName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const expected = orgName.trim();
  const matches =
    expected.length > 0 &&
    typed.trim().toLowerCase() === expected.toLowerCase();

  const onDelete = () => {
    if (!matches) return;
    startTransition(async () => {
      await deleteEngagement(engagementId);
      router.push("/app");
    });
  };

  return (
    <section className="lg:col-span-2">
      <div className="card p-6 border-l-2 border-l-[#b8473a] bg-[#b8473a]/[0.02]">
        <div className="flex items-start gap-4">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-[#b8473a]/10 text-[#b8473a] flex-shrink-0">
            <AlertTriangle size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="eyebrow text-[#b8473a]">Danger zone</p>
            <h3 className="font-serif text-[20px] leading-tight font-medium text-ink mt-0.5">
              Delete this engagement
            </h3>
            <p className="mt-1.5 text-[13px] text-ink-mute leading-relaxed max-w-xl">
              Removes the engagement, all evidence photos, and every generated
              document. The QMS upload, evidence files on disk, and database
              records all go. There&apos;s no undo.
            </p>

            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#b8473a] ring-1 ring-[#b8473a]/30 hover:bg-[#b8473a]/8 hover:ring-[#b8473a]/50 transition"
              >
                <Trash2 size={13} />
                Delete engagement
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="block text-[12px] text-ink-mute mb-1.5">
                    To confirm, type{" "}
                    <span className="font-mono font-medium text-ink">
                      {orgName}
                    </span>
                  </span>
                  <input
                    type="text"
                    value={typed}
                    onChange={(ev) => setTyped(ev.target.value)}
                    autoFocus
                    placeholder={orgName}
                    className="w-full max-w-md bg-paper-card ring-1 ring-line rounded-md px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-[#b8473a]/40"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={!matches || pending}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium text-paper-card bg-[#b8473a] hover:bg-[#a13e33] disabled:bg-ink-faint disabled:cursor-not-allowed transition"
                  >
                    {pending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    {pending ? "Deleting…" : "Permanently delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false);
                      setTyped("");
                    }}
                    disabled={pending}
                    className="btn-ghost text-[13px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
