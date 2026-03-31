import { AppError } from "../../lib/app-error";
import { prisma } from "../../lib/prisma";
import { createNotification } from "../notifications/notifications.service";

function slugifyCategory(name: string) {
  return encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, "-"));
}

function buildDescription(contentMd: string) {
  const normalized = contentMd.replace(/\s+/g, " ").trim();
  return normalized.slice(0, 140) || null;
}

type CreateResourceInput = {
  title: string;
  category: string;
  shareLink: string;
  contentMd: string;
  tags: string[];
  screenshotObjectKey: string;
  screenshotUrl?: string;
  uploaderId: string;
};

async function ensureCategory(categoryName: string) {
  return prisma.resourceCategory.upsert({
    where: {
      slug: slugifyCategory(categoryName),
    },
    update: {
      name: categoryName,
    },
    create: {
      name: categoryName,
      slug: slugifyCategory(categoryName),
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

async function ensureLinkVersion(
  resourceId: string,
  tx: typeof prisma | Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma,
) {
  const existing = await tx.resourceVersion.findFirst({
    where: {
      resourceId,
      isLatest: true,
    },
    select: {
      id: true,
      version: true,
    },
  });

  if (existing) {
    return existing;
  }

  await tx.resourceVersion.updateMany({
    where: {
      resourceId,
      isLatest: true,
    },
    data: {
      isLatest: false,
    },
  });

  return tx.resourceVersion.create({
    data: {
      resourceId,
      version: "share-link-v1",
      isLatest: true,
    },
    select: {
      id: true,
      version: true,
    },
  });
}

function buildResourceWhere(input: {
  uploaderId: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "OFFLINE";
  q?: string;
}) {
  const q = input.q?.trim();

  return {
    uploaderId: input.uploaderId,
    ...(input.status ? { status: input.status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { contentMd: { contains: q, mode: "insensitive" as const } },
            { shareLink: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ],
        }
      : {}),
  };
}

function resourceSelect() {
  return {
    id: true,
    title: true,
    status: true,
    pointsCost: true,
    description: true,
    shareLink: true,
    screenshotObjectKey: true,
    screenshotUrl: true,
    tags: true,
    downloadCount: true,
    ratingAvg: true,
    ratingCount: true,
    contentMd: true,
    createdAt: true,
    updatedAt: true,
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
  } as const;
}

async function attachOwnership<T extends Array<{ id: string }>>(
  items: T,
  userId?: string,
) {
  if (!userId || items.length === 0) {
    return items.map((item) => ({
      ...item,
      owned: false,
    }));
  }

  const ownedRows = await prisma.downloadHistory.findMany({
    where: {
      userId,
      resourceId: {
        in: items.map((item) => item.id),
      },
    },
    distinct: ["resourceId"],
    select: {
      resourceId: true,
    },
  });

  const ownedSet = new Set(ownedRows.map((item) => item.resourceId));

  return items.map((item) => ({
    ...item,
    owned: ownedSet.has(item.id),
  }));
}

export async function createResource(input: CreateResourceInput) {
  const categoryName = input.category.trim();
  const category = await ensureCategory(categoryName);

  return prisma.resource.create({
    data: {
      title: input.title.trim(),
      description: buildDescription(input.contentMd),
      shareLink: input.shareLink.trim(),
      screenshotObjectKey: input.screenshotObjectKey.trim(),
      screenshotUrl: input.screenshotUrl?.trim() || null,
      tags: input.tags,
      contentMd: input.contentMd.trim(),
      pointsCost: 5,
      status: "PENDING",
      categoryId: category.id,
      uploaderId: input.uploaderId,
      versions: {
        create: {
          version: "share-link-v1",
          isLatest: true,
        },
      },
    },
    select: resourceSelect(),
  });
}

export async function listMyResources(input: {
  uploaderId: string;
  page: number;
  pageSize: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "OFFLINE";
  q?: string;
}) {
  const where = buildResourceWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total, pendingCount, approvedCount, rejectedCount, offlineCount] =
    await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: input.pageSize,
        select: resourceSelect(),
      }),
      prisma.resource.count({ where }),
      prisma.resource.count({
        where: { uploaderId: input.uploaderId, status: "PENDING" },
      }),
      prisma.resource.count({
        where: { uploaderId: input.uploaderId, status: "APPROVED" },
      }),
      prisma.resource.count({
        where: { uploaderId: input.uploaderId, status: "REJECTED" },
      }),
      prisma.resource.count({
        where: { uploaderId: input.uploaderId, status: "OFFLINE" },
      }),
    ]);

  return {
    items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
    tabCounts: {
      all: pendingCount + approvedCount + rejectedCount + offlineCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      offline: offlineCount,
    },
  };
}

