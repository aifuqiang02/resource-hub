import { AppError } from "../../lib/app-error";
import { hashPassword, verifyPassword } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/tokens";

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      nickname: input.name,
      passwordHash,
    },
  });

  return issueAuthTokens(user.id, {
    id: user.id,
    email: user.email,
    name: user.nickname || "用户",
    role: user.role,
  });
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return issueAuthTokens(user.id, {
    id: user.id,
    email: user.email,
    name: user.nickname || "用户",
    role: user.role,
  });
}

export async function wechatLoginUser(input: {
  openId: string;
  unionId?: string;
  nickname?: string;
  avatarUrl?: string;
}) {
  let user = await prisma.user.findUnique({
    where: { openId: input.openId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        openId: input.openId,
        unionId: input.unionId,
        nickname: input.nickname || `微信用户_${input.openId.slice(-6)}`,
        avatarUrl: input.avatarUrl || null,
      },
    });
  } else {
    if (input.nickname || input.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: input.nickname || user.nickname,
          avatarUrl: input.avatarUrl || user.avatarUrl,
        },
      });
    }
  }

  return issueAuthTokens(user.id, {
    id: user.id,
    email: user.email,
    name: user.nickname || "微信用户",
    role: user.role,
    avatarUrl: user.avatarUrl,
  });
}

export async function refreshSession(refreshToken: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  if (payload.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: true,
    },
  });

  if (
    !storedToken ||
    storedToken.userId !== payload.sub ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date() ||
    storedToken.user.status !== "ACTIVE"
  ) {
    throw new AppError("Invalid refresh token", 401);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return issueAuthTokens(storedToken.user.id, {
    id: storedToken.user.id,
    email: storedToken.user.email,
    name: storedToken.user.nickname || "用户",
    role: storedToken.user.role,
    avatarUrl: storedToken.user.avatarUrl,
  });
}

export async function logoutSession(refreshToken: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revokedAt) {
    throw new AppError("Refresh token not found", 404);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });
}

export async function cleanupRefreshTokens() {
  const now = new Date();

  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: now,
          },
        },
        {
          revokedAt: {
            not: null,
          },
        },
      ],
    },
  });

  return result.count;
}

async function issueAuthTokens(
  userId: string,
  user: { id: string; email: string | null; name: string; role: string; avatarUrl?: string | null; pointsBalance?: number },
) {
  await cleanupUserRefreshTokens(userId);

  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { pointsBalance: true },
  })

  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const roleMap: Record<string, string> = {
    USER: 'viewer',
    EDITOR: 'editor',
    ADMIN: 'admin',
  }

  return {
    accessToken,
    refreshToken,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl || undefined,
      roles: [roleMap[user.role] || 'viewer'],
      pointsBalance: fullUser?.pointsBalance ?? 0,
    },
  };
}

async function cleanupUserRefreshTokens(userId: string) {
  const now = new Date();

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      OR: [
        {
          expiresAt: {
            lt: now,
          },
        },
        {
          revokedAt: {
            not: null,
          },
        },
      ],
    },
  });
}
