import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const SECRET = new TextEncoder().encode(jwtSecret || "dev-only-fallback-secret");

const COOKIE_NAME = "sales_session";
const SESSION_DURATION_HOURS = 24;

export interface SessionPayload {
  userId: string;
  role: string;
  organizationId: string | null;
  branchId: string | null;
  sessionId: string;
}

export async function createSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, organizationId: true, branchId: true },
  });

  if (!user) throw new Error("User not found");

  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  const token = await new SignJWT({
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

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

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

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
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

  return user;
}

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
