import { httpClient } from '@/services/http/client'

export interface CreateResourcePayload {
  title: string
  category: string
  shareLink: string
  contentMd: string
  tags: string[]
  screenshotObjectKey: string
  screenshotUrl?: string
}

export interface CreatedResource {
  id: string
  title: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE'
  pointsCost: number
  description?: string | null
  ratingAvg?: number
  ratingCount?: number
  owned?: boolean
  shareLink: string | null
  screenshotObjectKey: string | null
  screenshotUrl: string | null
  tags: string[]
  createdAt: string
  category: {
    id: string
    name: string
    slug: string
  } | null
}

export interface ResourceListItem extends CreatedResource {
  downloadCount: number
  contentMd: string | null
  updatedAt: string
  uploader?: {
    id: string
    nickname: string | null
    email: string | null
  }
}

export interface ResourceListResponse {
  items: ResourceListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  tabCounts: {
    all: number
    pending: number
    approved: number
    rejected: number
    offline: number
  }
}

export interface ReviewResourceListResponse {
  items: ResourceListItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  tabCounts: {
    all: number
    pending: number
    approved: number
    rejected: number
    offline: number
  }
}

export interface PublicResourceListResponse {
  items: ResourceListItem[]
  categories: Array<{
    id: string
    name: string
    slug: string
    count: number
  }>
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const createResource = async (payload: CreateResourcePayload) => {
  const response = await httpClient.post<{ code: number; data: CreatedResource; msg: string }>(
    '/resources',
    payload,
  )

  return response.data
}

export interface ListMyResourcesParams {
  page: number
  pageSize: number
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE'
  q?: string
}

export interface ListReviewResourcesParams {
  page: number
  pageSize: number
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE'
  q?: string
}

export interface UpdateResourcePayload {
  title: string
  category: string
  shareLink: string
  contentMd: string
  tags: string[]
}

export interface AiOnlineFillPayload {
  keyInfo: string
}

export interface AiOnlineFillResult {
  title: string
  category: string
  tags: string[]
  contentMd: string
}

export const listMyResources = async (params: ListMyResourcesParams) => {
  const response = await httpClient.get<{ code: number; data: ResourceListResponse; msg: string }>('/resources/mine', {
    params,
  })

  return response.data
}

export const updateResource = async (resourceId: string, payload: UpdateResourcePayload) => {
  const response = await httpClient.patch<{ code: number; data: ResourceListItem; msg: string }>(
    `/resources/${resourceId}`,
    payload,
  )

  return response.data
}

export const aiOnlineFill = async (payload: AiOnlineFillPayload) => {
  const response = await httpClient.post<{ code: number; data: AiOnlineFillResult; msg: string }>(
    '/resources/ai-online-fill',
    payload,
  )

  return response.data
}

export const deleteResource = async (resourceId: string) => {
  const response = await httpClient.delete<{ code: number; data: null; msg: string }>(`/resources/${resourceId}`)

  return response
}

export const listReviewResources = async (params: ListReviewResourcesParams) => {
  const response = await httpClient.get<{ code: number; data: ReviewResourceListResponse; msg: string }>('/resources/review', {
    params,
  })

  return response.data
}

export const reviewResourceStatus = async (
  resourceId: string,
  status: 'APPROVED' | 'REJECTED' | 'OFFLINE',
) => {
  const response = await httpClient.patch<{ code: number; data: ResourceListItem; msg: string }>(
    `/resources/${resourceId}/review-status`,
    { status },
  )

  return response.data
}

export interface ListPublicResourcesParams {
  page?: number
  pageSize?: number
  q?: string
  category?: string
  sort?: 'latest' | 'popular'
  freeOnly?: boolean
}

export const listPublicResources = async (params: ListPublicResourcesParams) => {
  const response = await httpClient.get<{ code: number; data: PublicResourceListResponse; msg: string }>('/resources', {
    params,
  })

  return response.data
}

export const getPublicResourceDetail = async (resourceId: string) => {
  const response = await httpClient.get<{ code: number; data: ResourceListItem & { related: ResourceListItem[] }; msg: string }>(`/resources/${resourceId}`)

  return response.data
}

export interface ResourceComment {
  id: string
  rating: number
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export interface ResourceCommentsResponse {
  items: ResourceComment[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const listResourceComments = async (resourceId: string, page = 1, pageSize = 10) => {
  const response = await httpClient.get<{ code: number; data: ResourceCommentsResponse; msg: string }>(
    `/resources/${resourceId}/comments`,
    {
      params: { page, pageSize },
    },
  )

  return response.data
}

export const createResourceComment = async (resourceId: string, payload: { rating: number; content: string }) => {
  const response = await httpClient.post<{ code: number; data: ResourceComment; msg: string }>(
    `/resources/${resourceId}/comments`,
    payload,
  )

  return response.data
}

export const deleteResourceComment = async (resourceId: string, commentId: string) => {
  const response = await httpClient.delete<{ code: number; data: null; msg: string }>(
    `/resources/${resourceId}/comments/${commentId}`,
  )

  return response.data
}
