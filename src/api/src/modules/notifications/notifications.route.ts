import { Router } from "express";

import { requireAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";

import {
  getNotifications,
  markRead,
  markAllRead,
} from "./notifications.controller";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
} from "./notifications.schema";

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  requireAuth(),
  validate(listNotificationsSchema),
  getNotifications,
);
notificationsRouter.patch("/read", requireAuth(), markAllRead);
notificationsRouter.patch(
  "/:id/read",
  requireAuth(),
  validate(notificationIdParamSchema),
  markRead,
);
