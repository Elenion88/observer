import { Rule, Slide } from "../_components/Slide";

export default function Page() {
  return (
    <Slide number={4} cornerLabel="The math">
      <div className="max-w-[60rem] space-y-10">
        <h1 className="text-[clamp(32px,4.4vw,64px)] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
          Saves the auditor{" "}
          <span className="text-navy">4&ndash;8 hours</span> per packet.
        </h1>

        <h2 className="text-[clamp(28px,3.8vw,52px)] font-medium leading-[1.15] tracking-[-0.01em] text-ink-2">
          <span className="text-navy">$99</span> per audit. The time saved
          is worth <span className="text-navy">$400+</span> of theirs.
        </h2>

        <Rule />

        <p className="max-w-[44rem] font-mono text-[clamp(13px,1.1vw,16px)] leading-relaxed text-ink-mute">
          ~1.5M ISO 9001 certified organizations worldwide. The ISO
          certification market is $16B today, projected to reach $66B by
          2034.
        </p>
      </div>
    </Slide>
  );
}
