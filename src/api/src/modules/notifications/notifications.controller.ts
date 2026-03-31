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
  const { page, pageSize } = listNotificationsSchema.parse(req.query);

  const result = await listNotifications(userId, page, pageSize);
  return sendSuccess(res, { data: result });
}

export async function markRead(req: Request, res: Response) {
  const userId = req.auth!.userId;
  const { id } = notificationIdParamSchema.parse(req.params);

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
