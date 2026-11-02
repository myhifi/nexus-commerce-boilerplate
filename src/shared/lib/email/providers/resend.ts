import { Resend } from "resend";
import { storeConfig } from "@/shared/config/store.config";
import type { SendEmailResult, OrderEmailData } from "../types";

export async function sendViaResend(
  data: OrderEmailData,
  html: string,
  subject: string,
): Promise<SendEmailResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[Resend] RESEND_API_KEY is not configured");
      return { success: false, error: "Email provider not configured" };
    }

    const resend = new Resend(apiKey);

    const from =
      process.env.EMAIL_FROM ??
      `${storeConfig.branding.name} <onboarding@resend.dev>`;

    const { data: responseData, error } = await resend.emails.send({
      from,
      to: data.to,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: responseData?.id };
  } catch (error) {
    console.error("[Resend Catch Error]", error);
    return { success: false, error: "Failed to send via Resend" };
  }
}