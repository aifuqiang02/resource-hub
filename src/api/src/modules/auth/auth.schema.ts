import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(100),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const wechatLoginSchema = z.object({
  body: z.object({
    openId: z.string().min(1),
    unionId: z.string().nullable().optional(),
    nickname: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const logoutSchema = refreshSchema;
