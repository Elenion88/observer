"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WaitlistButton } from "./_components/WaitlistModal";
import { RouteTransition } from "./_components/RouteTransition";

function isBarePath(pathname: string | null) {
  if (!pathname) return false;
  return pathname.endsWith("/capture") || pathname.startsWith("/deck");
}

function isLandingPath(pathname: string | null) {
  return pathname === "/";
}

function Wordmark() {
  return (
    <Image
      src="/logo.png"
      alt="Observer"
      width={916}
      height={247}
      priority
      className="h-7 w-auto"
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  if (isBarePath(pathname)) return null;

  if (isLandingPath(pathname)) {
    return (
      <header className="border-b border-line bg-paper-card/60 backdrop-blur supports-[backdrop-filter]:bg-paper-card/60">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="group">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-3 text-sm text-ink-mute">
            <Link
              href="/app"
              className="btn-secondary !py-1.5 !px-3 !text-[13px]"
            >
              Launch
            </Link>
            <WaitlistButton className="btn-primary !py-1.5 !px-3 !text-[13px]">
              Get early access
            </WaitlistButton>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-line bg-paper-card/60 backdrop-blur supports-[backdrop-filter]:bg-paper-card/60">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/app" className="group">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-mute">
          <Link href="/app" className="hover:text-ink">
            Engagements
          </Link>
          <Link
            href="/audit/new"
            className="btn-primary !py-1.5 !px-3 !text-[13px]"
          >
            + New audit
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isBarePath(pathname)) return <>{children}</>;
  return (
    <>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <footer className="mt-10 border-t border-line/70">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-ink-faint flex items-center justify-between gap-4">
          <span>
            <span className="font-serif font-medium text-navy">Observer</span>
            <span className="mx-1.5">·</span>
            ISO 9001 audit studio
          </span>
          <span className="flex items-center gap-4">
            <Link href="/deck" className="hover:text-ink-mute">
              Pitch deck&nbsp;↗
            </Link>
            <span>© 2026</span>
          </span>
        </div>
      </footer>
    </>
  );
}
