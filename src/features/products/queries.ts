import "server-only"; // Prevents accidental import in Client Components
import { prisma } from "@/shared/lib/prisma";
import type { ProductCardData } from "./components/ProductCard";
import type { ProductDetailData } from "./components/ProductDetail";

/**
 * Fetches all available products for the storefront.
 * Maps the Prisma Decimal types and relations to a serializable shape
 * that matches the `ProductCardData` interface.
 */
export async function getStorefrontProducts(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
    },
    include: {
      variants: {
        select: { id: true },
      },
      modifiers: {
        select: { id: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameEn: product.nameEn,
    price: product.price.toString(),
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    hasVariants: product.variants.length > 0,
    hasModifiers: product.modifiers.length > 0,
  }));
}

/**
 * Fetches a single product by its slug for the Product Detail page.
 * Includes variants and nested modifier groups.
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailData | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      modifiers: {
        include: {
          modifiers: true,
        },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn,
    slug: product.slug,
    description: product.description,
    descriptionEn: product.descriptionEn,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    basePrice: product.price.toString(),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price.toString(),
      stock: variant.stock,
    })),
    modifierGroups: product.modifiers.map((group) => ({
      id: group.id,
      name: group.name,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      modifiers: group.modifiers.map((modifier) => ({
        id: modifier.id,
        name: modifier.name,
        priceDelta: modifier.priceDelta.toString(),
      })),
    })),
  };
}