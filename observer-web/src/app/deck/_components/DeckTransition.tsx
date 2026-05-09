"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

function slideNumber(pathname: string | null): number {
  if (!pathname) return 0;
  const m = pathname.match(/^\/deck\/(\d+)/);
  return m ? Number(m[1]) : 0;
}

const SHIFT = 64;

export function DeckTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = slideNumber(pathname);
  const prevRef = useRef(current);
  const direction = current >= prevRef.current ? 1 : -1;
  prevRef.current = current;

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={{
          enter: (dir: number) => ({ opacity: 0, x: dir * SHIFT }),
          center: { opacity: 1, x: 0 },
          exit: (dir: number) => ({ opacity: 0, x: dir * -SHIFT }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.22, ease: "easeOut" },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
