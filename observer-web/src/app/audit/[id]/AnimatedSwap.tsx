"use client";

import { AnimatePresence, motion } from "motion/react";

/**
 * Cross-fades between two child variants identified by `key`.
 * Used to smoothly transition between collapsed/expanded section views.
 */
export function AnimatedSwap({
  swapKey,
  children,
}: {
  swapKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={swapKey}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
          layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A simple motion wrapper that animates entry/exit when a child renders.
 * Use for the appearing-document-cards moment, evidence add/remove, etc.
 */
export function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
