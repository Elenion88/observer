import { Rule, Slide } from "../_components/Slide";

export default function Page() {
  return (
    <Slide
      number={1}
      cornerLabel="ISO 9001 · the world's most-used quality standard"
      footer="Jordan & Austin · made this weekend"
    >
      <div className="max-w-[58rem] space-y-10">
        <h1 className="text-[clamp(32px,4.4vw,64px)] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
          Jordan trained as an ISO 9001 auditor.
        </h1>

        <h2 className="text-[clamp(28px,3.8vw,54px)] font-medium leading-[1.15] tracking-[-0.01em] text-ink-2">
          Every audit he studied ends with a 50-page report that takes a
          full day to write.
        </h2>

        <Rule />

        <h2 className="text-[clamp(32px,4.4vw,64px)] font-medium leading-[1.1] tracking-[-0.01em] text-navy">
          Observer writes it in five seconds.
        </h2>
      </div>
    </Slide>
  );
}
