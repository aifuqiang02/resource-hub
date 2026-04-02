import { Router } from "express";
import multer from "multer";

import { requireAuth } from "../../middlewares/auth";

import { uploadPublishScreenshotController } from "./uploads.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export const uploadsRouter = Router();

// 页面使用 - 上传资源截图
uploadsRouter.post(
  "/publish-image",
  requireAuth(),
  upload.single("file"),
  uploadPublishScreenshotController,
);
