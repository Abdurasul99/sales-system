import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/telegram/webhook",
  "/api/cron/keepalive",
  "/api/cron/",
  "/offline",
];
const PUBLIC_EXACT_PATHS = ["/"];
const SUPERADMIN_PATHS = ["/superadmin"];
const ADMIN_PATHS = [
  "/analytics",
  "/products",
  "/categories",
  "/expenses",
  "/income",
  "/suppliers",
  "/currency",
  "/customers",
  "/settings",
  "/warehouse",
];

// When running behind a reverse proxy (nginx), req.url may contain localhost.
// Use the Host header (which nginx forwards as-is) to build correct redirect URLs.
function getOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host") ?? req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (req.nextUrl.protocol.replace(":", "") || "http");
  return `${proto}://${host}`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_EXACT_PATHS.includes(pathname) || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow internal API calls
  if (pathname.startsWith("/api/")) {
    const internalToken = req.headers.get("x-internal-token");
    if (internalToken === process.env.INTERNAL_API_TOKEN) {
      return NextResponse.next();
    }
  }

  const session = await getSessionFromRequest(req);
  const origin = getOrigin(req);

  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // SuperAdmin-only paths
  if (SUPERADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (session.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/analytics", origin));
    }
  }

  // Prevent non-org users from accessing dashboard routes
  if (
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) &&
    session.role !== "SUPERADMIN" &&
    !session.organizationId
  ) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-192.png|icon-512.png|sw.js|images|fonts).*)",
  ],
};
