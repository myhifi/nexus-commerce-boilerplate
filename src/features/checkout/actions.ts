"use server";

import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { stripe } from "@/shared/lib/stripe";
import { env } from "@/shared/env";

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
  url?: string; // Changed from orderId to url for Stripe redirect
};

export async function createCheckoutSession(
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  let parsedItems = [];
  try {
    const rawItems = formData.get("items") as string;
    parsedItems = JSON.parse(rawItems || "[]");
  } catch {
    return { success: false, error: "Invalid cart data format." };
  }

  const locale = (formData.get("locale") as string) || "en";

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
    // 1. Re-fetch real prices from the database
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    const lineItems = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) throw new Error(`Product not found: ${item.productId}`);

      let unitPrice = Number(dbProduct.price);
      let variantName = null;

      if (item.variantId) {
        const dbVariant = dbProduct.variants.find((v) => v.id === item.variantId);
        if (!dbVariant) throw new Error(`Variant not found: ${item.variantId}`);
        unitPrice = Number(dbVariant.price);
        variantName = dbVariant.name;
      }

      lineItems.push({
        price_data: {
          currency: "usd", // You can change this to env.NEXT_PUBLIC_CURRENCY
          product_data: {
            name: dbProduct.name + (variantName ? ` (${variantName})` : ""),
            images: dbProduct.imageUrl ? [dbProduct.imageUrl] : [],
          },
          unit_amount: Math.round(unitPrice * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      });
    }

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${env.NEXT_PUBLIC_APP_URL}/${locale}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/${locale}/cart`,
      customer_email: guestEmail,
      // 3. Pass metadata to the Webhook
      metadata: {
        guestName,
        guestEmail,
        guestPhone,
        shippingAddress,
        locale,
        // Store cart items as a JSON string so the webhook knows what to save
        cartItems: JSON.stringify(items), 
      },
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe session URL");
    }

    // 4. Return the URL to redirect the client
    return { success: true, url: session.url };

  } catch (error) {
    console.error("Checkout Error:", error);
    return {
      success: false,
      error: "Failed to process your order. Please try again.",
    };
  }
}