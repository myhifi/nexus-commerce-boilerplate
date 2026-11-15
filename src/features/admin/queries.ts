import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/prisma";

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

export async function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getDashboardStats() {
  const [totalOrders, totalProducts, totalUsers, revenueResult] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "PAID" },
      }),
    ]);

  const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { is: { status: "PAID" } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: topProductsRaw.map((item) => item.productId) } },
    select: { id: true, name: true, nameEn: true, imageUrl: true },
  });

  const topProducts = topProductsRaw.flatMap((item) => {
    const product = products.find(({ id }) => id === item.productId);
    return product
      ? [{ ...product, totalSold: item._sum.quantity ?? 0 }]
      : [];
  });

  const weeklyRevenue = [1200, 1900, 800, 2400, 1500, 3200, 2100];

  return {
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
    },
    recentOrders,
    topProducts,
    weeklyRevenue,
  };
}

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Cached version for reading store branding in the layout/Navbar.
 * Invalidated via revalidateTag("store-settings") after saving settings.
 */
export const getStoreSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const settings = await prisma.setting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  },
  ["store-settings"],
  { tags: ["store-settings"] },
);