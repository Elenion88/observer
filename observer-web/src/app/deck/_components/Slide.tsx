import Link from "next/link";
import type { ReactNode } from "react";

const TOTAL_SLIDES = 5;

type SlideProps = {
  number: number;
  cornerLabel: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Slide({ number, cornerLabel, children, footer }: SlideProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col px-[8vw] py-[6vh]">
      <header className="flex items-start justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute">
        <span>{cornerLabel}</span>
        <Link
          href="/"
          className="hover:text-ink transition-colors"
          title="Exit deck (Esc)"
        >
          Observer&nbsp;↗
        </Link>
      </header>

      <section className="flex flex-1 flex-col justify-center">
        {children}
      </section>

      <footer className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute">
        <span>{footer ?? "observer.kokomo.quest"}</span>
        <span>
          {String(number).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
        </span>
      </footer>
    </main>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block h-px w-[3.5rem] bg-ink/30 ${className}`}
    />
  );
}
