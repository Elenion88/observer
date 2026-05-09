import { NextRequest, NextResponse } from "next/server";

const REALM = "Observer";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auditees scan a QR to upload evidence — that path stays open.
  if (pathname.endsWith("/capture")) {
    return NextResponse.next();
  }

  const expected = process.env.OBSERVER_PASSWORD;
  if (!expected) {
    return new NextResponse("auth not configured", { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice("Basic ".length));
      const idx = decoded.indexOf(":");
      const pwd = idx >= 0 ? decoded.slice(idx + 1) : decoded;
      if (pwd === expected) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}"` },
  });
}

export const config = {
  matcher: ["/app/:path*", "/audit", "/audit/:path*"],
};
