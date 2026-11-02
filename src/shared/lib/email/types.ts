// src/lib/email/types.ts
// ═══════════════════════════════════════════════════
// 📧 Email system types (Nexus Commerce)
// ═══════════════════════════════════════════════════

export type EmailProviderName = "console" | "resend";

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

/**
 * Minimal translator signature.
 * Matches the shape returned by next-intl's `createTranslator`
 * for our namespaced email templates (Email.OrderConfirmation).
 */
export type EmailTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

// ═══════════════════════════════════════════════════
// 📦 Order confirmation email
// ═══════════════════════════════════════════════════

export type OrderFulfillmentType = "SHIPPING" | "PICKUP" | "DINE_IN";

export type OrderEmailModifier = {
  name: string;
  /** Price delta added to the base unit price (can be 0) */
  priceDelta: number;
};

export type OrderEmailItem = {
  /** Product name in the customer's locale */
  name: string;
  /** Variant label e.g. "Size: L / Color: Red" — null if product has no variant */
  variantName: string | null;
  /** Selected modifiers / add-ons. Empty array if none. */
  modifiers: OrderEmailModifier[];
  quantity: number;
  /** Unit price (base + all modifier deltas). Total = priceAtOrder * quantity. */
  priceAtOrder: number;
};

export type OrderEmailData = {
  to: string;
  guestName: string;
  orderId: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  /** ISO 4217 currency code — must match Order.currency in DB */
  currency: string;
  fulfillmentType: OrderFulfillmentType;
  /** Null unless fulfillmentType === "SHIPPING" */
  shippingAddress: string | null;
  /** Null unless fulfillmentType === "DINE_IN" */
  tableNumber: string | null;
  locale: string;
};