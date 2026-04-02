import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(["USER", "EDITOR", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "BANNED"]).optional(),
  q: z.string().trim().min(1).optional(),
});

export const listUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: paginationSchema,
});

export const userIdParamSchema = z.object({
  body: z.object({}),
  params: z.object({
    userId: z.string().min(1),
  }),
  query: z.object({}),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      nickname: z.string().trim().min(1).max(100).optional(),
      role: z.enum(["USER", "EDITOR", "ADMIN"]).optional(),
      status: z.enum(["ACTIVE", "BANNED"]).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
  params: z.object({
    userId: z.string().min(1),
  }),
  query: z.object({}),
});

export const listMyPointTransactionsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(20).default(10),
  }),
});
