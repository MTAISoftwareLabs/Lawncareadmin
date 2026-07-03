import type { Request } from "express";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, subscriptions, subscriptionPlans } from "../shared/schema";
import { getStripePriceIdForSlug } from "./stripeConfig";

export function resolveAppBaseUrl(req?: Request): string {
  const fromEnv = process.env.APP_URL || process.env.PUBLIC_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
  if (replitDomain) return `https://${replitDomain}`;

  if (req?.headers?.host) {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto || "http";
    return `${proto}://${req.headers.host}`;
  }

  return "http://localhost:5000";
}

export async function findPlanByStripePriceId(priceId: string) {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.stripePriceId, priceId))
    .limit(1);

  if (plan) return plan;

  const monthlyPriceId = await getStripePriceIdForSlug("monthly");
  const yearlyPriceId = await getStripePriceIdForSlug("yearly");
  if (monthlyPriceId && priceId === monthlyPriceId) {
    return { slug: "monthly", trialDays: 7, intervalType: "month" as const };
  }
  if (yearlyPriceId && priceId === yearlyPriceId) {
    return { slug: "yearly", trialDays: 7, intervalType: "year" as const };
  }

  return null;
}

function planSlugFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return "monthly";

  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  if (interval === "year") return "yearly";
  if (interval === "month") return "monthly";
  return "monthly";
}

function subscriptionExpiresAt(subscription: Stripe.Subscription): Date | null {
  if (subscription.current_period_end) {
    return new Date(subscription.current_period_end * 1000);
  }

  const itemPeriodEnd = subscription.items.data[0]?.current_period_end;
  if (itemPeriodEnd) return new Date(itemPeriodEnd * 1000);

  if (subscription.trial_end) return new Date(subscription.trial_end * 1000);
  return null;
}

function isActiveStripeStatus(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

export async function activatePremiumFromStripe(
  userId: number,
  planSlug: string,
  expiresAt: Date | null,
  status: "premium" | "trial" = "premium",
) {
  await db
    .update(users)
    .set({
      subscriptionStatus: status,
      subscriptionPlan: planSlug,
      subscriptionExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId));
}

export async function revokePremiumFromStripe(userId: number) {
  await db
    .update(users)
    .set({
      subscriptionStatus: "free",
      subscriptionPlan: null,
      subscriptionExpiresAt: null,
    })
    .where(eq(users.id, userId));
}

async function upsertSubscriptionRecord(
  userId: number,
  planSlug: string,
  stripeSubscription: Stripe.Subscription,
) {
  const amount = stripeSubscription.items.data[0]?.price?.unit_amount ?? 0;
  const currency = stripeSubscription.items.data[0]?.price?.currency ?? "usd";
  const endDate = subscriptionExpiresAt(stripeSubscription) ?? new Date();

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.transactionId, stripeSubscription.id))
    .limit(1);

  const values = {
    userId,
    plan: planSlug,
    status: isActiveStripeStatus(stripeSubscription.status) ? "active" : "cancelled",
    amount: (amount / 100).toFixed(2),
    currency: currency.toUpperCase(),
    paymentMethod: "stripe",
    transactionId: stripeSubscription.id,
    endDate,
    autoRenew: !stripeSubscription.cancel_at_period_end,
  };

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values(values);
  }
}

export async function syncUserFromStripeSubscription(
  stripe: Stripe,
  stripeSubscription: Stripe.Subscription,
) {
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;

  if (!customerId) return;

  const metadataUserId = stripeSubscription.metadata?.userId;
  let userId: number | null = metadataUserId ? parseInt(metadataUserId, 10) : null;

  if (!userId || Number.isNaN(userId)) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);
    userId = user?.id ?? null;
  }

  if (!userId) return;

  const planSlug = planSlugFromSubscription(stripeSubscription);
  const expiresAt = subscriptionExpiresAt(stripeSubscription);

  if (isActiveStripeStatus(stripeSubscription.status)) {
    const status = stripeSubscription.status === "trialing" ? "trial" : "premium";
    await activatePremiumFromStripe(userId, planSlug, expiresAt, status);
    await upsertSubscriptionRecord(userId, planSlug, stripeSubscription);
    return;
  }

  await revokePremiumFromStripe(userId);
}

export async function syncUserFromCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  expectedUserId?: number,
) {
  const sessionUserId = session.metadata?.userId
    ? parseInt(session.metadata.userId, 10)
    : expectedUserId;

  if (!sessionUserId || Number.isNaN(sessionUserId)) {
    throw new Error("Unable to determine user for checkout session");
  }

  if (expectedUserId && sessionUserId !== expectedUserId) {
    throw new Error("Checkout session does not belong to this user");
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    throw new Error("Checkout session is not complete");
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    throw new Error("No subscription found on checkout session");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncUserFromStripeSubscription(stripe, subscription);
}
