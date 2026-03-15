import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/telegram/webhook",
  "/api/cron/",
  "/offline",
];
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
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

  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // SuperAdmin-only paths
  if (SUPERADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (session.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/analytics", req.url));
    }
  }

  // Prevent non-org users from accessing dashboard routes
  if (
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) &&
    session.role !== "SUPERADMIN" &&
    !session.organizationId
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
