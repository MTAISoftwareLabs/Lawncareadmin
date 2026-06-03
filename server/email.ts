import nodemailer, { type Transporter } from "nodemailer";
import { db } from "./db";
import { adminConfigs } from "../shared/schema";
import { inArray } from "drizzle-orm";

export const SMTP_CONFIG_KEYS = [
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_from",
] as const;

export interface SmtpConfig {
  host?: string;
  port: number;
  user?: string;
  pass?: string;
  from?: string;
}

let cachedTransporter: Transporter | null = null;
let cachedKey = "";

async function loadSmtpConfig(): Promise<SmtpConfig> {
  // Admin-panel settings (DB) take precedence; fall back to environment variables.
  const dbValues: Record<string, string> = {};
  try {
    const rows = await db
      .select()
      .from(adminConfigs)
      .where(inArray(adminConfigs.configKey, SMTP_CONFIG_KEYS as unknown as string[]));
    for (const row of rows) {
      if (row.configValue) dbValues[row.configKey] = row.configValue;
    }
  } catch (err) {
    console.error("Failed to load SMTP config from DB:", err);
  }

  const host = dbValues.smtp_host || process.env.SMTP_HOST;
  const portRaw = dbValues.smtp_port || process.env.SMTP_PORT || "587";
  const user = dbValues.smtp_user || process.env.SMTP_USER;
  const pass = dbValues.smtp_pass || process.env.SMTP_PASS;
  const from = dbValues.smtp_from || process.env.SMTP_FROM || user;

  return {
    host,
    port: parseInt(portRaw, 10) || 587,
    user,
    pass,
    from,
  };
}

export async function isEmailConfigured(): Promise<boolean> {
  const { host, user, pass } = await loadSmtpConfig();
  return Boolean(host && user && pass);
}

async function getTransporter(): Promise<{ transporter: Transporter; from: string } | null> {
  const cfg = await loadSmtpConfig();
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
    return null;
  }

  const key = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.pass}`;
  if (!cachedTransporter || cachedKey !== key) {
    cachedTransporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    cachedKey = key;
  }

  return { transporter: cachedTransporter, from: cfg.from };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const t = await getTransporter();
  if (!t) {
    throw new Error("Email is not configured (set SMTP settings in the admin panel)");
  }

  await t.transporter.sendMail({
    from: t.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

export async function verifySmtpConnection(): Promise<void> {
  const t = await getTransporter();
  if (!t) {
    throw new Error("Email is not configured (set SMTP settings in the admin panel)");
  }
  await t.transporter.verify();
}

export async function sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
  const subject = "Your Lawncare Workshop password reset code";
  const text = `Your password reset code is ${otp}. It expires in 15 minutes. If you didn't request this, you can safely ignore this email.`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a2e22;">
      <h2 style="color: #1f3d2b; margin-bottom: 8px;">Reset your password</h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5;">
        Use the code below to reset your Lawncare Workshop password. This code expires in 15 minutes.
      </p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f1f5f0; color: #1f3d2b; padding: 16px 0; text-align: center; border-radius: 10px; margin-bottom: 16px;">
        ${otp}
      </div>
      <p style="margin: 0; font-size: 13px; color: #6b7280;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;
  await sendEmail({ to, subject, text, html });
}
