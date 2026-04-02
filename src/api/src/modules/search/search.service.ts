import { prisma } from "../../lib/prisma";

export const recordSearch = async (keyword: string) => {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return;

  await prisma.searchKeyword.upsert({
    where: { keyword: normalized },
    update: { count: { increment: 1 } },
    create: { keyword: normalized, count: 1 },
  });
};

export const listHotKeywords = async (limit: number = 10) => {
  const items = await prisma.searchKeyword.findMany({
    orderBy: { count: "desc" },
    take: limit,
    select: { keyword: true },
  });

  return items.map((item) => item.keyword);
};
