import Link from "next/link";
import { ArrowRight, Camera, FileText, Stamp } from "lucide-react";
import { WaitlistForm } from "./_components/WaitlistForm";

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
    <section className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
      <div className="pt-4 sm:pt-8">
        <div className="eyebrow mb-5">Private beta · ISO 9001 · 14001 · 45001</div>
        <h1 className="font-serif text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.05] tracking-tight text-ink font-medium">
          The back office for{" "}
          <span className="text-navy">ISO audits.</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-ink-mute leading-relaxed max-w-xl">
          Observer reads your client&apos;s quality manual once and drafts the
          full audit packet — Stage 1, Stage 2, surveillance — in seconds. You
          spend your time on the audit, not on filling forms.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-mute">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-status-done" />
            Built with a certified ISO 9001 lead auditor
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-status-done" />
            ~$0.006 of LLM per audit
          </span>
        </div>
      </div>
      <div id="signup" className="lg:pt-12 scroll-mt-24">
        <WaitlistForm />
      </div>
    </section>
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
    title: "Capture evidence on-site",
    body: "On the audit, your phone becomes a labelled evidence camera. Photos and notes attach to the right clause and end up in the report — no end-of-day data entry.",
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
              <div className="h-10 w-10 rounded-md bg-paper-soft flex items-center justify-center mb-4">
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
    title: "Run the audit, capture findings",
    body: "Use Observer on your phone to label evidence as you go. Findings come back into the report draft.",
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
            <span className="font-mono text-[12px] text-ink-faint pt-1 tabular-nums">
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
      <Link href="#signup" className="btn-primary mt-6 inline-flex">
        Get early access
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
