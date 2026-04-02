import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http-response";

import {
  acquireResource,
  createResourceComment,
  createResource,
  deleteResource,
  deleteResourceComment,
  getPublicResourceDetail,
  listDownloadHistory,
  listMyResources,
  listResourceComments,
  listPublicResources,
  listReviewResources,
  reviewResourceStatus,
  updateResource,
  aiOnlineFill,
} from "./resources.service";

export async function createResourceController(req: Request, res: Response) {
  const data = await createResource({
    ...req.body,
    uploaderId: req.auth!.userId,
  });

  return sendSuccess(res, {
    data,
    msg: "资源已提交审核",
  });
}

export async function listMyResourcesController(req: Request, res: Response) {
  const rawQuery = req.query.q;

  const data = await listMyResources({
    uploaderId: req.auth!.userId,
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
    status:
      (req.query.status as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "OFFLINE"
        | undefined) ?? undefined,
    q: typeof rawQuery === "string" ? rawQuery : undefined,
  });

  return sendSuccess(res, { data });
}

export async function updateResourceController(req: Request, res: Response) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";

  const data = await updateResource({
    ...req.body,
    resourceId,
    uploaderId: req.auth!.userId,
  });

  return sendSuccess(res, {
    data,
    msg: "资源已更新",
  });
}

export async function deleteResourceController(req: Request, res: Response) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";

  await deleteResource({
    resourceId,
    uploaderId: req.auth!.userId,
  });

  return sendSuccess(res, {
    data: null,
    msg: "资源已删除",
  });
}

export async function listPublicResourcesController(req: Request, res: Response) {
  const rawQuery = req.query.q;

  const data = await listPublicResources({
    q: typeof rawQuery === "string" ? rawQuery : undefined,
    category:
      typeof req.query.category === "string" ? req.query.category : undefined,
    sort: req.query.sort === "popular" ? "popular" : "latest",
    freeOnly: String(req.query.freeOnly) === "true",
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
    userId: req.auth?.userId,
  });

  return sendSuccess(res, { data });
}

export async function getPublicResourceDetailController(
  req: Request,
  res: Response,
) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";
  const data = await getPublicResourceDetail(
    resourceId,
    req.auth?.userId,
    req.auth?.role,
  );

  return sendSuccess(res, { data });
}

export async function listResourceCommentsController(req: Request, res: Response) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";

  const data = await listResourceComments({
    resourceId,
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
  });

  return sendSuccess(res, { data });
}

export async function createResourceCommentController(
  req: Request,
  res: Response,
) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";

  const data = await createResourceComment({
    resourceId,
    userId: req.auth!.userId,
    rating: req.body.rating,
    content: req.body.content,
  });

  return sendSuccess(res, {
    data,
    msg: "评价已提交",
  });
}

export async function deleteResourceCommentController(req: Request, res: Response) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";
  const commentId =
    typeof req.params.commentId === "string" ? req.params.commentId : "";

  await deleteResourceComment({
    resourceId,
    commentId,
    userId: req.auth!.userId,
  });

  return sendSuccess(res, {
    msg: "评论已删除",
  });
}

export async function acquireResourceController(req: Request, res: Response) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";

  const data = await acquireResource({
    resourceId,
    userId: req.auth!.userId,
  });

  return sendSuccess(res, {
    data,
    msg: "资源获取成功",
  });
}

export async function listDownloadHistoryController(
  req: Request,
  res: Response,
) {
  const data = await listDownloadHistory({
    userId: req.auth!.userId,
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
  });

  return sendSuccess(res, { data });
}

export async function listReviewResourcesController(
  req: Request,
  res: Response,
) {
  const rawQuery = req.query.q;

  const data = await listReviewResources({
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
    status:
      (req.query.status as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "OFFLINE"
        | undefined) ?? undefined,
    q: typeof rawQuery === "string" ? rawQuery : undefined,
  });

  return sendSuccess(res, { data });
}

export async function reviewResourceStatusController(
  req: Request,
  res: Response,
) {
  const resourceId =
    typeof req.params.resourceId === "string" ? req.params.resourceId : "";

  const data = await reviewResourceStatus({
    resourceId,
    status: req.body.status,
  });

  return sendSuccess(res, {
    data,
    msg: "资源状态已更新",
  });
}

export async function aiOnlineFillController(req: Request, res: Response) {
  const data = await aiOnlineFill({
    keyInfo: req.body.keyInfo,
    userId: req.auth!.userId,
  });

  return sendSuccess(res, { data });
}
