import jwt from "jsonwebtoken";

import { env } from "../config/env";

export type AuthTokenPayload = {
  userId: string;
  organizationId: string;
  companyId?: string | null;
  branchId?: string | null;
  roleCode: string;
  permissions: string[];
};

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
