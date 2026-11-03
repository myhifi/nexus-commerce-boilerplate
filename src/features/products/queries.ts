import "server-only"; // Prevents accidental import in Client Components
import { prisma } from "@/shared/lib/prisma";
import type { ProductCardData } from "./components/ProductCard";

/**
 * Fetches all available products for the storefront.
 * Maps the Prisma Decimal types and relations to a serializable shape
 * that perfectly matches the `ProductCardData` interface.
 */
export async function getStorefrontProducts(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
    },
    include: {
      // We only need the ID to know if a product has variants
      variants: {
        select: { id: true },
      },
      // We only need the ID to know if a product has modifiers
      modifiers: {
        select: { id: true },
      },
    },
    orderBy: [
      { isFeatured: "desc" }, // Show featured items first
      { createdAt: "desc" },  // Then newest items
    ],
  });

  // Map the raw Prisma data to the clean DTO (Data Transfer Object)
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameEn: product.nameEn,
    // Prisma Decimal objects must be converted to strings for serialization
    price: product.price.toString(),
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    hasVariants: product.variants.length > 0,
    hasModifiers: product.modifiers.length > 0,
  }));
}