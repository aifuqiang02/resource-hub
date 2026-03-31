import type { NotificationType, Prisma } from "../../generated/prisma/index";
import { prisma } from "../../lib/prisma";

export type { NotificationType };

export async function listNotifications(
  userId: string,
  page: number,
  pageSize: number,
) {
  const skip = (page - 1) * pageSize;

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    list: items,
    unreadCount,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: data.metadata ?? {},
    },
  });
}
