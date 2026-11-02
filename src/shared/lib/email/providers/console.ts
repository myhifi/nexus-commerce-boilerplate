import type { SendEmailResult, OrderEmailData } from "../types";

export async function sendViaConsole(
  data: OrderEmailData,
  html: string,
  subject: string,
): Promise<SendEmailResult> {
  console.log(`\n========================================`);
  console.log(`📧 [Console Provider] Order Email`);
  console.log(`To: ${data.to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Order ID: ${data.orderId}`);
  console.log(`Total: ${data.totalAmount} ${data.currency}`);
  console.log(`========================================\n`);

  return { success: true, messageId: `console-${Date.now()}` };
}