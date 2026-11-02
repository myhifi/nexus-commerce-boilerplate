export type BusinessType = "RESTAURANT" | "RETAIL";
export type StoreTier = "BASIC" | "PRO" | "ENTERPRISE";

const tierFeatures: Record<StoreTier, Record<string, boolean>> = {
  BASIC: { multiLanguage: false, customerReviews: false, pdfReceipts: false, advancedAnalytics: false, aiAssistant: false, kitchenDisplay: false, tableOrdering: false, realTimeUpdates: false },
  PRO: { multiLanguage: true, customerReviews: true, pdfReceipts: true, advancedAnalytics: true, aiAssistant: false, kitchenDisplay: false, tableOrdering: false, realTimeUpdates: false },
  ENTERPRISE: { multiLanguage: true, customerReviews: true, pdfReceipts: true, advancedAnalytics: true, aiAssistant: true, kitchenDisplay: true, tableOrdering: true, realTimeUpdates: true },
};

export const storeConfig = {
  branding: {
    name: process.env.NEXT_PUBLIC_STORE_NAME || "Nexus Commerce",
    logo: "/logo.svg",
    primaryColor: "#c9a961",
    secondaryColor: "#1a1a1a",
    supportEmail: "support@nexus.com",
  },
  businessType: (process.env.NEXT_PUBLIC_BUSINESS_TYPE || "RETAIL") as BusinessType,
  tier: (process.env.NEXT_PUBLIC_STORE_TIER || "ENTERPRISE") as StoreTier,
  currency: process.env.NEXT_PUBLIC_CURRENCY || "USD",
  features: tierFeatures[(process.env.NEXT_PUBLIC_STORE_TIER || "ENTERPRISE") as StoreTier],
  fulfillment: {
    enableShipping: true,
    enableDineIn: process.env.NEXT_PUBLIC_BUSINESS_TYPE === "RESTAURANT",
    enablePickup: true,
    shippingFlatRate: 15,
    freeShippingThreshold: 150,
  },
};
