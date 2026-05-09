"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

type State = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [practice, setPractice] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, practice }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again?");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setError("Couldn't reach the server. Try again?");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="card p-6 sm:p-8 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-status-done/15 text-status-done flex items-center justify-center flex-shrink-0">
          <Check size={20} />
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">You&apos;re on the list.</h3>
          <p className="mt-1 text-sm text-ink-mute">
            We&apos;ll be in touch as soon as Observer is ready for new auditors.
            No spam, just the launch note.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-7 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-[12px] font-medium text-ink-mute mb-1.5"
        >
          Work email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@firm.com"
          className="input-paper"
        />
      </div>
      <div>
        <label
          htmlFor="practice"
          className="block text-[12px] font-medium text-ink-mute mb-1.5"
        >
          Tell us about your practice{" "}
          <span className="text-ink-faint font-normal">(optional)</span>
        </label>
        <textarea
          id="practice"
          rows={3}
          maxLength={500}
          value={practice}
          onChange={(e) => setPractice(e.target.value)}
          placeholder="How many audits per year, what standards, anything you'd want a tool like this to handle…"
          className="input-paper"
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-status-active">{error}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-primary w-full justify-center"
      >
        {state === "submitting" ? "Submitting…" : "Get early access"}
        {state !== "submitting" && <ArrowRight size={16} />}
      </button>

      <p className="text-[12px] text-ink-faint text-center">
        We&apos;ll only email you about Observer. Unsubscribe anytime.
      </p>
    </form>
  );
}
