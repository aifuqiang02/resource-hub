import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http-response";
import { listHotKeywords, recordSearch } from "./search.service";

export const recordSearchController = async (req: Request, res: Response) => {
  const { keyword } = req.body as { keyword: string };
  await recordSearch(keyword);
  return sendSuccess(res, { data: null });
};

export const listHotKeywordsController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const keywords = await listHotKeywords(limit);
  return sendSuccess(res, { data: keywords });
};
