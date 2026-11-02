import { notFound } from "next/navigation";
import { storeConfig } from "@/shared/config/store.config";

export function requireFeature(featureKey: keyof typeof storeConfig.features) {
  if (!storeConfig.features[featureKey]) {
    notFound();
  }
}

export function hasFeature(featureKey: keyof typeof storeConfig.features): boolean {
  return !!storeConfig.features[featureKey];
}