import { Rule, Slide } from "../_components/Slide";

export default function Page() {
  return (
    <Slide number={5} cornerLabel="What's next">
      <div className="max-w-[60rem] space-y-10">
        <h1 className="text-[clamp(36px,5vw,76px)] font-medium leading-[1.05] tracking-[-0.015em] text-ink">
          ISO 9001 today.
        </h1>

        <h2 className="text-[clamp(32px,4.4vw,64px)] font-medium leading-[1.1] tracking-[-0.01em] text-navy">
          The same workflow runs every other compliance standard.
        </h2>

        <Rule />

        <p className="font-mono text-[clamp(13px,1.2vw,18px)] uppercase tracking-[0.18em] text-ink-mute">
          ISO 9001 &nbsp;→&nbsp; ISO 14001 &nbsp;→&nbsp; AS9100 &nbsp;→&nbsp;
          SOC2 &nbsp;→&nbsp; FDA / GMP
        </p>
      </div>
    </Slide>
  );
}
