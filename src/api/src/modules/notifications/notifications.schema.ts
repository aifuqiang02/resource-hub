import { z } from "zod";

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
