import type { ReactNode } from "react";
import { DeckNav } from "./_components/DeckNav";
import { DeckTransition } from "./_components/DeckTransition";

// Parent SiteHeader / SiteShell are hidden on /deck/* (see SiteChrome.tsx),
// so the deck renders full-page without an overlay.
export default function DeckLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink overflow-hidden">
      <DeckNav />
      <DeckTransition>{children}</DeckTransition>
    </div>
  );
}
