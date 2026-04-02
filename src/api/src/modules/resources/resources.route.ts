import { Router } from "express";

import { optionalAuth, requireAuth, requireRole } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";

import {
  acquireResourceController,
  createResourceCommentController,
  createResourceController,
  deleteResourceController,
  deleteResourceCommentController,
  getPublicResourceDetailController,
  listDownloadHistoryController,
  listMyResourcesController,
  listResourceCommentsController,
  listPublicResourcesController,
  listReviewResourcesController,
  reviewResourceStatusController,
  updateResourceController,
  aiOnlineFillController,
} from "./resources.controller";
import {
  acquireResourceSchema,
  aiOnlineFillSchema,
  createResourceCommentSchema,
  createResourceSchema,
  deleteResourceCommentSchema,
  listDownloadHistorySchema,
  listMyResourcesSchema,
  listPublicResourcesSchema,
  listResourceCommentsSchema,
  listReviewResourcesSchema,
  resourceIdParamSchema,
  reviewResourceStatusSchema,
  updateResourceSchema,
} from "./resources.schema";

export const resourcesRouter = Router();

// 页面使用 - 获取当前用户的资源列表
resourcesRouter.get(
  "/mine",
  requireAuth(),
  validate(listMyResourcesSchema),
  listMyResourcesController,
);

// 页面使用 - 获取下载历史
resourcesRouter.get(
  "/download-history",
  requireAuth(),
  validate(listDownloadHistorySchema),
  listDownloadHistoryController,
);

// 页面使用 - 获取待审核资源列表（编辑/管理员）
resourcesRouter.get(
  "/review",
  requireAuth(),
  requireRole("EDITOR", "ADMIN"),
  validate(listReviewResourcesSchema),
  listReviewResourcesController,
);

// 公开接口 - 获取公开资源列表
resourcesRouter.get(
  "/",
  optionalAuth(),
  validate(listPublicResourcesSchema),
  listPublicResourcesController,
);

// 公开接口 - 获取资源评论列表
resourcesRouter.get(
  "/:resourceId/comments",
  validate(listResourceCommentsSchema),
  listResourceCommentsController,
);

// 页面使用 - 创建资源评论
resourcesRouter.post(
  "/:resourceId/comments",
  requireAuth(),
  validate(createResourceCommentSchema),
  createResourceCommentController,
);

// 页面使用 - 删除资源评论
resourcesRouter.delete(
  "/:resourceId/comments/:commentId",
  requireAuth(),
  validate(deleteResourceCommentSchema),
  deleteResourceCommentController,
);

// 页面使用 - 创建新资源
resourcesRouter.post(
  "/",
  requireAuth(),
  validate(createResourceSchema),
  createResourceController,
);

// 页面使用 - AI 在线录入（占位接口）
resourcesRouter.post(
  "/ai-online-fill",
  requireAuth(),
  validate(aiOnlineFillSchema),
  aiOnlineFillController,
);

// 页面使用 - 获取资源
resourcesRouter.post(
  "/:resourceId/acquire",
  requireAuth(),
  validate(acquireResourceSchema),
  acquireResourceController,
);

// 公开接口 - 获取资源详情
resourcesRouter.get(
  "/:resourceId",
  optionalAuth(),
  validate(resourceIdParamSchema),
  getPublicResourceDetailController,
);

// 页面使用 - 审核资源状态（编辑/管理员）
resourcesRouter.patch(
  "/:resourceId/review-status",
  requireAuth(),
  requireRole("EDITOR", "ADMIN"),
  validate(reviewResourceStatusSchema),
  reviewResourceStatusController,
);

// 页面使用 - 更新资源
resourcesRouter.patch(
  "/:resourceId",
  requireAuth(),
  validate(updateResourceSchema),
  updateResourceController,
);

// 页面使用 - 删除资源
resourcesRouter.delete(
  "/:resourceId",
  requireAuth(),
  validate(resourceIdParamSchema),
  deleteResourceController,
);
