import { createTranslator } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { render } from "@react-email/components";
import { sendViaConsole } from "./providers/console";
import { sendViaResend } from "./providers/resend";
import { storeConfig } from "@/shared/config/store.config";
import { OrderConfirmation } from "./templates/OrderConfirmation";
import type {
  EmailProviderName,
  EmailTranslator,
  OrderEmailData,
  SendEmailResult,
} from "./types";

function getProvider(): EmailProviderName {
  const provider = process.env.EMAIL_PROVIDER as EmailProviderName | undefined;
  return provider ?? "console";
}

async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const mod = await import(`../../../../messages/${locale}.json`);
  return mod.default as AbstractIntlMessages;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendOrderConfirmation(
  data: OrderEmailData,
): Promise<SendEmailResult> {
  try {
    const locale = data.locale || "en";
    const messages = await loadMessages(locale);

    const t = createTranslator({
      locale,
      messages,
      namespace: "Email.OrderConfirmation",
    }) as unknown as EmailTranslator;

    // Stubbed for now (we'll fetch this from DB settings later)
    const whatsappNumber = "+1234567890"; 
    const appUrl = getAppUrl();

    const html = await render(
      OrderConfirmation({
        ...data,
        t,
        whatsappNumber,
        appUrl,
      }),
    );

    const provider = getProvider();
    const subject = t("subject", { storeName: storeConfig.branding.name });

    switch (provider) {
      case "console":
        return await sendViaConsole(data, html, subject);

      case "resend":
        return await sendViaResend(data, html, subject);

      default:
        return {
          success: false,
          error: `Unknown email provider: ${provider}`,
        };
    }
  } catch (error) {
    console.error("[sendOrderConfirmation] error:", error);
    return { success: false, error: "Failed to prepare email" };
  }
}