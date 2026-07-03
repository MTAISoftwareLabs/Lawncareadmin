import type Stripe from "stripe";
import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { loadStripeConfig } from "./stripeConfig";
import { syncUserFromCheckoutSession, syncUserFromStripeSubscription } from "./stripeSubscriptionSync";

async function handleStripeEvent(event: Stripe.Event) {
  const stripe = await getUncachableStripeClient();
  if (!stripe) return;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription") {
        await syncUserFromCheckoutSession(stripe, session);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncUserFromStripeSubscription(stripe, subscription);
      break;
    }
    default:
      break;
  }
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
          "Received type: " +
          typeof payload +
          ". " +
          "This usually means express.json() parsed the body before reaching this handler. " +
          "FIX: Ensure webhook route is registered BEFORE app.use(express.json()).",
      );
    }

    const { webhookSecret } = await loadStripeConfig();
    if (webhookSecret) {
      const stripe = await getUncachableStripeClient();
      if (!stripe) {
        throw new Error("Stripe is not configured");
      }

      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      await handleStripeEvent(event);
      return;
    }

    const sync = await getStripeSync();
    if (!sync) {
      throw new Error("Stripe webhook is not configured");
    }

    await sync.processWebhook(payload, signature);
  }
}
