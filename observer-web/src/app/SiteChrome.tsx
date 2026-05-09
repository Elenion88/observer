"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { WaitlistButton } from "./_components/WaitlistModal";

function isBarePath(pathname: string | null) {
  if (!pathname) return false;
  return pathname.endsWith("/capture") || pathname.startsWith("/deck");
}

function isLandingPath(pathname: string | null) {
  return pathname === "/";
}

function Wordmark({ tagline }: { tagline: string }) {
  return (
    <span className="flex items-baseline gap-3">
      <Image
        src="/logo.png"
        alt="Observer"
        width={916}
        height={247}
        priority
        className="h-7 w-auto"
      />
      <span className="hidden sm:inline italic text-sm text-ink-mute">
        — {tagline}
      </span>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  if (isBarePath(pathname)) return null;

  if (isLandingPath(pathname)) {
    return (
      <header className="border-b border-line bg-paper-card/60 backdrop-blur supports-[backdrop-filter]:bg-paper-card/60">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="group">
            <Wordmark tagline="the back office for ISO audits" />
          </a>
          <nav className="flex items-center gap-4 text-sm text-ink-mute">
            <a href="/app" className="hover:text-ink">
              Sign in
            </a>
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
        <a href="/app" className="group">
          <Wordmark tagline="the back office for the audit" />
        </a>
        <nav className="flex items-center gap-4 text-sm text-ink-mute">
          <a href="/app" className="hover:text-ink">
            Engagements
          </a>
          <a href="/deck" className="hover:text-ink">
            Pitch deck&nbsp;↗
          </a>
          <a
            href="/audit/new"
            className="btn-primary !py-1.5 !px-3 !text-[13px]"
          >
            + New audit
          </a>
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
        {children}
      </main>
      <footer className="mt-10 border-t border-line/70">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-ink-faint flex items-center justify-between">
          <span>
            <span className="font-serif font-medium text-navy">Observer</span>
            <span className="mx-1.5">·</span>
            ISO 9001 audit studio
          </span>
          <span>© 2026</span>
        </div>
      </footer>
    </>
  );
}
