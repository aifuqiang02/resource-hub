import type { Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import { sendSuccess } from "../../lib/http-response";

import {
  listNotificationsSchema,
  notificationIdParamSchema,
} from "./notifications.schema";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.service";

export async function getNotifications(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { query } = listNotificationsSchema.parse({
    body: req.body,
    params: req.params,
    query: req.query,
  });
  const { page, pageSize } = query;

  const result = await listNotifications(userId, page, pageSize);
  return sendSuccess(res, { data: result });
}

export async function markRead(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { params } = notificationIdParamSchema.parse({
    body: req.body,
    params: req.params,
    query: req.query,
  });
  const { id } = params;

  const notification = await markNotificationRead(userId, id);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return sendSuccess(res, { data: { message: "success" } });
}

export async function markAllRead(req: Request, res: Response) {
  const userId = req.auth!.userId;
  await markAllNotificationsRead(userId);
  return sendSuccess(res, { data: { message: "success" } });
}
