import { CheckCircle2 } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { SuccessClient } from "./SuccessClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OrderSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <SuccessClient />

      <CheckCircle2 className="mb-6 h-20 w-20 text-success" />

      <h1 className="mb-4 text-4xl font-bold text-foreground">
        Payment Successful!
      </h1>

      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        Thank you for your purchase. We have received your payment and are
        processing your order. You will receive an email confirmation shortly.
      </p>

      <div className="flex gap-4">
        <Link
          href="/shop"
          className="rounded-lg bg-accent px-8 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
