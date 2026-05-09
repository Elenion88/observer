import { Rule, Slide } from "../_components/Slide";

const PAIN_POINTS = [
  "Documents are in the wrong version, and nobody can tell which is current.",
  "Every clause needs a manual hunt through a 200-page manual to find the supporting rule.",
  "Procedures have no clear owner. Nobody knows when they were last updated.",
  "Evidence lives in scattered emails, not a single place.",
];

export default function Page() {
  return (
    <Slide number={2} cornerLabel="What goes wrong · in every audit">
      <div className="max-w-[64rem] space-y-10">
        <h1 className="text-[clamp(36px,5vw,76px)] font-medium leading-[1.05] tracking-[-0.015em] text-ink">
          Four things break every packet.
        </h1>

        <ol className="space-y-5">
          {PAIN_POINTS.map((p, i) => (
            <li
              key={i}
              className="flex items-baseline gap-6 text-[clamp(17px,1.6vw,24px)] leading-snug text-ink-2"
            >
              <span className="font-mono text-[clamp(12px,1vw,15px)] uppercase tracking-[0.18em] text-navy shrink-0 w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        <Rule />

        <p className="text-[clamp(22px,2.6vw,40px)] font-medium leading-[1.15] tracking-[-0.01em] text-navy">
          Observer reads the QMS once and answers all four.
        </p>
      </div>
    </Slide>
  );
}
