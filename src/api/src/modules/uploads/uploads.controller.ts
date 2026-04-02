import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http-response";

import { uploadPublishScreenshot } from "./uploads.service";

export async function uploadPublishScreenshotController(
  req: Request,
  res: Response,
) {
  const data = await uploadPublishScreenshot(req.file as Express.Multer.File);

  return sendSuccess(res, {
    data,
  });
}
