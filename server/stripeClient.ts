import Stripe from "stripe";
import { loadStripeConfig } from "./stripeConfig";

let connectionSettings: any;
let stripeEnabled = false;
let cachedStripeClient: Stripe | null = null;
let cachedSecretKey: string | null = null;

export function isStripeEnabled() {
  return stripeEnabled;
}

function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil" as any,
  });
}

function cacheStripeClient(secretKey: string) {
  if (cachedSecretKey !== secretKey) {
    cachedStripeClient = createStripeClient(secretKey);
    cachedSecretKey = secretKey;
  }
  stripeEnabled = true;
  return cachedStripeClient;
}

async function getReplitCredentials(): Promise<{ publishableKey: string; secretKey: string } | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    return null;
  }

  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";

  try {
    const url = new URL(`https://${hostname}/api/v2/connection`);
    url.searchParams.set("include_secrets", "true");
    url.searchParams.set("connector_names", connectorName);
    url.searchParams.set("environment", targetEnvironment);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X_REPLIT_TOKEN": xReplitToken,
      },
    });

    const data = await response.json();
    connectionSettings = data.items?.[0];

    if (
      !connectionSettings ||
      (!connectionSettings.settings?.publishable || !connectionSettings.settings?.secret)
    ) {
      console.log(`⚠️  Stripe ${targetEnvironment} connection not configured`);
      return null;
    }

    return {
      publishableKey: connectionSettings.settings.publishable,
      secretKey: connectionSettings.settings.secret,
    };
  } catch (error) {
    console.log(`⚠️  Failed to fetch Stripe credentials: ${error}`);
    return null;
  }
}

async function getCredentials(): Promise<{ publishableKey: string; secretKey: string } | null> {
  const config = await loadStripeConfig();
  if (config.secretKey && config.publishableKey) {
    cacheStripeClient(config.secretKey);
    return {
      publishableKey: config.publishableKey,
      secretKey: config.secretKey,
    };
  }

  const replit = await getReplitCredentials();
  if (replit) {
    cacheStripeClient(replit.secretKey);
    return replit;
  }

  stripeEnabled = false;
  return null;
}

export async function getUncachableStripeClient(): Promise<Stripe | null> {
  const credentials = await getCredentials();
  if (!credentials) return null;
  return cacheStripeClient(credentials.secretKey);
}

export async function getStripePublishableKey(): Promise<string | null> {
  const credentials = await getCredentials();
  return credentials?.publishableKey ?? null;
}

export async function getStripeSecretKey(): Promise<string | null> {
  const credentials = await getCredentials();
  return credentials?.secretKey ?? null;
}

let stripeSync: any = null;

export async function getStripeSync(): Promise<any | null> {
  if (!stripeSync) {
    const secretKey = await getStripeSecretKey();
    if (!secretKey) {
      console.log("⚠️  Stripe not configured, skipping sync setup");
      return null;
    }

    const { StripeSync } = await import("stripe-replit-sync");
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
