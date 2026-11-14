import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { env } from "@/shared/env";
import { sendOrderConfirmation } from "@/shared/lib/email/send";
import { prisma } from "@/shared/lib/prisma";
import { stripe } from "@/shared/lib/stripe";

const cartItemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().min(1).nullable(),
      quantity: z.number().int().positive(),
    }),
  )
  .min(1);

const metadataSchema = z.object({
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(1),
  shippingAddress: z.string().min(1),
  locale: z.enum(["ar", "en"]),
  cartItems: z.string(),
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";
    console.error("Webhook signature verification failed.", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return new NextResponse(null, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    console.error(
      `Checkout session ${session.id} completed without paid status.`,
    );
    return new NextResponse(null, { status: 200 });
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existingOrder) {
      return new NextResponse(null, { status: 200 });
    }

    const metadataResult = metadataSchema.safeParse(session.metadata);
    if (!metadataResult.success) {
      throw new Error("Checkout session metadata is incomplete or invalid.");
    }

    const metadata = metadataResult.data;
    let rawCartItems: unknown;

    try {
      rawCartItems = JSON.parse(metadata.cartItems);
    } catch {
      throw new Error("Checkout session cart metadata is invalid JSON.");
    }

    const cartItemsResult = cartItemsSchema.safeParse(rawCartItems);
    if (!cartItemsResult.success) {
      throw new Error("Checkout session cart metadata is invalid.");
    }

    const cartItems = cartItemsResult.data;
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: cartItems.map((item) => item.productId) } },
      include: { variants: true },
    });

    let calculatedTotalCents = 0;
    const orderItemsToCreate: {
      productId: string;
      variantId: string | null;
      quantity: number;
      priceAtOrder: number;
    }[] = [];
    const emailItems: {
      name: string;
      variantName: string | null;
      modifiers: [];
      quantity: number;
      priceAtOrder: number;
    }[] = [];

    for (const item of cartItems) {
      const dbProduct = dbProducts.find(
        (product) => product.id === item.productId,
      );
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      let priceAtOrder = Number(dbProduct.price);
      let variantName: string | null = null;

      if (item.variantId) {
        const dbVariant = dbProduct.variants.find(
          (variant) => variant.id === item.variantId,
        );
        if (!dbVariant) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }
        priceAtOrder = Number(dbVariant.price);
        variantName = dbVariant.name;
      }

      calculatedTotalCents += Math.round(priceAtOrder * 100) * item.quantity;
      orderItemsToCreate.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtOrder,
      });
      emailItems.push({
        name: dbProduct.name,
        variantName,
        modifiers: [],
        quantity: item.quantity,
        priceAtOrder,
      });
    }

    if (
      session.amount_total === null ||
      calculatedTotalCents !== session.amount_total
    ) {
      throw new Error("Stripe total does not match the current product prices.");
    }

    const currency = session.currency?.toUpperCase();
    if (!currency) {
      throw new Error("Stripe checkout session has no currency.");
    }

    const order = await prisma.order.create({
      data: {
        guestName: metadata.guestName,
        guestEmail: metadata.guestEmail,
        guestPhone: metadata.guestPhone,
        shippingAddress: metadata.shippingAddress,
        fulfillmentType: "SHIPPING",
        totalAmount: calculatedTotalCents / 100,
        currency,
        status: "PAID",
        stripeSessionId: session.id,
        items: {
          create: orderItemsToCreate,
        },
      },
    });

    const emailResult = await sendOrderConfirmation({
      to: metadata.guestEmail,
      guestName: metadata.guestName,
      orderId: order.id,
      items: emailItems,
      subtotal: calculatedTotalCents / 100,
      shippingAmount: 0,
      totalAmount: calculatedTotalCents / 100,
      currency,
      fulfillmentType: "SHIPPING",
      shippingAddress: metadata.shippingAddress,
      tableNumber: null,
      locale: metadata.locale,
    });

    if (!emailResult.success) {
      console.error(
        `Order ${order.id} was saved, but the confirmation email failed:`,
        emailResult.error,
      );
    }

    console.info(`Order ${order.id} successfully created.`);
  } catch (error) {
    console.error("Error processing webhook order:", error);
    return new NextResponse("Error processing order", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
