"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const ORDER = ["/deck/1", "/deck/2", "/deck/3", "/deck/4", "/deck/5"] as const;

export function DeckNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/deck")) return;

    function go(delta: number) {
      const i = ORDER.indexOf(pathname as (typeof ORDER)[number]);
      if (i === -1) return;
      const next = i + delta;
      if (next < 0 || next >= ORDER.length) return;
      router.push(ORDER[next]);
    }

    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(-1);
          break;
        case "Home":
          e.preventDefault();
          router.push(ORDER[0]);
          break;
        case "End":
          e.preventDefault();
          router.push(ORDER[ORDER.length - 1]);
          break;
        case "Escape":
          e.preventDefault();
          router.push("/");
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  return null;
}
