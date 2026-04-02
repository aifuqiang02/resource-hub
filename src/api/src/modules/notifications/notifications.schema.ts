import { z } from "zod";

export const listNotificationsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export const notificationIdParamSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
