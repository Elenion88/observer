"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowRight, Check, X } from "lucide-react";

type State = "idle" | "submitting" | "success" | "error";

const SOURCES = [
  "A friend or colleague",
  "Twitter / X",
  "LinkedIn",
  "Reddit",
  "Hackathon",
  "Web search",
  "Other",
];

const PROBLEMS = [
  "Filling out the same audit forms before each engagement",
  "Writing the draft audit report after the audit",
  "Collecting and labeling evidence on-site",
  "Getting evidence from the auditee or client",
  "Tracking findings across Stage 1, Stage 2, and surveillance",
  "Scheduling stages and surveillance visits",
];

type Ctx = { open: () => void };
const WaitlistContext = createContext<Ctx | null>(null);

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) {
    throw new Error("useWaitlist must be used inside <WaitlistProvider>");
  }
  return ctx;
}

export function WaitlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      {isOpen && <Modal onClose={close} />}
    </WaitlistContext.Provider>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [practice, setPractice] = useState("");
  const [source, setSource] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function toggleProblem(p: string) {
    setProblems((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, practice, source, problems }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 sm:py-12"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-default"
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-xl rounded-[var(--radius-lg)] bg-paper-card border border-line shadow-[var(--shadow-lift)] max-h-[calc(100vh-3rem)] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-8 w-8 rounded-full text-ink-mute hover:text-ink hover:bg-paper-soft flex items-center justify-center transition"
        >
          <X size={16} />
        </button>

        {state === "success" ? (
          <div className="p-8 sm:p-10">
            <div className="h-12 w-12 rounded-full bg-status-done/15 text-status-done flex items-center justify-center mb-5">
              <Check size={22} />
            </div>
            <h2
              id="waitlist-title"
              className="font-serif text-3xl text-ink font-medium leading-tight"
            >
              You&apos;re on the list.
            </h2>
            <p className="mt-3 text-ink-mute leading-relaxed">
              We&apos;ll reach out as soon as Observer is ready for new
              auditors. Thanks for telling us a bit about your practice — it
              shapes what we build first.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary mt-6"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="eyebrow mb-2">Early access</div>
              <h2
                id="waitlist-title"
                className="font-serif text-2xl sm:text-3xl text-ink font-medium leading-tight"
              >
                Tell us a bit about your practice.
              </h2>
              <p className="mt-1.5 text-sm text-ink-mute">
                Three quick questions. We&apos;ll prioritise the things real
                auditors actually need.
              </p>
            </div>

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
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@firm.com"
                className="input-paper"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-ink-mute mb-2">
                How did you hear about Observer?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SOURCES.map((s) => {
                  const active = source === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(active ? "" : s)}
                      className={`text-left text-sm px-3 py-2 rounded-md border transition ${
                        active
                          ? "border-navy-bright bg-navy-bright/10 text-ink"
                          : "border-line bg-paper-card hover:border-line-strong text-ink-mute hover:text-ink"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-ink-mute mb-2">
                Which problems would you want Observer to solve?{" "}
                <span className="text-ink-faint font-normal">
                  (select all that apply)
                </span>
              </label>
              <div className="space-y-1.5">
                {PROBLEMS.map((p) => {
                  const checked = problems.includes(p);
                  return (
                    <label
                      key={p}
                      className={`flex items-start gap-3 px-3 py-2 rounded-md border cursor-pointer transition ${
                        checked
                          ? "border-navy-bright bg-navy-bright/10"
                          : "border-line bg-paper-card hover:border-line-strong"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProblem(p)}
                        className="mt-0.5 h-4 w-4 rounded border-line accent-navy"
                      />
                      <span
                        className={`text-sm leading-snug ${
                          checked ? "text-ink" : "text-ink-mute"
                        }`}
                      >
                        {p}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="practice"
                className="block text-[12px] font-medium text-ink-mute mb-1.5"
              >
                Anything else?{" "}
                <span className="text-ink-faint font-normal">(optional)</span>
              </label>
              <textarea
                id="practice"
                rows={2}
                maxLength={500}
                value={practice}
                onChange={(e) => setPractice(e.target.value)}
                placeholder="Anything specific to your practice we should know."
                className="input-paper"
              />
            </div>

            {state === "error" && (
              <p className="text-sm text-status-active">{error}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-[12px] text-ink-faint">
                We&apos;ll only email you about Observer.
              </p>
              <button
                type="submit"
                disabled={state === "submitting"}
                className="btn-primary justify-center"
              >
                {state === "submitting" ? "Submitting…" : "Get early access"}
                {state !== "submitting" && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function WaitlistButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useWaitlist();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
