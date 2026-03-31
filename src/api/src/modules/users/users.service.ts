import type {
  Prisma,
  UserRole,
  UserStatus,
} from "../../generated/prisma/index";
import { AppError } from "../../lib/app-error";
import { prisma } from "../../lib/prisma";
import { createNotification } from "../notifications/notifications.service";

import { userPublicSelect } from "./user.select";

type ListUsersInput = {
  page: number;
  pageSize: number;
  role?: UserRole;
  status?: UserStatus;
  q?: string;
};

function buildUserWhere(input: ListUsersInput): Prisma.UserWhereInput {
  return {
    role: input.role,
    status: input.status,
    ...(input.q
      ? {
          OR: [
            {
              email: {
                contains: input.q,
                mode: "insensitive",
              },
            },
            {
              nickname: {
                contains: input.q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}

export async function listUsers(input: ListUsersInput) {
  const where = buildUserWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: input.pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: userPublicSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateUser(
  userId: string,
  input: {
    nickname?: string;
    role?: UserRole;
    status?: UserStatus;
  },
) {
  await getUserById(userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: userPublicSelect,
  });

  if (input.status === "BANNED") {
    try {
      await createNotification({
        userId: user.id,
        type: "ACCOUNT_BANNED",
        title: "账号已被禁用",
        content: "您的账号因违规已被禁用，请联系客服了解详情",
        metadata: { reason: "违规行为" },
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  return user;
}

export async function deleteUser(userId: string) {
  await getUserById(userId);

  await prisma.user.delete({
    where: { id: userId },
  });
}

export async function getUserDashboard(userId: string) {
  const [user, totalDownloads, totalUploads, recentPointTxs, recentUploads] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          pointsBalance: true,
          createdAt: true,
        },
      }),
      prisma.downloadHistory.count({
        where: { userId },
      }),
      prisma.resource.count({
        where: { uploaderId: userId },
      }),
      prisma.pointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.resource.findMany({
        where: { uploaderId: userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          downloadCount: true,
          createdAt: true,
        },
      }),
    ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    profile: {
      id: user.id,
      name: user.nickname || "微信用户",
      avatarUrl: user.avatarUrl,
      pointsBalance: user.pointsBalance,
      joinedAt: user.createdAt,
    },
    stats: {
      totalDownloads,
      totalUploads,
    },
    pointTransactions: recentPointTxs,
    recentUploads,
  };
}

export async function listMyPointTransactions(input: {
  userId: string;
  page: number;
  pageSize: number;
}) {
  const skip = (input.page - 1) * input.pageSize;
  const where = { userId: input.userId };

  const [items, total] = await Promise.all([
    prisma.pointsTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize,
    }),
    prisma.pointsTransaction.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}
