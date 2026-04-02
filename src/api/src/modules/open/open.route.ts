import { Router } from "express";

import { requireKeyAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";

import {
  createResourceController,
  deleteResourceController,
  listMyResourcesController,
  updateResourceController,
} from "../resources/resources.controller";
import {
  createResourceSchema,
  listMyResourcesSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from "../resources/resources.schema";
import { uploadPublishScreenshotController } from "../uploads/uploads.controller";

import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export const openRouter = Router();

// 对外接口 - 获取当前用户的资源列表（key 认证）
openRouter.get(
  "/resources/mine",
  requireKeyAuth(),
  validate(listMyResourcesSchema),
  listMyResourcesController,
);

// 对外接口 - 创建新资源（key 认证）
openRouter.post(
  "/resources",
  requireKeyAuth(),
  validate(createResourceSchema),
  createResourceController,
);

// 对外接口 - 更新资源（key 认证）
openRouter.patch(
  "/resources/:resourceId",
  requireKeyAuth(),
  validate(updateResourceSchema),
  updateResourceController,
);

// 对外接口 - 删除资源（key 认证）
openRouter.delete(
  "/resources/:resourceId",
  requireKeyAuth(),
  validate(resourceIdParamSchema),
  deleteResourceController,
);

// 对外接口 - 上传资源截图（key 认证）
openRouter.post(
  "/uploads/publish-image",
  requireKeyAuth(),
  upload.single("file"),
  uploadPublishScreenshotController,
);
