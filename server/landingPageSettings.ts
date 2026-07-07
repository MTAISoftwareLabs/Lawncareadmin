import type { SiteSettings } from "../shared/schema";

export interface LandingPageSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  heroImage2: string | null;
  heroButtonText: string;
  heroBadgeText: string;
  primaryColor: string;
  monthlyPrice: string;
  yearlyPrice: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  contactEmail: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  socialTwitter: string | null;
}

export function formatLandingPageSettings(row: Partial<SiteSettings> | null | undefined): LandingPageSettings {
  return {
    siteName: row?.siteName || "Lawncare Workshop",
    tagline: row?.tagline || "Professional lawncare guidance",
    logoUrl: row?.logo || null,
    heroTitle: row?.heroTitle || "Master Your Lawn With Confidence",
    heroSubtitle:
      row?.heroSubtitle ||
      "Professional lawn care guidance from TurfguyRoss, a golf course superintendent with 30+ years of experience.",
    heroImage: row?.heroImage || null,
    heroImage2: row?.heroImage2 || null,
    heroButtonText: row?.heroButtonText || "Subscribe",
    heroBadgeText: row?.heroBadgeText || "Built for Cool-Season Lawns",
    primaryColor: row?.primaryColor || "#22c55e",
    monthlyPrice: row?.monthlyPrice?.toString() || "9.99",
    yearlyPrice: row?.yearlyPrice?.toString() || "89.99",
    appStoreUrl: row?.appStoreUrl || null,
    playStoreUrl: row?.playStoreUrl || null,
    contactEmail: row?.contactEmail || null,
    socialFacebook: row?.socialFacebook || null,
    socialInstagram: row?.socialInstagram || null,
    socialYoutube: row?.socialYoutube || null,
    socialTwitter: row?.socialTwitter || null,
  };
}

export function mapAdminLandingPayload(body: Record<string, unknown>) {
  const mapped: Record<string, unknown> = { updatedAt: new Date() };

  if (body.appName !== undefined) mapped.siteName = body.appName;
  if (body.siteName !== undefined) mapped.siteName = body.siteName;
  if (body.logoUrl !== undefined) mapped.logo = body.logoUrl;
  if (body.logo !== undefined) mapped.logo = body.logo;
  if (body.tagline !== undefined) mapped.tagline = body.tagline;
  if (body.heroTitle !== undefined) mapped.heroTitle = body.heroTitle;
  if (body.heroSubtitle !== undefined) mapped.heroSubtitle = body.heroSubtitle;
  if (body.heroImage1 !== undefined) mapped.heroImage = body.heroImage1;
  if (body.heroImage !== undefined) mapped.heroImage = body.heroImage;
  if (body.heroImage2 !== undefined) mapped.heroImage2 = body.heroImage2;
  if (body.heroButtonText !== undefined) mapped.heroButtonText = body.heroButtonText;
  if (body.heroBadgeText !== undefined) mapped.heroBadgeText = body.heroBadgeText;
  if (body.primaryColor !== undefined) mapped.primaryColor = body.primaryColor;
  if (body.monthlyPrice !== undefined) mapped.monthlyPrice = body.monthlyPrice;
  if (body.yearlyPrice !== undefined) mapped.yearlyPrice = body.yearlyPrice;
  if (body.appStoreUrl !== undefined) mapped.appStoreUrl = body.appStoreUrl;
  if (body.playStoreUrl !== undefined) mapped.playStoreUrl = body.playStoreUrl;
  if (body.contactEmail !== undefined) mapped.contactEmail = body.contactEmail;
  if (body.socialFacebook !== undefined) mapped.socialFacebook = body.socialFacebook;
  if (body.socialInstagram !== undefined) mapped.socialInstagram = body.socialInstagram;
  if (body.socialYoutube !== undefined) mapped.socialYoutube = body.socialYoutube;
  if (body.socialTwitter !== undefined) mapped.socialTwitter = body.socialTwitter;

  return mapped;
}

export function mapLandingToAdminForm(settings: LandingPageSettings) {
  return {
    appName: settings.siteName,
    logoUrl: settings.logoUrl || "",
    tagline: settings.tagline,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    heroButtonText: settings.heroButtonText,
    heroBadgeText: settings.heroBadgeText,
    primaryColor: settings.primaryColor,
    heroImage1: settings.heroImage || "",
    heroImage2: settings.heroImage2 || "",
    monthlyPrice: settings.monthlyPrice,
    yearlyPrice: settings.yearlyPrice,
    appStoreUrl: settings.appStoreUrl || "",
    playStoreUrl: settings.playStoreUrl || "",
    contactEmail: settings.contactEmail || "",
    socialFacebook: settings.socialFacebook || "",
    socialInstagram: settings.socialInstagram || "",
    socialYoutube: settings.socialYoutube || "",
    socialTwitter: settings.socialTwitter || "",
  };
}
