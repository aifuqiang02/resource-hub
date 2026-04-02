import type { Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../../lib/http-response";
import { prisma } from "../../lib/prisma";

import { userPublicSelect } from "./user.select";
import {
  deleteUser,
  getUserDashboard,
  getUserById,
  listMyPointTransactions,
  listUsers,
  updateUser,
} from "./users.service";

export async function getCurrentUser(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: userPublicSelect,
  });

  return sendSuccess(res, {
    data: { user },
  });
}

export async function getCurrentUserDashboard(req: Request, res: Response) {
  const data = await getUserDashboard(req.auth!.userId);

  return sendSuccess(res, {
    data,
  });
}

export async function getCurrentUserPointTransactions(
  req: Request,
  res: Response,
) {
  const data = await listMyPointTransactions({
    userId: req.auth!.userId,
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
  });

  return sendSuccess(res, {
    data,
  });
}

export async function getUsers(req: Request, res: Response) {
  const result = await listUsers({
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
    role: req.query.role as "USER" | "EDITOR" | "ADMIN" | undefined,
    status: req.query.status as "ACTIVE" | "BANNED" | undefined,
    q: req.query.q as string | undefined,
  });

  return sendSuccess(res, {
    data: {
      items: result.items,
      pagination: result.pagination,
    },
  });
}

export async function getUser(req: Request, res: Response) {
  const user = await getUserById(String(req.params.userId));
  return sendSuccess(res, {
    data: { user },
  });
}

export async function patchUser(req: Request, res: Response) {
  const user = await updateUser(String(req.params.userId), req.body);
  return sendSuccess(res, {
    data: { user },
  });
}

export async function removeUser(req: Request, res: Response) {
  await deleteUser(String(req.params.userId));
  return sendNoContent(res);
}
