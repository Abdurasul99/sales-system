import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as React from "react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/db/prisma";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const SECRET = new TextEncoder().encode(jwtSecret || "dev-only-fallback-secret");

const COOKIE_NAME = "sales_session";
const SESSION_DURATION_HOURS = 24;
const reactCache = Reflect.get(React, "cache");
const memoize = typeof reactCache === "function"
  ? reactCache
  : (<T extends (...args: any[]) => any>(fn: T) => fn);

export interface SessionPayload {
  userId: string;
  role: string;
  organizationId: string | null;
  branchId: string | null;
  sessionId: string;
}

// Called from login API — user data already fetched, so we skip the extra findUnique.
export async function createSessionForUser(user: {
  id: string;
  role: string;
  organizationId: string | null;
  branchId: string | null;
}): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: { userId: user.id, token: crypto.randomUUID(), expiresAt },
  });

  return new SignJWT({
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    sessionId: session.id,
  } as SessionPayload & Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_HOURS}h`)
    .sign(SECRET);
}

// Legacy overload kept for any callers that only have userId.
export async function createSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, organizationId: true, branchId: true },
  });
  if (!user) throw new Error("User not found");
  return createSessionForUser(user);
}

// JWT-only verification — safe for Edge runtime (middleware).
// Does NOT touch the database, so it cannot detect revoked sessions,
// but keeps middleware fast and Edge-compatible.
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Full DB-backed session check — use only in Node.js runtime (server components, API routes).
// Detects revoked sessions and expired records in the database.
export async function verifySessionFull(token: string): Promise<SessionPayload | null> {
  const session = await verifySession(token);
  if (!session) return null;

  const dbSession = await prisma.session.findUnique({
    where: { id: session.sessionId },
    select: { expiresAt: true },
  });

  if (!dbSession || dbSession.expiresAt < new Date()) {
    return null;
  }

  return session;
}

// Used by server components — JWT-only for speed. DB session expiry is enforced
// by the short JWT expiration (24h). Full revocation checks happen only at logout.
export const getSession = memoize(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
});

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
    path: "/",
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export const getCurrentUser = memoize(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      organization: {
        include: {
          subscription: { include: { plan: { include: { features: true } } } },
        },
      },
      branch: true,
      permissions: true,
    },
  });
});

// Cached across requests for 5 minutes — avoids a DB round-trip on every page nav.
// User name/role/org changes are rare; on change, call revalidateTag(`user-${userId}`).
async function fetchUserBasic(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      role: true,
      organizationId: true,
      branchId: true,
      organization: {
        select: {
          name: true,
          subscription: {
            select: {
              isTrial: true,
              trialEndsAt: true,
              plan: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export const getCurrentUserBasic = memoize(async () => {
  const session = await getSession();
  if (!session) return null;

  return unstable_cache(
    () => fetchUserBasic(session.userId),
    [`user-basic-${session.userId}`],
    { revalidate: 300, tags: [`user-${session.userId}`] }
  )();
});

export function hasPermission(
  userPermissions: { permission: string; granted: boolean }[],
  permission: string
): boolean {
  const found = userPermissions.find((p) => p.permission === permission);
  return found?.granted ?? false;
}

export function hasPlanFeature(
  planFeatures: { feature: string; enabled: boolean }[],
  feature: string
): boolean {
  const found = planFeatures.find((f) => f.feature === feature);
  return found?.enabled ?? false;
}