export async function updateResource(input: {
  resourceId: string;
  uploaderId: string;
  title: string;
  category: string;
  shareLink: string;
  contentMd: string;
  tags: string[];
}) {
  const existing = await prisma.resource.findFirst({
    where: {
      id: input.resourceId,
      uploaderId: input.uploaderId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new AppError("Resource not found", 404);
  }

  const category = await ensureCategory(input.category.trim());

  return prisma.resource.update({
    where: { id: input.resourceId },
    data: {
      title: input.title.trim(),
      description: buildDescription(input.contentMd),
      shareLink: input.shareLink.trim(),
      contentMd: input.contentMd.trim(),
      tags: input.tags,
      categoryId: category.id,
      status: "PENDING",
    },
    select: resourceSelect(),
  });
}

export async function deleteResource(input: {
  resourceId: string;
  uploaderId: string;
}) {
  const existing = await prisma.resource.findFirst({
    where: {
      id: input.resourceId,
      uploaderId: input.uploaderId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new AppError("Resource not found", 404);
  }

  await prisma.$transaction([
    prisma.downloadHistory.deleteMany({
      where: { resourceId: input.resourceId },
    }),
    prisma.resource.delete({
      where: { id: input.resourceId },
    }),
  ]);
}

export async function listPublicResources(input: {
  q?: string;
  category?: string;
  sort: "latest" | "popular";
  freeOnly: boolean;
  page: number;
  pageSize: number;
  userId?: string;
}) {
  const q = input.q?.trim();
  const category = input.category?.trim();
  const where = {
    status: "APPROVED" as const,
    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
    ...(input.freeOnly
      ? {
          pointsCost: 0,
        }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { contentMd: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
            {
              category: {
                name: { contains: q, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };
  const skip = (input.page - 1) * input.pageSize;

  const orderBy =
    input.sort === "popular"
      ? [{ downloadCount: "desc" as const }, { createdAt: "desc" as const }]
      : [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [items, total, categories] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy,
      skip,
      take: input.pageSize,
      select: resourceSelect(),
    }),
    prisma.resource.count({ where }),
    prisma.resourceCategory.findMany({
      where: {
        resources: {
          some: {
            status: "APPROVED",
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            resources: {
              where: {
                status: "APPROVED",
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    items: await attachOwnership(items, input.userId),
    categories: categories.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      count: item._count.resources,
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function getPublicResourceDetail(resourceId: string, userId?: string) {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      status: "APPROVED",
    },
    select: resourceSelect(),
  });

  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  const related = await prisma.resource.findMany({
    where: {
      id: { not: resource.id },
      status: "APPROVED",
      OR: [
        resource.category?.id
          ? {
              categoryId: resource.category.id,
            }
          : undefined,
        resource.tags.length > 0
          ? {
              tags: {
                hasSome: resource.tags,
              },
            }
          : undefined,
      ].filter(Boolean) as Array<
        | { categoryId: string }
        | {
            tags: {
              hasSome: string[];
            };
          }
      >,
    },
    orderBy: [{ downloadCount: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: resourceSelect(),
  });

  const [resourceWithOwnership] = await attachOwnership([resource], userId);
  const relatedWithOwnership = await attachOwnership(related, userId);

  return {
    ...resourceWithOwnership,
    related: relatedWithOwnership,
  };
}

async function ensureApprovedResource(resourceId: string) {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      status: "APPROVED",
    },
    select: resourceSelect(),
  });

  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  return resource;
}

export async function listResourceComments(input: {
  resourceId: string;
  page: number;
  pageSize: number;
}) {
  await ensureApprovedResource(input.resourceId);

  const skip = (input.page - 1) * input.pageSize;
  const where = { resourceId: input.resourceId };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      rating: item.rating,
      content: item.content,
      createdAt: item.createdAt,
      user: {
        id: item.user.id,
        name: item.user.nickname || "用户",
        avatarUrl: item.user.avatarUrl,
      },
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function createResourceComment(input: {
  resourceId: string;
  userId: string;
  rating: number;
  content: string;
}) {
  await ensureApprovedResource(input.resourceId);

  const comment = await prisma.comment.create({
    data: {
      resourceId: input.resourceId,
      userId: input.userId,
      rating: input.rating,
      content: input.content.trim(),
    },
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
        },
      },
    },
  });

  const aggregate = await prisma.comment.aggregate({
    where: {
      resourceId: input.resourceId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  await prisma.resource.update({
    where: { id: input.resourceId },
    data: {
      ratingAvg: aggregate._avg.rating ?? 0,
      ratingCount: aggregate._count.id,
    },
  });

  return {
    id: comment.id,
    rating: comment.rating,
    content: comment.content,
    createdAt: comment.createdAt,
    user: {
      id: comment.user.id,
      name: comment.user.nickname || "用户",
      avatarUrl: comment.user.avatarUrl,
    },
  };
}

export async function acquireResource(input: {
  resourceId: string;
  userId: string;
}) {
  const resource = await ensureApprovedResource(input.resourceId);

  if (!resource.shareLink) {
    throw new AppError("当前资源暂未配置分享链接", 400);
  }

  return prisma.$transaction(async (tx) => {
    const [user, existingHistory, version] = await Promise.all([
      tx.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          pointsBalance: true,
        },
      }),
      tx.downloadHistory.findFirst({
        where: {
          userId: input.userId,
          resourceId: input.resourceId,
        },
        orderBy: {
          downloadedAt: "desc",
        },
        select: {
          id: true,
        },
      }),
      ensureLinkVersion(input.resourceId, tx),
    ]);

    if (!user) {
      throw new AppError("用户不存在", 404);
    }

    const pointsSpent = existingHistory ? 0 : resource.pointsCost;

    if (pointsSpent > 0 && user.pointsBalance < pointsSpent) {
      throw new AppError("积分不足，请先充值", 400);
    }

    const balanceBefore = user.pointsBalance;
    const balanceAfter = balanceBefore - pointsSpent;

    if (pointsSpent > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          pointsBalance: balanceAfter,
        },
      });

      await tx.pointsTransaction.create({
        data: {
          userId: user.id,
          type: "SPEND",
          delta: -pointsSpent,
          balanceBefore,
          balanceAfter,
          referenceType: "RESOURCE_ACQUIRE",
          referenceId: input.resourceId,
        },
      });
    }

    await Promise.all([
      tx.resource.update({
        where: { id: input.resourceId },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      }),
      tx.downloadHistory.create({
        data: {
          userId: user.id,
          resourceId: input.resourceId,
          versionId: version.id,
          pointsSpent,
        },
      }),
    ]);

    return {
      resourceId: resource.id,
      title: resource.title,
      shareLink: resource.shareLink,
      pointsSpent,
      currentPointsBalance: balanceAfter,
      alreadyOwned: Boolean(existingHistory),
    };
  });
}

export async function listDownloadHistory(input: {
  userId: string;
  page: number;
  pageSize: number;
}) {
  const skip = (input.page - 1) * input.pageSize;
  const where = { userId: input.userId };

  const [items, total] = await Promise.all([
    prisma.downloadHistory.findMany({
      where,
      orderBy: {
        downloadedAt: "desc",
      },
      skip,
      take: input.pageSize,
      select: {
        id: true,
        pointsSpent: true,
        downloadedAt: true,
        resource: {
          select: {
            id: true,
            title: true,
            shareLink: true,
          },
        },
        version: {
          select: {
            version: true,
          },
        },
      },
    }),
    prisma.downloadHistory.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
  };
}

export async function listReviewResources(input: {
  page: number;
  pageSize: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "OFFLINE";
  q?: string;
}) {
  const q = input.q?.trim();
  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { shareLink: { contains: q, mode: "insensitive" as const } },
            { uploader: { nickname: { contains: q, mode: "insensitive" as const } } },
            { category: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const skip = (input.page - 1) * input.pageSize;

  const [items, total, pendingCount, approvedCount, rejectedCount, offlineCount] =
    await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: input.pageSize,
        select: {
          ...resourceSelect(),
          uploader: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
      }),
      prisma.resource.count({ where }),
      prisma.resource.count({ where: { status: "PENDING" } }),
      prisma.resource.count({ where: { status: "APPROVED" } }),
      prisma.resource.count({ where: { status: "REJECTED" } }),
      prisma.resource.count({ where: { status: "OFFLINE" } }),
    ]);

  return {
    items,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
    },
    tabCounts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      offline: offlineCount,
      all: pendingCount + approvedCount + rejectedCount + offlineCount,
    },
  };
}

export async function reviewResourceStatus(input: {
  resourceId: string;
  status: "APPROVED" | "REJECTED" | "OFFLINE";
}) {
  const existing = await prisma.resource.findUnique({
    where: { id: input.resourceId },
    select: { id: true, uploaderId: true },
  });

  if (!existing) {
    throw new AppError("Resource not found", 404);
  }

  const resource = await prisma.resource.update({
    where: { id: input.resourceId },
    data: {
      status: input.status,
      publishedAt: input.status === "APPROVED" ? new Date() : null,
    },
    select: {
      ...resourceSelect(),
      uploader: {
        select: {
          id: true,
          nickname: true,
          email: true,
        },
      },
    },
  });

  if (input.status === "APPROVED" || input.status === "REJECTED") {
    await createNotification({
      userId: existing.uploaderId,
      type: "AUDIT_RESULT",
      title: input.status === "APPROVED" ? "资源审核通过" : "资源审核被拒绝",
      content:
        input.status === "APPROVED"
          ? `您上传的资源《${resource.title}》已通过审核`
          : `您上传的资源《${resource.title}》未通过审核`,
      metadata: { resourceId: resource.id, status: input.status },
    });
  }

  return resource;
}
