import { NextFunction, Request, Response } from "express";

import { verifyAuthToken } from "../lib/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const token = authorization.replace("Bearer ", "");
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.auth.permissions.includes(permission)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}
