import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import * as bcrypt from "bcryptjs";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Clear existing data to prevent duplicate errors on re-runs
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Categories
  const electronics = await prisma.category.create({
    data: { name: "Electronics", nameEn: "Electronics", slug: "electronics" },
  });
  const apparel = await prisma.category.create({
    data: { name: "Apparel", nameEn: "Apparel", slug: "apparel" },
  });

  // 3. Create Products
  await prisma.product.create({
    data: {
      name: "Wireless Headphones",
      nameEn: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "High-quality noise-cancelling headphones.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      isAvailable: true,
      isFeatured: true,
      categoryId: electronics.id,
      variants: {
        create: [
          { name: "Black", price: 299.99, stock: 50 },
          { name: "White", price: 299.99, stock: 30 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Smart Watch",
      nameEn: "Smart Watch",
      slug: "smart-watch",
      description: "Fitness tracker with heart rate monitor.",
      price: 199.5,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      isAvailable: true,
      isFeatured: false,
      categoryId: electronics.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Classic T-Shirt",
      nameEn: "Classic T-Shirt",
      slug: "classic-t-shirt",
      description: "100% cotton minimalist t-shirt.",
      price: 29.99,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      isAvailable: true,
      isFeatured: true,
      categoryId: apparel.id,
      variants: {
        create: [
          { name: "Small", price: 29.99, stock: 100 },
          { name: "Medium", price: 29.99, stock: 100 },
          { name: "Large", price: 29.99, stock: 100 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Denim Jacket",
      nameEn: "Denim Jacket",
      slug: "denim-jacket",
      description: "Vintage wash denim jacket.",
      price: 89.0,
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
      isAvailable: false, // Test the "Unavailable" badge state
      isFeatured: false,
      categoryId: apparel.id,
    },
  });

  // 4. Create Admin User
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@nexus.com" },
    update: {},
    create: {
      email: "admin@nexus.com",
      passwordHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("👤 Admin user created: admin@nexus.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });