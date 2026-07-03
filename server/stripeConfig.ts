import { loadAdminConfigKeys } from "./adminConfigStore";

export const STRIPE_CONFIG_KEYS = [
  "stripe_secret_key",
  "stripe_publishable_key",
  "stripe_webhook_secret",
  "stripe_monthly_price_id",
  "stripe_yearly_price_id",
] as const;

export const STRIPE_SECRET_KEYS = [
  "stripe_secret_key",
  "stripe_webhook_secret",
] as const;

export interface StripeConfig {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
}

export async function loadStripeConfig(): Promise<StripeConfig> {
  const dbValues = await loadAdminConfigKeys([...STRIPE_CONFIG_KEYS]);

  return {
    secretKey:
      (dbValues.stripe_secret_key || process.env.STRIPE_SECRET_KEY || "").trim() || undefined,
    publishableKey:
      (dbValues.stripe_publishable_key || process.env.STRIPE_PUBLISHABLE_KEY || "").trim() ||
      undefined,
    webhookSecret:
      (dbValues.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || "").trim() ||
      undefined,
    monthlyPriceId:
      (dbValues.stripe_monthly_price_id || process.env.STRIPE_MONTHLY_PRICE_ID || "").trim() ||
      undefined,
    yearlyPriceId:
      (dbValues.stripe_yearly_price_id || process.env.STRIPE_YEARLY_PRICE_ID || "").trim() ||
      undefined,
  };
}

export async function getStripePriceIdForSlug(slug: string): Promise<string | undefined> {
  const config = await loadStripeConfig();
  if (slug === "monthly") return config.monthlyPriceId;
  if (slug === "yearly") return config.yearlyPriceId;
  return undefined;
}
