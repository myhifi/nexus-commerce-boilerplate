import "server-only";
import { prisma } from "@/shared/lib/prisma";

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });
}