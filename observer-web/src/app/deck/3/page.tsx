import Link from "next/link";
import { Rule, Slide } from "../_components/Slide";

// Demo bridge. Click the URL or hit "/" to drop into the live engagement list.
export default function Page() {
  return (
    <Slide number={3} cornerLabel="Live · observer.kokomo.quest">
      <div className="max-w-[64rem] space-y-12">
        <h1 className="text-[clamp(56px,8vw,120px)] font-medium leading-[1.02] tracking-[-0.015em] text-ink">
          Watch one audit
          <br />
          go <span className="text-navy">through.</span>
        </h1>

        <Rule />

        <Link
          href="/"
          className="font-mono text-[clamp(13px,1.1vw,16px)] uppercase tracking-[0.2em] text-ink-mute hover:text-ink"
        >
          → observer.kokomo.quest
        </Link>
      </div>
    </Slide>
  );
}
