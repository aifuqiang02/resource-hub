import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/app-error";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../lib/tokens";

export function requireAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        throw new AppError("Unauthorized", 401);
      }

      const token = header.slice("Bearer ".length);
      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, status: true },
      });

      if (!user || user.status !== "ACTIVE") {
        throw new AppError("Unauthorized", 401);
      }

      req.auth = { userId: user.id, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRole(...roles: Array<"USER" | "EDITOR" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!roles.includes(req.auth.role as "USER" | "EDITOR" | "ADMIN")) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
}

export function optionalAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        return next();
      }

      const token = header.slice("Bearer ".length);
      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, status: true },
      });

      if (user && user.status === "ACTIVE") {
        req.auth = { userId: user.id, role: user.role };
      }

      next();
    } catch {
      next();
    }
  };
}

export function requireKeyAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const key = req.headers["x-user-key"] as string;
      if (!key) {
        throw new AppError("Missing x-user-key header", 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: key },
        select: { id: true, role: true, status: true },
      });

      if (!user || user.status !== "ACTIVE") {
        throw new AppError("Invalid key", 401);
      }

      req.auth = { userId: user.id, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
}
