import { z } from "zod";

const resourceStatusFilterSchema = z
  .enum(["PENDING", "APPROVED", "REJECTED", "OFFLINE"])
  .optional();

const booleanQuerySchema = z.preprocess((value) => {
  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const createResourceSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120),
    category: z.string().trim().min(1).max(50),
    shareLink: z.string().trim().url(),
    contentMd: z.string().trim().min(1).max(20_000),
    tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
    screenshotObjectKey: z.string().trim().min(1),
    screenshotUrl: z.string().trim().url().optional().or(z.literal("")),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const listMyResourcesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
    status: resourceStatusFilterSchema,
    q: z.string().trim().max(120).optional(),
  }),
});

export const resourceIdParamSchema = z.object({
  body: z.object({}),
  params: z.object({
    resourceId: z.string().min(1),
  }),
  query: z.object({}),
});

export const updateResourceSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    shareLink: z.string().trim().min(1).max(2000).optional(),
    contentMd: z.string().trim().min(1).max(20_000).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]).optional(),
  }),
  params: z.object({
    resourceId: z.string().min(1),
  }),
  query: z.object({}),
});

export const aiOnlineFillSchema = z.object({
  body: z.object({
    keyInfo: z.string().trim().min(1).max(8000),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const listPublicResourcesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    q: z.string().trim().max(120).optional(),
    category: z.string().trim().max(100).optional(),
    sort: z.enum(["latest", "popular"]).default("latest"),
    freeOnly: booleanQuerySchema.default(false),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(20).default(10),
  }),
});

export const listResourceCommentsSchema = z.object({
  body: z.object({}),
  params: z.object({
    resourceId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(20).default(10),
  }),
});

export const createResourceCommentSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    content: z.string().trim().min(1).max(1000),
  }),
  params: z.object({
    resourceId: z.string().min(1),
  }),
  query: z.object({}),
});

export const deleteResourceCommentSchema = z.object({
  body: z.object({}),
  params: z.object({
    resourceId: z.string().min(1),
    commentId: z.string().min(1),
  }),
  query: z.object({}),
});

export const acquireResourceSchema = z.object({
  body: z.object({}),
  params: z.object({
    resourceId: z.string().min(1),
  }),
  query: z.object({}),
});

export const listDownloadHistorySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(20).default(10),
  }),
});

export const listReviewResourcesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(20).default(10),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "OFFLINE"]).optional(),
    q: z.string().trim().max(120).optional(),
  }),
});

export const reviewResourceStatusSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "OFFLINE"]),
  }),
  params: z.object({
    resourceId: z.string().min(1),
  }),
  query: z.object({}),
});

export type AiOnlineFillInput = z.infer<typeof aiOnlineFillSchema>;
