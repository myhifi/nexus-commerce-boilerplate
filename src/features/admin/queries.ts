import "server-only";
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
    orderBy: { name: "asc" },
  });
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}