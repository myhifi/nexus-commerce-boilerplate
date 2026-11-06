"use server";

import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { storeConfig } from "@/shared/config/store.config";
import { revalidatePath } from "next/cache";

// 1. Define the strict shape of the incoming data
const checkoutSchema = z.object({
  guestName: z.string().min(2, "Name is too short"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(5, "Phone number is too short"),
  shippingAddress: z.string().min(5, "Address is too short"),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().nullable(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart cannot be empty"),
});

export type CheckoutState = {
  success: boolean;
  error?: string;
  orderId?: string;
};

export async function createOrder(
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // 2. Extract items from the hidden input (JSON string)
  let parsedItems = [];
  try {
    const rawItems = formData.get("items") as string;
    parsedItems = JSON.parse(rawItems || "[]");
  } catch {
    return { success: false, error: "Invalid cart data format." };
  }

  // 3. Validate the form data
  const validatedFields = checkoutSchema.safeParse({
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    guestPhone: formData.get("guestPhone"),
    shippingAddress: formData.get("shippingAddress"),
    items: parsedItems,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid form data.",
    };
  }

  const { guestName, guestEmail, guestPhone, shippingAddress, items } =
    validatedFields.data;

  try {
    // 4. SECURITY: Re-fetch real prices from the database
    // We NEVER trust the prices sent from the client.
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    let calculatedTotal = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) throw new Error(`Product not found: ${item.productId}`);

      let priceAtOrder = Number(dbProduct.price);

      // If a variant was selected, use the variant's real price
      if (item.variantId) {
        const dbVariant = dbProduct.variants.find(
          (v) => v.id === item.variantId
        );
        if (!dbVariant) throw new Error(`Variant not found: ${item.variantId}`);
        priceAtOrder = Number(dbVariant.price);
      }

      calculatedTotal += priceAtOrder * item.quantity;

      orderItemsToCreate.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtOrder: priceAtOrder,
      });
    }

    // 5. Create the order and order items in a single transaction
    const order = await prisma.order.create({
      data: {
        guestName,
        guestEmail,
        guestPhone,
        shippingAddress,
        fulfillmentType: "SHIPPING",
        totalAmount: calculatedTotal,
        currency: storeConfig.currency,
        items: {
          create: orderItemsToCreate,
        },
      },
    });

    // 6. Clear the cart cache on the client
    revalidatePath("/cart");

    return { success: true, orderId: order.id };

  } catch (error) {
    console.error("Checkout Error:", error);
    return {
      success: false,
      error: "Failed to process your order. Please try again.",
    };
  }
}