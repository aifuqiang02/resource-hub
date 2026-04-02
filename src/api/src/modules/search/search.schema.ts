import { z } from "zod";

export const recordSearchSchema = z.object({
  body: z.object({
    keyword: z.string().min(1).max(100),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const listHotKeywordsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});
