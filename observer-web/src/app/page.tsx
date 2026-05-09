import { ArrowRight, Camera, Check, FileText, Stamp } from "lucide-react";
import { WaitlistButton } from "./_components/WaitlistModal";

export const dynamic = "force-static";

export const metadata = {
  title: "Observer — the back office for ISO audits",
  description:
    "Observer reads your client's quality manual once and drafts the audit packet, so lead auditors spend their time on the audit, not the paperwork.",
};

export default function Landing() {
  return (
    <div className="space-y-24 sm:space-y-32 py-6">
      <Hero />
      <Features />
      <HowItWorks />
      <SecondaryCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
      <div className="pt-4 sm:pt-8">
        <div className="eyebrow mb-5">Private beta · ISO 9001 · 14001 · 45001</div>
        <h1 className="font-serif text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.05] tracking-tight text-ink font-medium">
          The back office for{" "}
          <span className="text-navy border-b-[3px] border-navy-bright pb-1">
            ISO audits.
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-mute leading-relaxed max-w-xl">
          Observer reads your client&apos;s quality manual once and drafts the
          full audit packet — Stage 1, Stage 2, surveillance — in seconds. Your
          client&apos;s team can even upload evidence photos from the floor
          themselves. You spend your time on the audit, not on the paperwork.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <WaitlistButton className="btn-primary text-base !py-3 !px-5">
            Get early access
            <ArrowRight size={16} />
          </WaitlistButton>
          <span className="inline-flex items-center gap-2 text-sm text-ink-mute">
            <span className="h-1.5 w-1.5 rounded-full bg-status-done" />
            Built with a certified ISO 9001 lead auditor
          </span>
        </div>
      </div>
      <HeroPreview />
    </section>
  );
}

const PREVIEW_DOCS = [
  { kind: "Stage-1 Audit Plan", note: "Auto-filled from QMS" },
  { kind: "Intimation Letter", note: "Stage 1 + Stage 2" },
  { kind: "Attendance Sheet", note: "Team + observer" },
  { kind: "Stage-1 Audit Report", note: "Findings draft ready" },
];

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-4 -inset-y-6 bg-gradient-to-br from-navy-bright/10 to-transparent rounded-[var(--radius-lg)] -z-10" />
      <div className="card p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="eyebrow text-[10px] mb-1">Engagement · Syndeticom</div>
            <div className="font-serif text-[20px] text-ink font-medium leading-tight">
              Stage-1 packet
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[11px] uppercase tracking-wider text-status-done">
              Ready
            </div>
            <div className="font-mono text-[11px] text-ink-faint mt-0.5">
              4.7s
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {PREVIEW_DOCS.map((d) => (
            <li
              key={d.kind}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-paper-soft/60 ring-1 ring-line/70"
            >
              <span className="h-7 w-7 rounded bg-navy-bright/10 ring-1 ring-navy-bright/25 flex items-center justify-center flex-shrink-0">
                <FileText size={13} className="text-navy" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink truncate">
                  {d.kind}
                </div>
                <div className="text-[11px] text-ink-mute truncate">
                  {d.note}
                </div>
              </div>
              <Check size={14} className="text-status-done flex-shrink-0" />
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between text-[12px] text-ink-mute">
          <span className="font-mono">.docx · Word-compatible</span>
          <span className="inline-flex items-center gap-1.5 text-navy-bright font-medium">
            Download zip <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "Stage-1 packet in five seconds",
    body: "Drop a client's QMS PDF. Observer fills the audit plan, intimation letter, attendance sheet, and a draft Stage-1 report — pre-populated with the client's organisation details, scope, and contacts.",
  },
  {
    icon: Camera,
    title: "Evidence from anywhere",
    body: "On the audit, your phone is a labelled evidence camera. Off-site, send the client a QR — their team uploads photos straight from the floor. Everything auto-labels and lands in the right clause.",
  },
  {
    icon: Stamp,
    title: "You stay in charge of every word",
    body: "Drafts are fully editable. Findings, recommendations, and sign-offs stay yours — Observer just removes the typing tax.",
  },
];

function Features() {
  return (
    <section>
      <div className="max-w-2xl mb-10">
        <div className="eyebrow mb-3">What it does</div>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-medium leading-tight">
          The mechanical parts of the audit, handled.
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="card p-6">
              <div className="h-10 w-10 rounded-md bg-navy-bright/10 ring-1 ring-navy-bright/20 flex items-center justify-center mb-4">
                <Icon size={18} className="text-navy" />
              </div>
              <h3 className="font-serif text-xl text-ink font-medium mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-ink-mute leading-relaxed">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Upload the client's QMS",
    body: "One PDF. Observer pulls out the organisation name, address, scope, contacts, and IAF code.",
  },
  {
    n: "02",
    title: "Review the draft packet",
    body: "All seven Stage-1 / Stage-2 documents come back filled. Edit anything that doesn't sound like you.",
  },
  {
    n: "03",
    title: "Collect evidence — together",
    body: "Capture photos on your phone during the audit, or share a QR so the auditee uploads from the office floor. Each photo auto-labels and attaches to the right clause.",
  },
  {
    n: "04",
    title: "Export the final packet",
    body: "Download a zip of native .docx files — same formats your certification body already accepts.",
  },
];

function HowItWorks() {
  return (
    <section>
      <div className="max-w-2xl mb-10">
        <div className="eyebrow mb-3">How it works</div>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-medium leading-tight">
          From quality manual to certification-ready packet.
        </h2>
      </div>
      <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="flex gap-5 border-t border-line pt-5 first:border-t-0 sm:border-t-0 sm:pt-0"
          >
            <span className="font-mono text-[12px] font-medium text-navy-bright pt-1 tabular-nums">
              {s.n}
            </span>
            <div>
              <h3 className="font-serif text-xl text-ink font-medium mb-1">
                {s.title}
              </h3>
              <p className="text-sm text-ink-mute leading-relaxed">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SecondaryCTA() {
  return (
    <section className="card p-8 sm:p-12 text-center">
      <h2 className="font-serif text-3xl sm:text-4xl text-ink font-medium leading-tight">
        Skip the form-filling, not the audit.
      </h2>
      <p className="mt-3 text-ink-mute max-w-xl mx-auto">
        We&apos;re onboarding lead auditors and small audit firms now. Get on the
        list and we&apos;ll reach out as slots open.
      </p>
      <WaitlistButton className="btn-primary mt-6 inline-flex">
        Get early access
        <ArrowRight size={16} />
      </WaitlistButton>
    </section>
  );
}
