import { Router } from "express";
import path from "path";
import { db } from "./db";
import { uploadContent, uploadImage, uploadEbook } from "./upload";
import { convertToMp4, needsConversion } from "./videoConverter";
import { uploadToObjectStorage } from "./objectStorageUpload";
import { shouldConvertToPng, convertImageToPng, isBrowserRenderableImage } from "./imageProcessor";
import { normalizeQaMessage, normalizeChatMessage, absolutizeUrl } from "./mediaUrl";
import { normalizeHomePayload, normalizeLandingMedia } from "./homeMediaUrls";
import { 
  users, lawnProfiles, grassTypes, lawnCarePlans, videoLessons, lessonProgress,
  lawnDiagnoses, deals, competitions, competitionEntries, votes, expertQuestions,
  subscriptions, testimonials, faqs, blogPosts, notifications, weatherCache, 
  siteSettings, activityLog, banners, libraryCategories, libraryItems, favorites,
  forumPosts, forumComments, forumLikes, userDevices, pushNotifications, adminConfigs,
  subscriptionPlans, inAppPurchases, socialAuthProviders, otpSessions, passwordResetOtps,
  homeContentItems, lawnCalendars, calendarEvents, selfDiagnosisFlows, lawnLibraryEbooks, chatMessages,
  conversations, directMessages, supportTickets, supportMessages, staticPages, privacyContent,
  adminWebPushSubscriptions,
  notificationSettings, notificationLogs, taxRates, complianceSettings, deliveryPartners,
  revenuecatSettings,
  insertUserSchema, insertLawnProfileSchema, insertVideoLessonSchema, insertDealSchema,
  insertCompetitionSchema, insertCompetitionEntrySchema, insertExpertQuestionSchema,
  insertTestimonialSchema, insertFaqSchema, insertBlogPostSchema, insertLawnCarePlanSchema,
  insertGrassTypeSchema, insertBannerSchema, insertLibraryCategorySchema, insertLibraryItemSchema,
  insertForumPostSchema, insertForumCommentSchema, insertPushNotificationSchema, insertAdminConfigSchema,
  insertSubscriptionPlanSchema, insertChatMessageSchema, insertStaticPageSchema, insertPrivacyContentSchema,
  insertTaxRateSchema, insertDeliveryPartnerSchema
} from "../shared/schema";
import { sendFirebaseWebPush, sendFirebaseWebPushToMultiple, sendPushNotification, sendPushToMultipleDevices, isFirebaseEnabled } from "./firebasePush";
import { eq, and, desc, asc, sql, gte, lte, or, isNull, like } from "drizzle-orm";
import { authMiddleware, optionalAuthMiddleware, generateToken, hashPassword, comparePassword, AuthRequest } from "./auth";
import { z } from "zod";
import crypto from "crypto";
import { getUncachableStripeClient, getStripePublishableKey, isStripeEnabled } from "./stripeClient";
import {
  findPlanByStripePriceId,
  resolveAppBaseUrl,
  syncUserFromCheckoutSession,
} from "./stripeSubscriptionSync";
import {
  findActiveCompetition,
  handleActiveEntries,
  handleCompetitionEntries,
  handleContestInfo,
  handleSubmitActiveEntry,
  handleSubmitCompetitionEntry,
  handleToggleVote,
  handleWinners,
} from "./competitionService";
import { isEmailConfigured, sendPasswordResetOtpEmail, sendEmail, verifySmtpConnection } from "./email";
import { createChatCompletion, AI_SYSTEM_PROMPTS } from "./openai";
import { isOpenAiConfigured } from "./openaiConfig";
import { saveAdminConfigKeys, loadAdminConfigKeys, maskSecret, configSource } from "./adminConfigStore";
import { loadWeatherApiKey, WEATHER_CONFIG_KEYS } from "./weatherConfig";
import { getStripePriceIdForSlug, STRIPE_CONFIG_KEYS, STRIPE_SECRET_KEYS } from "./stripeConfig";
import {
  formatLandingPageSettings,
  mapAdminLandingPayload,
  mapLandingToAdminForm,
} from "./landingPageSettings";

const adminMiddleware = async (req: AuthRequest, res: any, next: any) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, req.userId));
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: "Authorization check failed" });
  }
};

const router = Router();

// ==================== HEALTH CHECK ====================

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Lawncare Workshop API is running", timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

router.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      phone,
      role: "user",
      subscriptionStatus: "free"
    }).returning();
    
    const token = generateToken(newUser.id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ 
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      token 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = generateToken(user.id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role, subscriptionStatus: user.subscriptionStatus },
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Simple in-memory rate limiter for password-reset endpoints to slow brute-force
// attempts. Keyed by a string (IP and/or email). Counts attempts within a window
// and blocks once the max is exceeded until the window expires.
const resetRateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkResetRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = resetRateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    resetRateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) {
    return false;
  }
  bucket.count += 1;
  return true;
}

// Periodically clear expired buckets to avoid unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of resetRateBuckets.entries()) {
    if (now > bucket.resetAt) resetRateBuckets.delete(key);
  }
}, 10 * 60 * 1000).unref?.();

function getClientIp(req: any): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

router.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    // Limit how often reset codes can be requested per IP (mitigates email spam / enumeration probing)
    if (!checkResetRateLimit(`forgot:${getClientIp(req)}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${normalizedEmail}`)
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset code will be sent" });
    }

    // Generate a 6-digit OTP and store it with a 15 minute expiry
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate any previous unused codes for this email
    await db
      .update(passwordResetOtps)
      .set({ used: true })
      .where(and(eq(passwordResetOtps.email, normalizedEmail), eq(passwordResetOtps.used, false)));

    await db.insert(passwordResetOtps).values({
      email: normalizedEmail,
      otpCode,
      expiresAt,
    });

    if (await isEmailConfigured()) {
      try {
        await sendPasswordResetOtpEmail(user.email, otpCode);
      } catch (mailErr) {
        console.error("Failed to send password reset email:", mailErr);
        return res.status(500).json({ message: "Failed to send reset email. Please try again later." });
      }
    } else if (process.env.NODE_ENV !== "production") {
      // Only log the OTP in development to aid local testing; never in production.
      console.warn(
        `[forgot-password] SMTP not configured — OTP for ${normalizedEmail} is ${otpCode} (dev only)`,
      );
    } else {
      console.warn("[forgot-password] SMTP not configured — unable to send reset email");
    }

    res.json({ success: true, message: "If an account exists, a reset code will be sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

router.post("/api/auth/reset-password", async (req, res) => {
  try {
    // Throttle reset attempts per IP to make brute-forcing 6-digit codes impractical.
    if (!checkResetRateLimit(`reset:${getClientIp(req)}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ message: "Too many attempts. Please try again later." });
    }

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Code and password are required" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const otpCode = String(token).trim();
    if (!/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Find the most recent matching, unused, unexpired OTP
    const [otp] = await db
      .select()
      .from(passwordResetOtps)
      .where(
        and(
          eq(passwordResetOtps.otpCode, otpCode),
          eq(passwordResetOtps.used, false),
          gte(passwordResetOtps.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(passwordResetOtps.createdAt))
      .limit(1);

    if (!otp) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${otp.email}`)
      .limit(1);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Hash and persist the new password
    const hashedPassword = await hashPassword(password);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));

    // Mark the OTP (and any others for this email) as used
    await db
      .update(passwordResetOtps)
      .set({ used: true })
      .where(eq(passwordResetOtps.email, otp.email));

    res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// ==================== LAWN PROFILE ROUTES ====================

router.get("/api/lawn-profiles", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const profiles = await db.select().from(lawnProfiles).where(eq(lawnProfiles.userId, req.userId!));
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: "Failed to get lawn profiles" });
  }
});

router.post("/api/lawn-profiles", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = insertLawnProfileSchema.parse({ ...req.body, userId: req.userId });
    const [profile] = await db.insert(lawnProfiles).values(data).returning();
    res.json(profile);
  } catch (error) {
    console.error("Error creating lawn profile:", error);
    res.status(500).json({ error: "Failed to create lawn profile" });
  }
});

router.put("/api/lawn-profiles/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [profile] = await db.update(lawnProfiles)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(lawnProfiles.id, parseInt(id)), eq(lawnProfiles.userId, req.userId!)))
      .returning();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update lawn profile" });
  }
});

// ==================== GRASS TYPES ====================

router.get("/api/grass-types", async (req, res) => {
  try {
    const types = await db.select().from(grassTypes).where(eq(grassTypes.isActive, true));
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: "Failed to get grass types" });
  }
});

// ==================== LAWN CARE PLANS ====================

router.get("/api/lawn-care-plans", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { grassType, region, season, month } = req.query;
    
    let query = db.select().from(lawnCarePlans).where(eq(lawnCarePlans.isActive, true));
    
    const plans = await query.orderBy(asc(lawnCarePlans.displayOrder));
    
    let filteredPlans = plans;
    if (grassType) {
      filteredPlans = filteredPlans.filter(p => !p.grassType || p.grassType === grassType);
    }
    if (region) {
      filteredPlans = filteredPlans.filter(p => !p.region || p.region === region);
    }
    if (season) {
      filteredPlans = filteredPlans.filter(p => p.season === season);
    }
    if (month) {
      filteredPlans = filteredPlans.filter(p => !p.month || p.month === parseInt(month as string));
    }
    
    const isPremium = req.userId ? await checkPremiumStatus(req.userId) : false;
    if (!isPremium) {
      filteredPlans = filteredPlans.filter(p => !p.isPremium);
    }
    
    res.json(filteredPlans);
  } catch (error) {
    res.status(500).json({ error: "Failed to get lawn care plans" });
  }
});

// Dashboard convenience route for upcoming plans
router.get("/api/lawn-plans/upcoming", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = currentMonth >= 3 && currentMonth <= 5 ? "spring" : 
                          currentMonth >= 6 && currentMonth <= 8 ? "summer" :
                          currentMonth >= 9 && currentMonth <= 11 ? "fall" : "winter";
    
    const plans = await db.select().from(lawnCarePlans)
      .where(and(
        eq(lawnCarePlans.isActive, true),
        or(
          eq(lawnCarePlans.season, currentSeason),
          isNull(lawnCarePlans.season)
        )
      ))
      .orderBy(asc(lawnCarePlans.displayOrder))
      .limit(5);
    
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to get upcoming plans" });
  }
});

// ==================== VIDEO LESSONS ====================

// Dashboard convenience route for recent lessons
router.get("/api/lessons/recent", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const lessons = await db.select().from(videoLessons)
      .where(eq(videoLessons.isActive, true))
      .orderBy(desc(videoLessons.id))
      .limit(4);
    
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Failed to get recent lessons" });
  }
});

router.get("/api/lessons", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let lessons = await db.select().from(videoLessons)
      .where(eq(videoLessons.isActive, true))
      .orderBy(asc(videoLessons.displayOrder));
    
    if (category) {
      lessons = lessons.filter(l => l.category === category);
    }
    if (difficulty) {
      lessons = lessons.filter(l => l.difficulty === difficulty);
    }
    
    const isPremium = req.userId ? await checkPremiumStatus(req.userId) : false;
    if (!isPremium) {
      lessons = lessons.map(l => l.isPremium ? { ...l, videoUrl: '' } : l);
    }
    
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Failed to get lessons" });
  }
});

router.get("/api/lessons/:id", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [lesson] = await db.select().from(videoLessons).where(eq(videoLessons.id, parseInt(id)));
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    
    if (lesson.isPremium && req.userId) {
      const isPremium = await checkPremiumStatus(req.userId);
      if (!isPremium) {
        lesson.videoUrl = '';
      }
    }
    
    await db.update(videoLessons)
      .set({ viewCount: (lesson.viewCount || 0) + 1 })
      .where(eq(videoLessons.id, parseInt(id)));
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Failed to get lesson" });
  }
});

router.post("/api/lessons/:id/progress", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { progress, completed } = req.body;
    
    const existing = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, req.userId!), eq(lessonProgress.lessonId, parseInt(id))));
    
    if (existing.length > 0) {
      const [updated] = await db.update(lessonProgress)
        .set({ progress, completed, lastWatchedAt: new Date() })
        .where(eq(lessonProgress.id, existing[0].id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(lessonProgress)
        .values({ userId: req.userId!, lessonId: parseInt(id), progress, completed })
        .returning();
      res.json(created);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// ==================== LAWN DIAGNOSIS ====================

router.get("/api/diagnoses", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const diagnoses = await db.select().from(lawnDiagnoses)
      .where(eq(lawnDiagnoses.userId, req.userId!))
      .orderBy(desc(lawnDiagnoses.createdAt));
    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ error: "Failed to get diagnoses" });
  }
});

router.post("/api/diagnoses", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { imageUrl, problemType, description } = req.body;
    
    const [diagnosis] = await db.insert(lawnDiagnoses).values({
      userId: req.userId!,
      imageUrl,
      problemType,
      status: "pending"
    }).returning();
    
    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ error: "Failed to create diagnosis" });
  }
});

// ==================== AI (mobile + web) ====================

router.post("/api/ai/chat", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ status: false, error: "Prompt is required" });
    }
    if (!(await isOpenAiConfigured())) {
      return res.status(503).json({ status: false, error: "AI service is not configured" });
    }

    const content = await createChatCompletion(
      [
        { role: "system", content: AI_SYSTEM_PROMPTS.turfTalk },
        { role: "user", content: prompt.trim() },
      ],
      1000,
    );

    res.json({ status: true, data: { content } });
  } catch (error: any) {
    const message = error?.message || "";
    if (message === "OPENAI_NOT_CONFIGURED") {
      return res.status(503).json({ status: false, error: "AI service is not configured" });
    }
    if (message.startsWith("OPENAI_HTTP_")) {
      const status = parseInt(message.replace("OPENAI_HTTP_", ""), 10);
      return res.status(502).json({ status: false, error: `AI provider error (${status})` });
    }
    console.error("AI chat error:", error);
    res.status(500).json({ status: false, error: "Failed to get AI response" });
  }
});

router.post("/api/ai/refine", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ status: false, error: "Text is required" });
    }
    if (!(await isOpenAiConfigured())) {
      return res.status(503).json({ status: false, error: "AI service is not configured" });
    }

    const content = await createChatCompletion(
      [
        { role: "system", content: AI_SYSTEM_PROMPTS.refine },
        { role: "user", content: `Refine this text: ${text.trim()}` },
      ],
      300,
    );

    res.json({ status: true, data: { content } });
  } catch (error: any) {
    const message = error?.message || "";
    if (message === "OPENAI_NOT_CONFIGURED") {
      return res.status(503).json({ status: false, error: "AI service is not configured" });
    }
    if (message.startsWith("OPENAI_HTTP_")) {
      const status = parseInt(message.replace("OPENAI_HTTP_", ""), 10);
      return res.status(502).json({ status: false, error: `AI provider error (${status})` });
    }
    console.error("AI refine error:", error);
    res.status(500).json({ status: false, error: "Failed to refine text" });
  }
});

// ==================== DEALS ====================

router.get("/api/deals", async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let dealsList = await db.select().from(deals)
      .where(eq(deals.isActive, true))
      .orderBy(desc(deals.createdAt));
    
    if (category) {
      dealsList = dealsList.filter(d => d.category === category);
    }
    if (featured === 'true') {
      dealsList = dealsList.filter(d => d.isFeatured);
    }
    
    const now = new Date();
    dealsList = dealsList.filter(d => {
      const hasStarted = !d.startDate || new Date(d.startDate) <= now;
      const notExpired = !d.expiresAt || new Date(d.expiresAt) > now;
      return hasStarted && notExpired;
    });
    
    // Map field names for mobile app compatibility (image -> imageUrl)
    const formattedDeals = dealsList.map(deal => ({
      ...deal,
      imageUrl: absolutizeUrl(req, deal.image),
      affiliate_link: deal.affiliateLink,
      start_date: deal.startDate,
      expires_at: deal.expiresAt
    }));
    
    res.json({ success: true, data: formattedDeals });
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ success: false, error: "Failed to get deals" });
  }
});

router.get("/api/deals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deal] = await db.select().from(deals).where(eq(deals.id, parseInt(id)));
    if (!deal) {
      return res.status(404).json({ success: false, error: "Deal not found" });
    }
    // Map field names for mobile app compatibility
    const formattedDeal = {
      ...deal,
      imageUrl: deal.image,
      affiliate_link: deal.affiliateLink,
      start_date: deal.startDate,
      expires_at: deal.expiresAt
    };
    res.json({ success: true, data: formattedDeal });
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({ success: false, error: "Failed to get deal" });
  }
});

// ==================== PUBLIC CALENDARS ====================

router.get("/api/calendars", async (req, res) => {
  try {
    const calendarsData = await db.select().from(lawnCalendars)
      .where(eq(lawnCalendars.isActive, true))
      .orderBy(asc(lawnCalendars.displayOrder));
    
    // Get events for each calendar
    const calendarsWithEvents = await Promise.all(calendarsData.map(async (calendar) => {
      const events = await db.select().from(calendarEvents)
        .where(and(
          eq(calendarEvents.calendarId, calendar.id),
          eq(calendarEvents.isActive, true)
        ))
        .orderBy(asc(calendarEvents.displayOrder));
      return { ...calendar, events };
    }));
    
    res.json(calendarsWithEvents);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    res.status(500).json({ error: "Failed to get calendars" });
  }
});

router.get("/api/calendars/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [calendar] = await db.select().from(lawnCalendars).where(eq(lawnCalendars.id, id));
    
    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    
    const events = await db.select().from(calendarEvents)
      .where(and(
        eq(calendarEvents.calendarId, id),
        eq(calendarEvents.isActive, true)
      ))
      .orderBy(asc(calendarEvents.displayOrder));
    
    res.json({ ...calendar, events });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    res.status(500).json({ error: "Failed to get calendar" });
  }
});

// ==================== PUBLIC SELF-DIAGNOSIS ====================

router.get("/api/self-diagnosis", async (req, res) => {
  try {
    const flows = await db.select().from(selfDiagnosisFlows)
      .where(eq(selfDiagnosisFlows.isActive, true))
      .orderBy(asc(selfDiagnosisFlows.displayOrder));
    
    // Parse questions JSON for each flow
    const flowsWithParsedQuestions = flows.map(flow => ({
      ...flow,
      questions: typeof flow.questions === 'string' ? JSON.parse(flow.questions) : flow.questions
    }));
    
    res.json(flowsWithParsedQuestions);
  } catch (error) {
    console.error("Error fetching self-diagnosis flows:", error);
    res.status(500).json({ error: "Failed to get diagnosis flows" });
  }
});

router.get("/api/self-diagnosis/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [flow] = await db.select().from(selfDiagnosisFlows).where(eq(selfDiagnosisFlows.id, id));
    
    if (!flow) {
      return res.status(404).json({ error: "Diagnosis flow not found" });
    }
    
    const parsedFlow = {
      ...flow,
      questions: typeof flow.questions === 'string' ? JSON.parse(flow.questions) : flow.questions
    };
    
    res.json(parsedFlow);
  } catch (error) {
    console.error("Error fetching self-diagnosis flow:", error);
    res.status(500).json({ error: "Failed to get diagnosis flow" });
  }
});

// ==================== PUBLIC LAWN LIBRARY / EBOOKS ====================

router.get("/api/ebooks", async (req, res) => {
  try {
    const ebooks = await db.select().from(lawnLibraryEbooks)
      .where(eq(lawnLibraryEbooks.isActive, true))
      .orderBy(asc(lawnLibraryEbooks.displayOrder));
    
    res.json(ebooks);
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    res.status(500).json({ error: "Failed to get ebooks" });
  }
});

router.get("/api/ebooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [ebook] = await db.select().from(lawnLibraryEbooks).where(eq(lawnLibraryEbooks.id, id));
    
    if (!ebook) {
      return res.status(404).json({ error: "Ebook not found" });
    }
    
    res.json(ebook);
  } catch (error) {
    console.error("Error fetching ebook:", error);
    res.status(500).json({ error: "Failed to get ebook" });
  }
});

// ==================== COMPETITIONS ====================

router.get("/api/competitions", async (req, res) => {
  try {
    const comps = await db.select().from(competitions)
      .where(eq(competitions.isActive, true))
      .orderBy(desc(competitions.startDate));
    
    // Get entries for each competition with user info
    const competitionsWithEntries = await Promise.all(
      comps.map(async (comp) => {
        const entries = await db.select({
          id: competitionEntries.id,
          competitionId: competitionEntries.competitionId,
          userId: competitionEntries.userId,
          imageUrl: competitionEntries.imageUrl,
          description: competitionEntries.description,
          votes: competitionEntries.votes,
          status: competitionEntries.status,
          isWinner: competitionEntries.isWinner,
          rank: competitionEntries.rank,
          createdAt: competitionEntries.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
          }
        })
          .from(competitionEntries)
          .leftJoin(users, eq(competitionEntries.userId, users.id))
          .where(eq(competitionEntries.competitionId, comp.id))
          .orderBy(desc(competitionEntries.votes));
        
        return {
          ...comp,
          entries,
          participantCount: entries.length
        };
      })
    );
    
    res.json(competitionsWithEntries);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ error: "Failed to get competitions" });
  }
});

router.get("/api/competitions/active", async (req, res) => {
  try {
    const activeComp = await findActiveCompetition();
    res.json(activeComp);
  } catch (error) {
    res.status(500).json({ error: "Failed to get active competition" });
  }
});

router.get("/api/competitions/active/entries", optionalAuthMiddleware, handleActiveEntries);
router.post("/api/competitions/active/entries", authMiddleware, handleSubmitActiveEntry);

router.get("/api/competitions/winners", handleWinners);

router.get("/api/competitions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [comp] = await db.select().from(competitions).where(eq(competitions.id, parseInt(id)));
    
    if (!comp) {
      return res.status(404).json({ error: "Competition not found" });
    }
    
    const entries = await db.select({
      entry: competitionEntries,
      user: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(competitionEntries)
      .leftJoin(users, eq(competitionEntries.userId, users.id))
      .where(and(eq(competitionEntries.competitionId, parseInt(id)), eq(competitionEntries.status, "approved")))
      .orderBy(desc(competitionEntries.votes));
    
    res.json({ competition: comp, entries });
  } catch (error) {
    res.status(500).json({ error: "Failed to get competition" });
  }
});

router.get("/api/competitions/:id/entries", optionalAuthMiddleware, handleCompetitionEntries);

router.post("/api/contest/entries", authMiddleware, handleSubmitActiveEntry);
router.post("/api/competitions/:id/entries", authMiddleware, handleSubmitCompetitionEntry);

router.post("/api/competitions/entries/:id/vote", authMiddleware, handleToggleVote);
router.post("/api/contest/entries/:id/vote", authMiddleware, handleToggleVote);
router.post("/api/entries/:id/vote", authMiddleware, handleToggleVote);

// ==================== EXPERT Q&A ====================

router.get("/api/questions", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const questions = await db.select().from(expertQuestions)
      .where(eq(expertQuestions.userId, req.userId!))
      .orderBy(desc(expertQuestions.createdAt));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get questions" });
  }
});

// Frontend alias routes for expert questions
router.get("/api/expert-questions", async (req, res) => {
  try {
    const questions = await db.select({
      question: expertQuestions,
      user: { name: users.name, avatar: users.avatar }
    }).from(expertQuestions)
      .leftJoin(users, eq(expertQuestions.userId, users.id))
      .where(and(eq(expertQuestions.isPublic, true), eq(expertQuestions.status, "answered")))
      .orderBy(desc(expertQuestions.answeredAt));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get expert questions" });
  }
});

router.get("/api/expert-questions/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const questions = await db.select().from(expertQuestions)
      .where(eq(expertQuestions.userId, req.userId!))
      .orderBy(desc(expertQuestions.createdAt));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get my questions" });
  }
});

router.post("/api/expert-questions", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { subject, question, imageUrl, category } = req.body;
    
    const [q] = await db.insert(expertQuestions).values({
      userId: req.userId!,
      subject,
      question,
      imageUrl,
      category,
      status: "pending"
    }).returning();
    
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit question" });
  }
});

router.get("/api/questions/public", async (req, res) => {
  try {
    const questions = await db.select({
      question: expertQuestions,
      user: { name: users.name, avatar: users.avatar }
    }).from(expertQuestions)
      .leftJoin(users, eq(expertQuestions.userId, users.id))
      .where(and(eq(expertQuestions.isPublic, true), eq(expertQuestions.status, "answered")))
      .orderBy(desc(expertQuestions.answeredAt));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get public questions" });
  }
});

router.post("/api/questions", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { subject, question, imageUrl, category } = req.body;
    
    const [q] = await db.insert(expertQuestions).values({
      userId: req.userId!,
      subject,
      question,
      imageUrl,
      category,
      status: "pending"
    }).returning();
    
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit question" });
  }
});

// ==================== SUBSCRIPTIONS ====================

router.get("/api/subscription", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, req.userId!))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    res.json(sub || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

router.post("/api/subscription", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { plan, paymentMethod, transactionId } = req.body;
    
    const amount = plan === "yearly" ? "89.99" : "9.99";
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plan === "yearly" ? 12 : 1));
    
    const [sub] = await db.insert(subscriptions).values({
      userId: req.userId!,
      plan,
      amount,
      paymentMethod,
      transactionId,
      status: "active",
      startDate: new Date(),
      endDate
    }).returning();
    
    await db.update(users)
      .set({ subscriptionStatus: "premium", subscriptionPlan: plan, subscriptionExpiresAt: endDate })
      .where(eq(users.id, req.userId!));
    
    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

router.post("/api/subscriptions/create", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    
    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }
    
    const amount = plan === "yearly" ? "89.99" : "9.99";
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plan === "yearly" ? 12 : 1));
    
    const [sub] = await db.insert(subscriptions).values({
      userId: req.userId!,
      plan,
      amount,
      status: "active",
      startDate: new Date(),
      endDate
    }).returning();
    
    await db.update(users)
      .set({ 
        subscriptionStatus: "premium", 
        subscriptionPlan: plan, 
        subscriptionExpiresAt: endDate 
      })
      .where(eq(users.id, req.userId!));
    
    res.json({ 
      subscription: sub, 
      message: "Your premium subscription is now active! Enjoy full access to all features." 
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

router.post("/api/subscriptions/cancel", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [sub] = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.userId, req.userId!), 
        or(eq(subscriptions.status, "active"), eq(subscriptions.status, "trial"))
      ))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    if (!sub) {
      return res.status(404).json({ error: "No active subscription found" });
    }
    
    await db.update(subscriptions)
      .set({ status: "cancelled", autoRenew: false })
      .where(eq(subscriptions.id, sub.id));
    
    await db.update(users)
      .set({ subscriptionStatus: "free", subscriptionPlan: null })
      .where(eq(users.id, req.userId!));
    
    res.json({ message: "Subscription cancelled. You'll have access until the end of your current billing period." });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// ==================== TESTIMONIALS ====================

router.get("/api/testimonials", async (req, res) => {
  try {
    const list = await db.select().from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(desc(testimonials.isFeatured));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get testimonials" });
  }
});

// ==================== FAQ ====================

router.get("/api/faqs", async (req, res) => {
  try {
    const list = await db.select().from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(asc(faqs.displayOrder));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get FAQs" });
  }
});

// ==================== BLOG ====================

router.get("/api/blog", async (req, res) => {
  try {
    const posts = await db.select().from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get blog posts" });
  }
});

router.get("/api/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    await db.update(blogPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(blogPosts.id, post.id));
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to get blog post" });
  }
});

// ==================== NOTIFICATIONS ====================

router.get("/api/notifications", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const includeRead = req.query.all === "true";
    const notifs = await db.select().from(notifications)
      .where(
        includeRead
          ? or(eq(notifications.userId, req.userId!), eq(notifications.isGlobal, true))
          : and(
              or(eq(notifications.userId, req.userId!), eq(notifications.isGlobal, true)),
              eq(notifications.isRead, false),
            ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(includeRead ? 100 : 50);
    
    const formattedNotifs = notifs.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      imageUrl: n.imageUrl,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt
    }));
    
    res.json({ status: true, data: formattedNotifs });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get notifications" });
  }
});

// Mark notification as read - PUT method
router.put("/api/notifications/:id/read", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);
    console.log(`[NOTIFICATION READ] PUT request - ID: ${notificationId}, User: ${req.userId}`);
    
    // Update notification as read
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    
    console.log(`[NOTIFICATION READ] Update result:`, JSON.stringify(result));
    
    if (result.length === 0) {
      console.log(`[NOTIFICATION READ] Not found - ID: ${notificationId}`);
      return res.status(404).json({ status: false, error: "Notification not found" });
    }
    
    console.log(`[NOTIFICATION READ] Success - ID: ${notificationId}, isRead: ${result[0].isRead}`);
    res.json({ status: true, message: "Notification marked as read", data: result[0] });
  } catch (error) {
    console.error("[NOTIFICATION READ] Error:", error);
    res.status(500).json({ status: false, error: "Failed to mark notification as read" });
  }
});

// Mark notification as read - POST method (for compatibility)
router.post("/api/notifications/:id/read", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);
    console.log(`[NOTIFICATION READ] POST request - ID: ${notificationId}, User: ${req.userId}`);
    
    // Update notification as read
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    
    console.log(`[NOTIFICATION READ] Update result:`, JSON.stringify(result));
    
    if (result.length === 0) {
      console.log(`[NOTIFICATION READ] Not found - ID: ${notificationId}`);
      return res.status(404).json({ status: false, error: "Notification not found" });
    }
    
    console.log(`[NOTIFICATION READ] Success - ID: ${notificationId}, isRead: ${result[0].isRead}`);
    res.json({ status: true, message: "Notification marked as read", data: result[0] });
  } catch (error) {
    console.error("[NOTIFICATION READ] Error:", error);
    res.status(500).json({ status: false, error: "Failed to mark notification as read" });
  }
});

// ==================== SITE SETTINGS ====================

router.get("/api/settings", async (req, res) => {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    res.json(formatLandingPageSettings(settings));
  } catch (error) {
    res.status(500).json({ error: "Failed to get settings" });
  }
});

router.get("/api/settings/landing-page", async (req, res) => {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    const formatted = formatLandingPageSettings(settings);
    res.json(normalizeLandingMedia(req, formatted as unknown as Record<string, unknown>));
  } catch (error) {
    res.status(500).json({ error: "Failed to get landing page settings" });
  }
});

router.put("/api/admin/settings/landing-page", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const mapped = mapAdminLandingPayload(req.body);
    const existing = await db.select().from(siteSettings).limit(1);

    let saved;
    if (existing.length > 0) {
      [saved] = await db
        .update(siteSettings)
        .set(mapped)
        .where(eq(siteSettings.id, existing[0].id))
        .returning();
    } else {
      [saved] = await db.insert(siteSettings).values(mapped).returning();
    }

    res.json(mapLandingToAdminForm(formatLandingPageSettings(saved)));
  } catch (error) {
    console.error("Error updating landing page settings:", error);
    res.status(500).json({ error: "Failed to update landing page settings" });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin Dashboard Stats
router.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [lessonCount] = await db.select({ count: sql<number>`count(*)` }).from(videoLessons);
    const [diagnosisCount] = await db.select({ count: sql<number>`count(*)` }).from(lawnDiagnoses);
    const [questionCount] = await db.select({ count: sql<number>`count(*)` }).from(expertQuestions).where(eq(expertQuestions.status, "pending"));
    const [subCount] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "active"));
    
    res.json({
      totalUsers: userCount.count,
      totalLessons: lessonCount.count,
      pendingDiagnoses: diagnosisCount.count,
      pendingQuestions: questionCount.count,
      activeSubscriptions: subCount.count
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Admin Users
router.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userList = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
      isBanned: users.isBanned,
      bannedReason: users.bannedReason,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt));
    res.json(userList);
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
});

router.post("/api/admin/users", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }
    const hashedPw = await hashPassword(password);
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPw,
      role: role || "user",
    }).returning();
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ message: "User created successfully", data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, parseInt(id)))
      .returning();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const reqUserId = (req as any).userId;
    if (reqUserId && reqUserId === userId) {
      return res.status(403).json({ error: "Cannot delete your own account" });
    }

    await db.delete(supportMessages).where(
      sql`${supportMessages.senderId} = ${userId} OR ${supportMessages.ticketId} IN (SELECT id FROM support_tickets WHERE user_id = ${userId})`
    );
    await db.update(supportTickets).set({ assignedTo: null }).where(eq(supportTickets.assignedTo, userId));
    await db.delete(supportTickets).where(eq(supportTickets.userId, userId));
    const userConversations = await db.select({ id: conversations.id }).from(conversations)
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)));
    if (userConversations.length > 0) {
      const convIds = userConversations.map(c => c.id);
      for (const convId of convIds) {
        await db.delete(directMessages).where(eq(directMessages.conversationId, convId));
      }
    }
    await db.delete(conversations).where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)));
    await db.delete(chatMessages).where(eq(chatMessages.senderId, userId));
    await db.delete(forumLikes).where(eq(forumLikes.userId, userId));
    await db.delete(forumComments).where(eq(forumComments.userId, userId));
    const userPosts = await db.select({ id: forumPosts.id }).from(forumPosts).where(eq(forumPosts.userId, userId));
    if (userPosts.length > 0) {
      for (const post of userPosts) {
        await db.delete(forumLikes).where(eq(forumLikes.postId, post.id));
        await db.delete(forumComments).where(eq(forumComments.postId, post.id));
      }
    }
    await db.delete(forumPosts).where(eq(forumPosts.userId, userId));
    await db.delete(votes).where(eq(votes.userId, userId));
    const userEntries = await db.select({ id: competitionEntries.id }).from(competitionEntries).where(eq(competitionEntries.userId, userId));
    if (userEntries.length > 0) {
      for (const entry of userEntries) {
        await db.delete(votes).where(eq(votes.entryId, entry.id));
      }
    }
    await db.delete(competitionEntries).where(eq(competitionEntries.userId, userId));
    await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
    await db.delete(lawnProfiles).where(eq(lawnProfiles.userId, userId));
    await db.update(lawnDiagnoses).set({ reviewedBy: null }).where(eq(lawnDiagnoses.reviewedBy, userId));
    await db.delete(lawnDiagnoses).where(eq(lawnDiagnoses.userId, userId));
    const userQuestions = await db.select({ id: expertQuestions.id }).from(expertQuestions).where(eq(expertQuestions.userId, userId));
    if (userQuestions.length > 0) {
      for (const q of userQuestions) {
        await db.delete(chatMessages).where(eq(chatMessages.questionId, q.id));
      }
    }
    await db.update(expertQuestions).set({ answeredBy: null }).where(eq(expertQuestions.answeredBy, userId));
    await db.delete(expertQuestions).where(eq(expertQuestions.userId, userId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    await db.delete(notifications).where(eq(notifications.userId, userId));
    await db.delete(favorites).where(eq(favorites.userId, userId));
    await db.delete(userDevices).where(eq(userDevices.userId, userId));
    await db.delete(socialAuthProviders).where(eq(socialAuthProviders.userId, userId));
    await db.delete(inAppPurchases).where(eq(inAppPurchases.userId, userId));
    await db.delete(adminWebPushSubscriptions).where(eq(adminWebPushSubscriptions.userId, userId));
    await db.update(pushNotifications).set({ sentBy: null }).where(eq(pushNotifications.sentBy, userId));
    await db.update(adminConfigs).set({ updatedBy: null }).where(eq(adminConfigs.updatedBy, userId));
    await db.update(competitions).set({ winnerId: null }).where(eq(competitions.winnerId, userId));

    await db.delete(users).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete user:", error.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Admin Lessons CRUD
router.get("/api/admin/lessons", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const lessons = await db.select().from(videoLessons).orderBy(desc(videoLessons.createdAt));
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Failed to get lessons" });
  }
});

router.post("/api/admin/lessons", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertVideoLessonSchema.parse(req.body);
    const [lesson] = await db.insert(videoLessons).values(data).returning();
    res.json(lesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

router.put("/api/admin/lessons/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [lesson] = await db.update(videoLessons)
      .set(req.body)
      .where(eq(videoLessons.id, parseInt(id)))
      .returning();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

router.delete("/api/admin/lessons/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(videoLessons).where(eq(videoLessons.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

// Admin Deals CRUD
router.get("/api/admin/deals", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const dealsList = await db.select().from(deals).orderBy(desc(deals.createdAt));
    // Map image to imageUrl for frontend compatibility
    const dealsWithImageUrl = dealsList.map(deal => ({
      ...deal,
      imageUrl: deal.image
    }));
    res.json(dealsWithImageUrl);
  } catch (error) {
    res.status(500).json({ error: "Failed to get deals" });
  }
});

router.post("/api/admin/deals", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { imageUrl, startDate, expiresAt, ...rest } = req.body;
    const dealData = {
      ...rest,
      image: imageUrl || null,
      startDate: startDate ? new Date(startDate) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };
    const [deal] = await db.insert(deals).values(dealData).returning();
    // Return with imageUrl for frontend compatibility
    res.json({ ...deal, imageUrl: deal.image });
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(500).json({ error: "Failed to create deal" });
  }
});

router.put("/api/admin/deals/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, startDate, expiresAt, ...rest } = req.body;
    const updateData: any = { ...rest };
    
    // Map imageUrl to image field
    if (imageUrl !== undefined) {
      updateData.image = imageUrl || null;
    }
    // Convert date strings to Date objects
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    
    const [deal] = await db.update(deals)
      .set(updateData)
      .where(eq(deals.id, parseInt(id)))
      .returning();
    // Return with imageUrl for frontend compatibility
    res.json({ ...deal, imageUrl: deal.image });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ error: "Failed to update deal" });
  }
});

router.delete("/api/admin/deals/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(deals).where(eq(deals.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete deal" });
  }
});

// Admin Lawn Care Plans CRUD
router.get("/api/admin/plans", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const plans = await db.select().from(lawnCarePlans).orderBy(desc(lawnCarePlans.createdAt));
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to get plans" });
  }
});

router.post("/api/admin/plans", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertLawnCarePlanSchema.parse(req.body);
    const [plan] = await db.insert(lawnCarePlans).values(data).returning();
    res.json(plan);
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

router.put("/api/admin/plans/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [plan] = await db.update(lawnCarePlans)
      .set(req.body)
      .where(eq(lawnCarePlans.id, parseInt(id)))
      .returning();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Failed to update plan" });
  }
});

router.delete("/api/admin/plans/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(lawnCarePlans).where(eq(lawnCarePlans.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

// Admin Grass Types CRUD
router.get("/api/admin/grass-types", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const types = await db.select().from(grassTypes).orderBy(asc(grassTypes.name));
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: "Failed to get grass types" });
  }
});

router.post("/api/admin/grass-types", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertGrassTypeSchema.parse(req.body);
    const [type] = await db.insert(grassTypes).values(data).returning();
    res.json(type);
  } catch (error) {
    console.error("Error creating grass type:", error);
    res.status(500).json({ error: "Failed to create grass type" });
  }
});

router.put("/api/admin/grass-types/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [type] = await db.update(grassTypes)
      .set(req.body)
      .where(eq(grassTypes.id, parseInt(id)))
      .returning();
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: "Failed to update grass type" });
  }
});

router.delete("/api/admin/grass-types/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(grassTypes).where(eq(grassTypes.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete grass type" });
  }
});

// ==================== ADMIN STATIC PAGES (CMS) ====================

router.get("/api/admin/pages", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pages = await db.select().from(staticPages).orderBy(desc(staticPages.updatedAt));
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: "Failed to get pages" });
  }
});

router.post("/api/admin/pages", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertStaticPageSchema.parse(req.body);
    const [page] = await db.insert(staticPages).values(data).returning();
    res.json(page);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

router.put("/api/admin/pages/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertStaticPageSchema.partial().parse(req.body);
    const [page] = await db.update(staticPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(staticPages.id, parseInt(id)))
      .returning();
    res.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

router.delete("/api/admin/pages/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(staticPages).where(eq(staticPages.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// Public page endpoint
router.get("/api/pages/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [page] = await db.select().from(staticPages)
      .where(and(eq(staticPages.slug, slug), eq(staticPages.isActive, true)))
      .limit(1);
    
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to get page" });
  }
});

// ==================== PRIVACY CONTENT API ====================

// Public: Get all active privacy content sections
router.get("/api/privacy-content", async (req, res) => {
  try {
    const content = await db.select({
      heading: privacyContent.heading,
      text: privacyContent.text,
    }).from(privacyContent)
      .where(eq(privacyContent.isActive, true))
      .orderBy(asc(privacyContent.displayOrder));
    
    res.json({ data: content });
  } catch (error) {
    console.error("Error fetching privacy content:", error);
    res.status(500).json({ error: "Failed to get privacy content" });
  }
});

// Admin: Get all privacy content sections
router.get("/api/admin/privacy-content", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const content = await db.select().from(privacyContent)
      .orderBy(asc(privacyContent.displayOrder));
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to get privacy content" });
  }
});

// Admin: Create privacy content section
router.post("/api/admin/privacy-content", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertPrivacyContentSchema.parse(req.body);
    const [item] = await db.insert(privacyContent).values(data).returning();
    res.json(item);
  } catch (error) {
    console.error("Error creating privacy content:", error);
    res.status(500).json({ error: "Failed to create privacy content" });
  }
});

// Admin: Update privacy content section
router.put("/api/admin/privacy-content/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: _, createdAt, ...updateData } = req.body;
    const [item] = await db.update(privacyContent)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(privacyContent.id, parseInt(id)))
      .returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update privacy content" });
  }
});

// Admin: Delete privacy content section
router.delete("/api/admin/privacy-content/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(privacyContent).where(eq(privacyContent.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete privacy content" });
  }
});

// Admin Competitions CRUD
router.get("/api/admin/competitions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const comps = await db.select().from(competitions).orderBy(desc(competitions.createdAt));
    res.json(comps);
  } catch (error) {
    res.status(500).json({ error: "Failed to get competitions" });
  }
});

router.post("/api/admin/competitions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log("=== CREATE COMPETITION ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    // Helper to convert date string to Date object, returns null for empty/invalid strings
    const parseDate = (dateStr: string | undefined | null): Date | null => {
      if (!dateStr || dateStr.trim() === '') return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };
    
    // Validate required dates
    const startDate = parseDate(req.body.startDate);
    const endDate = parseDate(req.body.endDate);
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }
    
    // Build the data object
    const competitionData = {
      title: req.body.title,
      description: req.body.description || null,
      rules: req.body.rules || null,
      prize: req.body.prize || null,
      prizeImageUrl: req.body.prizeImageUrl || null,
      month: req.body.month || null,
      year: req.body.year || null,
      startDate,
      endDate,
      votingEndsAt: parseDate(req.body.votingEndsAt),
      status: req.body.status || 'upcoming',
      winnerId: req.body.winnerId || null,
      image: req.body.image || null,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };
    
    console.log("Competition data:", JSON.stringify(competitionData, null, 2));
    
    const [comp] = await db.insert(competitions).values(competitionData).returning();
    console.log("Competition created:", comp.id);
    res.json(comp);
  } catch (error: any) {
    console.error("Error creating competition:", error?.message || error);
    res.status(500).json({ error: "Failed to create competition" });
  }
});

router.put("/api/admin/competitions/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: _, ...updateData } = req.body;
    
    // Convert date strings to Date objects for timestamp columns
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.votingEndsAt) {
      updateData.votingEndsAt = new Date(updateData.votingEndsAt);
    }
    
    console.log("Updating competition", id, "with data:", updateData);
    const [comp] = await db.update(competitions)
      .set(updateData)
      .where(eq(competitions.id, parseInt(id)))
      .returning();
    res.json(comp);
  } catch (error) {
    console.error("Error updating competition:", error);
    res.status(500).json({ error: "Failed to update competition" });
  }
});

router.delete("/api/admin/competitions/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const competitionId = parseInt(req.params.id);
    console.log("=== DELETE COMPETITION ===", competitionId);
    
    // Get all entries for this competition
    const entries = await db.select({ id: competitionEntries.id })
      .from(competitionEntries)
      .where(eq(competitionEntries.competitionId, competitionId));
    
    // Delete votes for all entries first
    for (const entry of entries) {
      await db.delete(votes).where(eq(votes.entryId, entry.id));
    }
    
    // Delete competition entries
    await db.delete(competitionEntries).where(eq(competitionEntries.competitionId, competitionId));
    
    // Delete competition
    await db.delete(competitions).where(eq(competitions.id, competitionId));
    console.log("Competition deleted successfully");
    res.json({ success: true });
  } catch (error: any) {
    console.error("=== DELETE ERROR ===", error?.message);
    res.status(500).json({ error: "Failed to delete competition" });
  }
});

// Admin Competition Entries
router.get("/api/admin/entries", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { competitionId } = req.query;
    
    let query = db.select({
      entry: competitionEntries,
      user: { id: users.id, name: users.name, avatar: users.avatar },
      competition: { id: competitions.id, title: competitions.title }
    }).from(competitionEntries)
      .leftJoin(users, eq(competitionEntries.userId, users.id))
      .leftJoin(competitions, eq(competitionEntries.competitionId, competitions.id));
    
    if (competitionId) {
      query = query.where(eq(competitionEntries.competitionId, parseInt(competitionId as string))) as typeof query;
    }
    
    const entries = await query.orderBy(desc(competitionEntries.votes), desc(competitionEntries.createdAt));
    
    const formatted = entries.map(e => ({
      id: e.entry.id,
      competitionId: e.entry.competitionId,
      userId: e.entry.userId,
      title: e.entry.title,
      description: e.entry.description,
      imageUrl: e.entry.imageUrl,
      votes: e.entry.votes,
      status: e.entry.status,
      isWinner: e.entry.isWinner,
      createdAt: e.entry.createdAt,
      user: e.user,
      competition: e.competition
    }));
    
    res.json({ entries: formatted });
  } catch (error) {
    console.error("Error getting entries:", error);
    res.status(500).json({ error: "Failed to get entries" });
  }
});

router.put("/api/admin/entries/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [entry] = await db.update(competitionEntries)
      .set(req.body)
      .where(eq(competitionEntries.id, parseInt(id)))
      .returning();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Set winner - updates both entry and competition, clears previous winners
router.post("/api/admin/entries/:id/set-winner", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    // Get the entry to find competition
    const [entry] = await db.select().from(competitionEntries)
      .where(eq(competitionEntries.id, entryId));
    
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    
    // Clear any previous winners for this competition
    await db.update(competitionEntries)
      .set({ isWinner: false, rank: null })
      .where(and(
        eq(competitionEntries.competitionId, entry.competitionId),
        eq(competitionEntries.isWinner, true)
      ));
    
    // Set the new winner
    await db.update(competitionEntries)
      .set({ isWinner: true, rank: 1 })
      .where(eq(competitionEntries.id, entryId));
    
    // Update competition with winner and mark as completed
    await db.update(competitions)
      .set({ 
        winnerId: entry.userId, 
        status: 'completed', 
        isActive: false 
      })
      .where(eq(competitions.id, entry.competitionId));
    
    res.json({ success: true, message: "Winner set successfully" });
  } catch (error) {
    console.error("Error setting winner:", error);
    res.status(500).json({ error: "Failed to set winner" });
  }
});

// Admin Diagnoses
router.get("/api/admin/diagnoses", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const diagnoses = await db.select({
      diagnosis: lawnDiagnoses,
      user: { name: users.name, email: users.email }
    }).from(lawnDiagnoses)
      .leftJoin(users, eq(lawnDiagnoses.userId, users.id))
      .orderBy(desc(lawnDiagnoses.createdAt));
    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ error: "Failed to get diagnoses" });
  }
});

router.put("/api/admin/diagnoses/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [diagnosis] = await db.update(lawnDiagnoses)
      .set({ ...req.body, reviewedBy: req.userId })
      .where(eq(lawnDiagnoses.id, parseInt(id)))
      .returning();
    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ error: "Failed to update diagnosis" });
  }
});

router.delete("/api/admin/diagnoses/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(lawnDiagnoses).where(eq(lawnDiagnoses.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete diagnosis" });
  }
});

// Admin Expert Questions
router.get("/api/admin/questions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const questions = await db.select({
      question: expertQuestions,
      user: { name: users.name, email: users.email }
    }).from(expertQuestions)
      .leftJoin(users, eq(expertQuestions.userId, users.id))
      .orderBy(desc(expertQuestions.createdAt));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get questions" });
  }
});

router.put("/api/admin/questions/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { answer, status, isPublic } = req.body;
    
    const [question] = await db.update(expertQuestions)
      .set({ 
        answer, 
        status: status || "answered", 
        isPublic,
        answeredBy: req.userId,
        answeredAt: new Date()
      })
      .where(eq(expertQuestions.id, parseInt(id)))
      .returning();
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: "Failed to answer question" });
  }
});

router.delete("/api/admin/questions/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(expertQuestions).where(eq(expertQuestions.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

router.delete("/api/admin/entries/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(competitionEntries).where(eq(competitionEntries.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Admin Testimonials CRUD
router.get("/api/admin/testimonials", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const list = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get testimonials" });
  }
});

router.post("/api/admin/testimonials", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertTestimonialSchema.parse(req.body);
    const [testimonial] = await db.insert(testimonials).values(data).returning();
    res.json(testimonial);
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

router.put("/api/admin/testimonials/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [testimonial] = await db.update(testimonials)
      .set(req.body)
      .where(eq(testimonials.id, parseInt(id)))
      .returning();
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

router.delete("/api/admin/testimonials/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(testimonials).where(eq(testimonials.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

// Admin FAQ CRUD
router.get("/api/admin/faqs", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const list = await db.select().from(faqs).orderBy(asc(faqs.displayOrder));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get FAQs" });
  }
});

router.post("/api/admin/faqs", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertFaqSchema.parse(req.body);
    const [faq] = await db.insert(faqs).values(data).returning();
    res.json(faq);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

router.put("/api/admin/faqs/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [faq] = await db.update(faqs)
      .set(req.body)
      .where(eq(faqs.id, parseInt(id)))
      .returning();
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

router.delete("/api/admin/faqs/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(faqs).where(eq(faqs.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// Admin Blog CRUD
router.get("/api/admin/blog", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get blog posts" });
  }
});

router.post("/api/admin/blog", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertBlogPostSchema.parse(req.body);
    const [post] = await db.insert(blogPosts).values({
      ...data,
      publishedAt: data.isPublished ? new Date() : null
    }).returning();
    res.json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.put("/api/admin/blog/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    if (req.body.isPublished && !req.body.publishedAt) {
      updateData.publishedAt = new Date();
    }
    const [post] = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, parseInt(id)))
      .returning();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/api/admin/blog/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// Admin Site Settings
router.get("/api/admin/settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to get settings" });
  }
});

router.put("/api/admin/settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const existing = await db.select().from(siteSettings).limit(1);
    
    if (existing.length > 0) {
      const [settings] = await db.update(siteSettings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing[0].id))
        .returning();
      res.json(settings);
    } else {
      const [settings] = await db.insert(siteSettings).values(req.body).returning();
      res.json(settings);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Admin Subscriptions
router.get("/api/admin/subscriptions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const subs = await db.select({
      subscription: subscriptions,
      user: { name: users.name, email: users.email }
    }).from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .orderBy(desc(subscriptions.createdAt));
    res.json(subs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get subscriptions" });
  }
});

// ==================== HOME BANNERS ====================

router.get("/api/banners", async (req, res) => {
  try {
    const now = new Date();
    const activeBanners = await db.select().from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.displayOrder));
    
    const filtered = activeBanners.filter(b => {
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;
      return true;
    });
    
    res.json({
      status: true,
      data: filtered.map((b) => ({
        ...b,
        imageUrl: absolutizeUrl(req, b.imageUrl),
      })),
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get banners" });
  }
});

// Admin Banners CRUD
router.get("/api/admin/banners", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const list = await db.select().from(banners).orderBy(asc(banners.displayOrder));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get banners" });
  }
});

router.post("/api/admin/banners", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertBannerSchema.parse(req.body);
    const [banner] = await db.insert(banners).values(data).returning();
    res.json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid banner data", details: (error as z.ZodError).issues });
    } else {
      res.status(500).json({ error: "Failed to create banner" });
    }
  }
});

router.put("/api/admin/banners/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [banner] = await db.update(banners).set(req.body).where(eq(banners.id, parseInt(id))).returning();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Failed to update banner" });
  }
});

router.delete("/api/admin/banners/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(banners).where(eq(banners.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

// ==================== LIBRARY CATEGORIES & ITEMS ====================

router.get("/api/library/categories", async (req, res) => {
  try {
    const categories = await db.select().from(libraryCategories)
      .where(eq(libraryCategories.isActive, true))
      .orderBy(asc(libraryCategories.displayOrder));
    res.json({ status: true, data: categories });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get categories" });
  }
});

router.get("/api/library/items", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { category_id, search_query, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let items = await db.select().from(libraryItems)
      .where(eq(libraryItems.isActive, true))
      .orderBy(asc(libraryItems.displayOrder));
    
    if (category_id) {
      items = items.filter(i => i.categoryId === parseInt(category_id as string));
    }
    if (search_query) {
      const query = (search_query as string).toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(query) || (i.summary && i.summary.toLowerCase().includes(query)));
    }
    
    const isPremium = req.userId ? await checkPremiumStatus(req.userId) : false;
    if (!isPremium) {
      items = items.map(i => i.isPremium ? { ...i, contentHtml: '' } : i);
    }
    
    const userFavorites = req.userId ? await db.select().from(favorites)
      .where(and(eq(favorites.userId, req.userId), eq(favorites.itemType, 'library'))) : [];
    const favoriteIds = new Set(userFavorites.map(f => f.itemId));
    
    const paginatedItems = items.slice(offset, offset + limitNum).map(item => ({
      ...item,
      is_favorite: favoriteIds.has(item.id)
    }));
    
    res.json({
      status: true,
      data: paginatedItems,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(items.length / limitNum),
        total_items: items.length
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get items" });
  }
});

router.post("/api/library/items/:id/favorite", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await db.select().from(favorites)
      .where(and(eq(favorites.userId, req.userId!), eq(favorites.itemType, 'library'), eq(favorites.itemId, parseInt(id))));
    
    if (existing.length > 0) {
      await db.delete(favorites).where(eq(favorites.id, existing[0].id));
      res.json({ status: true, message: "Removed from favorites", is_favorite: false });
    } else {
      await db.insert(favorites).values({ userId: req.userId!, itemType: 'library', itemId: parseInt(id) });
      res.json({ status: true, message: "Added to favorites", is_favorite: true });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to toggle favorite" });
  }
});

router.get("/api/library/items/:id", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [item] = await db.select().from(libraryItems).where(eq(libraryItems.id, parseInt(id)));
    if (!item) {
      return res.status(404).json({ status: false, error: "Item not found" });
    }
    const [category] = await db.select().from(libraryCategories).where(eq(libraryCategories.id, item.categoryId));
    const isFavorite = req.userId ? (await db.select().from(favorites)
      .where(and(eq(favorites.userId, req.userId), eq(favorites.itemType, 'library'), eq(favorites.itemId, item.id)))).length > 0 : false;
    res.json({ status: true, data: { ...item, category, is_favorite: isFavorite } });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get item" });
  }
});

router.get("/api/favorites", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, req.userId!));
    const libraryFavs = userFavorites.filter(f => f.itemType === 'library');
    const libraryItemIds = libraryFavs.map(f => f.itemId);
    const items = libraryItemIds.length > 0 
      ? await db.select().from(libraryItems).where(sql`${libraryItems.id} = ANY(${libraryItemIds})`)
      : [];
    res.json({ status: true, data: { library: items } });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get favorites" });
  }
});

// ==================== USER SAVED ITEMS (home content bookmarks) ====================

router.get("/api/user/saved-items", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT item_id, section, payload, saved_at
      FROM user_saved_items
      WHERE user_id = ${req.userId!}
      ORDER BY saved_at DESC
    `);
    const items = (rows as any[]).map((row) => ({
      ...(typeof row.payload === "object" ? row.payload : {}),
      section: row.section ?? undefined,
      savedAt: row.saved_at,
    }));
    res.json({ status: true, data: items });
  } catch (error) {
    console.error("Get saved items error:", error);
    res.status(500).json({ status: false, error: "Failed to get saved items" });
  }
});

router.put("/api/user/saved-items", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { item, section } = req.body ?? {};
    if (!item?.id) {
      return res.status(400).json({ status: false, error: "item.id is required" });
    }

    const existing = await db.execute(sql`
      SELECT id FROM user_saved_items
      WHERE user_id = ${req.userId!} AND item_id = ${String(item.id)}
      LIMIT 1
    `);

    if ((existing as any[]).length > 0) {
      await db.execute(sql`
        DELETE FROM user_saved_items
        WHERE user_id = ${req.userId!} AND item_id = ${String(item.id)}
      `);
      return res.json({ status: true, saved: false, message: "Removed from saved items" });
    }

    const payload = JSON.stringify({
      id: String(item.id),
      type: item.type ?? "article",
      name: item.name ?? "",
      description: item.description ?? null,
      media_url: item.media_url ?? null,
      thumbnail_url: item.thumbnail_url ?? null,
      product_link: item.product_link ?? null,
    });

    await db.execute(sql`
      INSERT INTO user_saved_items (user_id, item_id, section, payload)
      VALUES (${req.userId!}, ${String(item.id)}, ${section ?? null}, ${payload}::jsonb)
      ON CONFLICT (user_id, item_id) DO UPDATE
      SET section = EXCLUDED.section,
          payload = EXCLUDED.payload,
          saved_at = NOW()
    `);

    res.json({ status: true, saved: true, message: "Item saved" });
  } catch (error) {
    console.error("Toggle saved item error:", error);
    res.status(500).json({ status: false, error: "Failed to update saved item" });
  }
});

router.delete("/api/user/saved-items/:itemId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;
    await db.execute(sql`
      DELETE FROM user_saved_items
      WHERE user_id = ${req.userId!} AND item_id = ${itemId}
    `);
    res.json({ status: true, message: "Removed" });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to remove saved item" });
  }
});

router.post("/api/user/saved-items/sync", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const localItems: Array<{ id: string; section?: string; savedAt?: string; [key: string]: unknown }> =
      Array.isArray(req.body?.items) ? req.body.items : [];

    for (const item of localItems) {
      if (!item?.id) continue;
      const payload = JSON.stringify({
        id: String(item.id),
        type: item.type ?? "article",
        name: item.name ?? "",
        description: item.description ?? null,
        media_url: item.media_url ?? null,
        thumbnail_url: item.thumbnail_url ?? null,
        product_link: item.product_link ?? null,
      });
      await db.execute(sql`
        INSERT INTO user_saved_items (user_id, item_id, section, payload)
        VALUES (${req.userId!}, ${String(item.id)}, ${item.section ?? null}, ${payload}::jsonb)
        ON CONFLICT (user_id, item_id) DO NOTHING
      `);
    }

    const rows = await db.execute(sql`
      SELECT item_id, section, payload, saved_at
      FROM user_saved_items
      WHERE user_id = ${req.userId!}
      ORDER BY saved_at DESC
    `);
    const items = (rows as any[]).map((row) => ({
      ...(typeof row.payload === "object" ? row.payload : {}),
      section: row.section ?? undefined,
      savedAt: row.saved_at,
    }));
    res.json({ status: true, data: items });
  } catch (error) {
    console.error("Sync saved items error:", error);
    res.status(500).json({ status: false, error: "Failed to sync saved items" });
  }
});

// Admin Library Categories CRUD
router.get("/api/admin/library-categories", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const list = await db.select().from(libraryCategories).orderBy(asc(libraryCategories.displayOrder));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get categories" });
  }
});

router.post("/api/admin/library-categories", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertLibraryCategorySchema.parse(req.body);
    const [category] = await db.insert(libraryCategories).values(data).returning();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/api/admin/library-categories/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [category] = await db.update(libraryCategories).set(req.body).where(eq(libraryCategories.id, parseInt(id))).returning();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/api/admin/library-categories/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(libraryCategories).where(eq(libraryCategories.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Admin Library Items CRUD
router.get("/api/admin/library-items", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const list = await db.select({
      item: libraryItems,
      category: { name: libraryCategories.name }
    }).from(libraryItems)
      .leftJoin(libraryCategories, eq(libraryItems.categoryId, libraryCategories.id))
      .orderBy(asc(libraryItems.displayOrder));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get items" });
  }
});

router.post("/api/admin/library-items", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertLibraryItemSchema.parse(req.body);
    const [item] = await db.insert(libraryItems).values(data).returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

router.put("/api/admin/library-items/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [item] = await db.update(libraryItems).set(req.body).where(eq(libraryItems.id, parseInt(id))).returning();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

router.delete("/api/admin/library-items/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(libraryItems).where(eq(libraryItems.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// ==================== FORUM ====================

router.get("/api/forum/posts", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { page = "1", limit = "20", sort_by = "newest" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    const orderBy = sort_by === "popular" ? desc(forumPosts.likesCount) : desc(forumPosts.createdAt);
    
    const posts = await db.select({
      post: forumPosts,
      author: { user_id: users.id, user_name: users.name, user_image: users.avatar }
    }).from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.isApproved, true))
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);
    
    const userLikes = req.userId ? await db.select().from(forumLikes).where(eq(forumLikes.userId, req.userId)) : [];
    const likedPostIds = new Set(userLikes.map(l => l.postId));
    
    const postsWithLikeStatus = posts.map(p => ({
      post_id: p.post.id,
      author: p.author,
      content: p.post.content,
      image_urls: p.post.imageUrls ? JSON.parse(p.post.imageUrls) : [],
      likes_count: p.post.likesCount,
      comments_count: p.post.commentsCount,
      is_liked_by_me: likedPostIds.has(p.post.id),
      created_at: p.post.createdAt
    }));
    
    res.json({ status: true, data: postsWithLikeStatus });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get posts" });
  }
});

router.get("/api/forum/posts/:id", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.select({
      post: forumPosts,
      author: { user_id: users.id, user_name: users.name, user_image: users.avatar }
    }).from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.id, parseInt(id)));
    
    if (!result) {
      return res.status(404).json({ status: false, error: "Post not found" });
    }
    
    const isLiked = req.userId ? (await db.select().from(forumLikes)
      .where(and(eq(forumLikes.userId, req.userId), eq(forumLikes.postId, parseInt(id))))).length > 0 : false;
    
    res.json({ 
      status: true, 
      data: {
        post_id: result.post.id,
        author: result.author,
        content: result.post.content,
        image_urls: result.post.imageUrls ? JSON.parse(result.post.imageUrls) : [],
        likes_count: result.post.likesCount,
        comments_count: result.post.commentsCount,
        is_liked_by_me: isLiked,
        created_at: result.post.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get post" });
  }
});

router.post("/api/forum/posts", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content, image_urls } = req.body;
    const [post] = await db.insert(forumPosts).values({
      userId: req.userId!,
      content,
      imageUrls: image_urls ? JSON.stringify(image_urls) : null
    }).returning();
    
    res.json({ status: true, message: "Thread posted successfully", data: { post_id: post.id } });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to create post" });
  }
});

// Alias for /api/forum/posts (singular form)
router.post("/api/forum/post", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content, image_urls } = req.body;
    const [post] = await db.insert(forumPosts).values({
      userId: req.userId!,
      content,
      imageUrls: image_urls ? JSON.stringify(image_urls) : null
    }).returning();
    
    res.json({ status: true, message: "Thread posted successfully", data: { post_id: post.id } });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to create post" });
  }
});

router.post("/api/forum/posts/:id/like", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);
    
    const existing = await db.select().from(forumLikes)
      .where(and(eq(forumLikes.userId, req.userId!), eq(forumLikes.postId, postId)));
    
    if (existing.length > 0) {
      await db.delete(forumLikes).where(eq(forumLikes.id, existing[0].id));
      const [post] = await db.update(forumPosts)
        .set({ likesCount: sql`${forumPosts.likesCount} - 1` })
        .where(eq(forumPosts.id, postId))
        .returning();
      res.json({ status: true, message: "Unliked", likes_count: post.likesCount, is_liked_by_me: false });
    } else {
      await db.insert(forumLikes).values({ userId: req.userId!, postId });
      const [post] = await db.update(forumPosts)
        .set({ likesCount: sql`${forumPosts.likesCount} + 1` })
        .where(eq(forumPosts.id, postId))
        .returning();
      res.json({ status: true, message: "Liked", likes_count: post.likesCount, is_liked_by_me: true });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to like post" });
  }
});

router.get("/api/forum/posts/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = "1" } = req.query;
    const pageNum = parseInt(page as string);
    const limit = 20;
    const offset = (pageNum - 1) * limit;
    
    const comments = await db.select({
      comment: forumComments,
      author: { user_id: users.id, user_name: users.name, user_image: users.avatar }
    }).from(forumComments)
      .leftJoin(users, eq(forumComments.userId, users.id))
      .where(and(eq(forumComments.postId, parseInt(id)), eq(forumComments.isApproved, true)))
      .orderBy(desc(forumComments.createdAt))
      .limit(limit)
      .offset(offset);
    
    res.json({ status: true, data: comments.map(c => ({
      comment_id: c.comment.id,
      post_id: c.comment.postId,
      author: c.author,
      content: c.comment.content,
      created_at: c.comment.createdAt
    }))});
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get comments" });
  }
});

router.post("/api/forum/posts/:id/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const postId = parseInt(id);
    
    const [comment] = await db.insert(forumComments).values({
      postId,
      userId: req.userId!,
      content
    }).returning();
    
    await db.update(forumPosts)
      .set({ commentsCount: sql`${forumPosts.commentsCount} + 1` })
      .where(eq(forumPosts.id, postId));
    
    const [author] = await db.select({ user_id: users.id, user_name: users.name, user_image: users.avatar })
      .from(users).where(eq(users.id, req.userId!));
    
    res.json({
      status: true,
      message: "Comment added",
      data: { comment_id: comment.id, post_id: postId, author, content, created_at: comment.createdAt }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to add comment" });
  }
});

// Admin Forum Management
router.get("/api/admin/forum-posts", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const posts = await db.select({
      post: forumPosts,
      author: { name: users.name, email: users.email }
    }).from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .orderBy(desc(forumPosts.createdAt));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get forum posts" });
  }
});

router.put("/api/admin/forum-posts/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [post] = await db.update(forumPosts).set(req.body).where(eq(forumPosts.id, parseInt(id))).returning();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/api/admin/forum-posts/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(forumComments).where(eq(forumComments.postId, parseInt(id)));
    await db.delete(forumLikes).where(eq(forumLikes.postId, parseInt(id)));
    await db.delete(forumPosts).where(eq(forumPosts.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ==================== ENHANCED USER PROFILE ====================

router.get("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) return res.status(404).json({ status: false, error: "User not found" });
    
    let favoriteCount = 0;
    let questionsCount = 0;
    let entriesCount = 0;
    
    try {
      const favResult = await db.select({ count: sql<number>`count(*)` }).from(favorites).where(eq(favorites.userId, req.userId!));
      favoriteCount = favResult[0]?.count || 0;
    } catch (e) {
      console.log("Favorites table query error:", e);
    }
    
    try {
      const qResult = await db.select({ count: sql<number>`count(*)` }).from(expertQuestions).where(eq(expertQuestions.userId, req.userId!));
      questionsCount = qResult[0]?.count || 0;
    } catch (e) {
      console.log("Expert questions table query error:", e);
    }
    
    try {
      const eResult = await db.select({ count: sql<number>`count(*)` }).from(competitionEntries).where(eq(competitionEntries.userId, req.userId!));
      entriesCount = eResult[0]?.count || 0;
    } catch (e) {
      console.log("Competition entries table query error:", e);
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      status: true,
      data: {
        ...userWithoutPassword,
        favorite_count: favoriteCount,
        questions_asked_count: questionsCount,
        contest_entries_count: entriesCount
      }
    });
  } catch (error: any) {
    console.error("Profile endpoint error:", error);
    res.status(500).json({ status: false, error: "Failed to get profile", details: error.message });
  }
});

router.put("/api/user/profile", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, phone, avatar, zipCode, isNotificationEnabled } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (isNotificationEnabled !== undefined) updateData.isNotificationEnabled = isNotificationEnabled;
    
    const [user] = await db.update(users).set(updateData).where(eq(users.id, req.userId!)).returning();
    const { password, ...userWithoutPassword } = user;
    res.json({ status: true, message: "Profile updated successfully", data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to update profile" });
  }
});

// ==================== ADMIN PROFILE ====================

router.get("/api/admin/profile", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.put("/api/admin/profile", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      const existing = await db.select().from(users).where(and(eq(users.email, email), sql`${users.id} != ${req.userId!}`));
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already in use by another account" });
      }
      updateData.email = email;
    }
    if (phone !== undefined) updateData.phone = phone;

    const [user] = await db.update(users).set(updateData).where(eq(users.id, req.userId!)).returning();
    const { password, ...userWithoutPassword } = user;
    res.json({ message: "Profile updated successfully", data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.put("/api/admin/change-password", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, req.userId!));
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// ==================== USER DEVICES (FCM) ====================

router.post("/api/user/device", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { fcm_token, device_type } = req.body;
    
    const existing = await db.select().from(userDevices)
      .where(and(eq(userDevices.userId, req.userId!), eq(userDevices.fcmToken, fcm_token)));
    
    if (existing.length > 0) {
      await db.update(userDevices)
        .set({ lastActiveAt: new Date(), isActive: true })
        .where(eq(userDevices.id, existing[0].id));
    } else {
      await db.insert(userDevices).values({
        userId: req.userId!,
        fcmToken: fcm_token,
        deviceType: device_type
      });
    }
    
    res.json({ status: true, message: "Device registered" });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to register device" });
  }
});

router.delete("/api/user/device", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { fcm_token } = req.body;
    await db.delete(userDevices)
      .where(and(eq(userDevices.userId, req.userId!), eq(userDevices.fcmToken, fcm_token)));
    res.json({ status: true, message: "Device unregistered" });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to unregister device" });
  }
});

router.get("/api/user/devices", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const devices = await db.select().from(userDevices).where(eq(userDevices.userId, req.userId!));
    res.json({ status: true, data: devices });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get devices" });
  }
});

// ==================== ADMIN USER MANAGEMENT ====================

router.put("/api/admin/users/:id/ban", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned, bannedReason } = req.body;
    const [user] = await db.update(users)
      .set({ isBanned, bannedReason })
      .where(eq(users.id, parseInt(id)))
      .returning();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user ban status" });
  }
});

router.put("/api/admin/users/:id/subscription", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionStatus, subscriptionPlan, subscriptionExpiresAt } = req.body;
    const [user] = await db.update(users)
      .set({ subscriptionStatus, subscriptionPlan, subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null })
      .where(eq(users.id, parseInt(id)))
      .returning();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user subscription" });
  }
});

// ==================== ADMIN PUSH NOTIFICATIONS ====================

router.get("/api/admin/push-notifications", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const list = await db.select().from(pushNotifications).orderBy(desc(pushNotifications.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

router.delete("/api/admin/push-notifications/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid notification ID" });
    const deleted = await db.delete(pushNotifications).where(eq(pushNotifications.id, id)).returning();
    if (!deleted.length) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

router.post("/api/admin/push-notifications", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, body, imageUrl, actionUrl, actionType, targetType, targetUserIds } = req.body;
    
    // Convert image URL to use production domain - Firebase needs publicly accessible URLs
    let absoluteImageUrl = imageUrl;
    const PRODUCTION_BASE_URL = 'https://thelawncareworkshop.com';
    if (imageUrl && imageUrl.startsWith('/')) {
      absoluteImageUrl = `${PRODUCTION_BASE_URL}${imageUrl}`;
      console.log("📱 Converted relative image URL to absolute:", absoluteImageUrl);
    } else if (imageUrl && imageUrl.includes('replit.dev')) {
      // Replace any Replit dev URLs with production domain
      absoluteImageUrl = imageUrl.replace(/https?:\/\/[^\/]+\.replit\.dev/, PRODUCTION_BASE_URL);
      console.log("📱 Replaced Replit dev URL with production:", absoluteImageUrl);
    }
    
    console.log("📱 Push notification request:", { title, targetType, targetUserIds, actionUrl, actionType, imageUrl: absoluteImageUrl });
    
    let devices: any[] = [];
    if (targetType === "all") {
      devices = await db.select().from(userDevices).where(eq(userDevices.isActive, true));
      console.log(`📱 Target: all users, found ${devices.length} active devices`);
    } else if (targetType === "premium") {
      const premiumUsers = await db.select({ id: users.id }).from(users).where(eq(users.subscriptionStatus, "premium"));
      const premiumIds = premiumUsers.map(u => u.id);
      console.log(`📱 Target: premium users, found ${premiumUsers.length} premium users`);
      if (premiumIds.length > 0) {
        devices = await db.select().from(userDevices).where(and(eq(userDevices.isActive, true), sql`${userDevices.userId} = ANY(ARRAY[${premiumIds.join(',')}]::int[])`));
      }
    } else if (targetType === "specific" && targetUserIds) {
      const ids = targetUserIds.split(',').map((id: string) => parseInt(id.trim()));
      console.log(`📱 Target: specific users ${ids.join(',')}`);
      devices = await db.select().from(userDevices).where(sql`${userDevices.userId} = ANY(ARRAY[${ids.join(',')}]::int[])`);
    }
    
    console.log(`📱 Found ${devices.length} devices total`);
    const tokens = devices.map(d => d.fcmToken).filter(Boolean);
    console.log(`📱 Valid FCM tokens: ${tokens.length}`);
    
    let successCount = 0;
    let failureCount = 0;
    let errors: string[] = [];
    let firebaseStatus = 'not_checked';
    
    if (tokens.length > 0) {
      const { sendPushNotification } = await import('./firebase');
      const data: Record<string, string> = {};
      if (actionUrl) data.actionUrl = actionUrl;
      if (actionType) data.actionType = actionType;
      const result = await sendPushNotification(tokens, title, body, absoluteImageUrl, Object.keys(data).length > 0 ? data : undefined);
      successCount = result.successCount;
      failureCount = result.failureCount;
      errors = result.errors;
      firebaseStatus = result.errors.some(e => e.includes('Firebase not configured')) ? 'not_configured' : 'ok';
    } else {
      // Check Firebase config status even when no devices
      const { isFirebaseInitialized, initializeFirebase, getLastFirebaseError } = await import('./firebase');
      if (!isFirebaseInitialized()) {
        const initialized = await initializeFirebase();
        firebaseStatus = initialized ? 'ok' : 'not_configured';
        if (!initialized) {
          const reason = getLastFirebaseError();
          if (reason) errors.push(reason);
        }
      } else {
        firebaseStatus = 'ok';
      }
    }
    
    const [notification] = await db.insert(pushNotifications).values({
      title,
      body,
      imageUrl,
      actionUrl,
      actionType,
      targetType,
      targetUserIds,
      sentBy: req.userId!,
      successCount,
      failureCount
    }).returning();
    
    // Also insert into notifications table for in-app viewing
    if (targetType === "all") {
      // Global notification for all users
      await db.insert(notifications).values({
        title,
        message: body,
        type: "push",
        link: actionUrl || null,
        imageUrl: absoluteImageUrl || null,
        isGlobal: true
      });
    } else if (targetType === "specific" && targetUserIds) {
      // Individual notifications for specific users
      const ids = targetUserIds.split(',').map((id: string) => parseInt(id.trim()));
      for (const userId of ids) {
        await db.insert(notifications).values({
          userId,
          title,
          message: body,
          type: "push",
          link: actionUrl || null,
          imageUrl: absoluteImageUrl || null,
          isGlobal: false
        });
      }
    } else if (targetType === "premium") {
      // Get premium user IDs and create notifications for them
      const premiumUsers = await db.select({ id: users.id }).from(users).where(eq(users.subscriptionStatus, "premium"));
      for (const user of premiumUsers) {
        await db.insert(notifications).values({
          userId: user.id,
          title,
          message: body,
          type: "push",
          link: actionUrl || null,
          imageUrl: absoluteImageUrl || null,
          isGlobal: false
        });
      }
    }
    
    let message = '';
    let success = true;
    if (firebaseStatus === 'not_configured') {
      const detail = errors.find(e => e && !e.toLowerCase().includes('firebase not configured'));
      message = detail || 'Firebase not configured. Please add Firebase Service Account JSON in settings.';
      success = false;
    } else if (tokens.length === 0) {
      message = 'No devices registered yet. Notification saved and will be visible when users open the app.';
      success = true; // Still considered success - notification is saved
    } else if (successCount > 0) {
      message = `Notification sent to ${successCount} device(s)`;
      if (failureCount > 0) {
        message += ` (${failureCount} failed)`;
      }
      success = true;
    } else {
      message = 'Failed to send notifications. Check Firebase configuration.';
      success = false;
    }
    
    res.json({ 
      notification, 
      message,
      success,
      successCount,
      failureCount,
      totalDevices: tokens.length,
      firebaseConfigured: firebaseStatus === 'ok',
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined
    });
  } catch (error) {
    console.error("Push notification error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// ==================== ADMIN CONFIG MANAGEMENT ====================

router.get("/api/admin/configs", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const configs = await db.select().from(adminConfigs).orderBy(asc(adminConfigs.configKey));
    const safeConfigs = configs.map(c => ({
      ...c,
      configValue: c.isSecret ? "********" : c.configValue
    }));
    res.json(safeConfigs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get configs" });
  }
});

router.post("/api/admin/configs", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = insertAdminConfigSchema.parse({ ...req.body, updatedBy: req.userId });
    const [config] = await db.insert(adminConfigs).values(data).returning();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to create config" });
  }
});

router.put("/api/admin/configs/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [config] = await db.update(adminConfigs)
      .set({ ...req.body, updatedAt: new Date(), updatedBy: req.userId })
      .where(eq(adminConfigs.id, parseInt(id)))
      .returning();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to update config" });
  }
});

router.delete("/api/admin/configs/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(adminConfigs).where(eq(adminConfigs.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete config" });
  }
});

// ==================== FIREBASE CONFIG ====================

router.get("/api/admin/config/firebase", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Check if table exists first
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_configs'
      ) as exists
    `);
    
    // postgres-js returns rows as an array directly (not { rows: [...] }).
    if (!(tableCheck as any)[0]?.exists) {
      // Table doesn't exist, return empty config
      return res.json({});
    }
    
    const configs = await db.select().from(adminConfigs)
      .where(sql`${adminConfigs.configKey} LIKE 'firebase_%'`);
    
    const result: any = {};
    configs.forEach(config => {
      if (config.configKey === 'firebase_project_id') result.projectId = config.configValue;
      if (config.configKey === 'firebase_service_account') result.serviceAccountJson = config.isSecret ? '[CONFIGURED]' : config.configValue;
      if (config.configKey === 'firebase_server_key') result.serverKey = config.isSecret ? '[CONFIGURED]' : config.configValue;
    });
    
    res.json(result);
  } catch (error) {
    console.error("Firebase config GET error:", error);
    // Return empty config on error instead of 500
    res.json({});
  }
});

router.post("/api/admin/config/firebase", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { projectId, serviceAccountJson, serverKey } = req.body;
    
    // Create table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_configs (
        id SERIAL PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value TEXT,
        config_type VARCHAR(50) DEFAULT 'string',
        description TEXT,
        is_secret BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_by INTEGER
      )
    `);
    
    const configItems = [
      { key: 'firebase_project_id', value: projectId, isSecret: false, desc: 'Firebase Project ID' },
      { key: 'firebase_service_account', value: serviceAccountJson, isSecret: true, desc: 'Firebase Service Account JSON' },
      { key: 'firebase_server_key', value: serverKey, isSecret: true, desc: 'Firebase Legacy Server Key' },
    ];
    
    for (const item of configItems) {
      if (item.value) {
        const existing = await db.select().from(adminConfigs).where(eq(adminConfigs.configKey, item.key)).limit(1);
        if (existing.length > 0) {
          await db.update(adminConfigs)
            .set({ configValue: item.value, isSecret: item.isSecret, updatedAt: new Date() })
            .where(eq(adminConfigs.configKey, item.key));
        } else {
          await db.insert(adminConfigs).values({
            configKey: item.key,
            configValue: item.value,
            configType: 'string',
            description: item.desc,
            isSecret: item.isSecret,
          });
        }
      }
    }
    
    const { reinitializeFirebase, getLastFirebaseError } = await import('./firebase');
    const initialized = await reinitializeFirebase();
    
    res.json({ 
      success: true, 
      message: "Firebase configuration saved",
      firebaseInitialized: initialized,
      firebaseError: initialized ? null : getLastFirebaseError()
    });
  } catch (error) {
    console.error("Firebase config POST error:", error);
    res.status(500).json({ error: "Failed to save Firebase config" });
  }
});

router.get("/api/admin/config/firebase/test", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { initializeFirebase, isFirebaseInitialized, getLastFirebaseError } = await import('./firebase');
    
    if (!isFirebaseInitialized()) {
      const initialized = await initializeFirebase();
      if (!initialized) {
        return res.json({ 
          status: false, 
          message: getLastFirebaseError() || "Firebase not configured. Please add your Firebase Service Account JSON." 
        });
      }
    }
    
    res.json({ 
      status: true, 
      message: "Firebase is configured and ready to send notifications" 
    });
  } catch (error) {
    console.error("Firebase test error:", error);
    res.status(500).json({ status: false, error: "Failed to test Firebase connection" });
  }
});

// ==================== SUBSCRIPTION PLANS MANAGEMENT ====================

router.get("/api/subscription-plans", async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(asc(subscriptionPlans.displayOrder));
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to get plans" });
  }
});

router.get("/api/admin/subscription-plans", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.displayOrder));
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to get plans" });
  }
});

router.post("/api/admin/subscription-plans", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertSubscriptionPlanSchema.parse(req.body);
    const [plan] = await db.insert(subscriptionPlans).values(data).returning();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Failed to create plan" });
  }
});

router.put("/api/admin/subscription-plans/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [plan] = await db.update(subscriptionPlans).set(req.body).where(eq(subscriptionPlans.id, parseInt(id))).returning();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Failed to update plan" });
  }
});

router.delete("/api/admin/subscription-plans/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

// ==================== IN-APP PURCHASE VERIFICATION ====================

router.post("/api/iap/verify", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { platform, productId, transactionId, receiptData } = req.body;
    
    const existing = await db.select().from(inAppPurchases).where(eq(inAppPurchases.transactionId, transactionId));
    if (existing.length > 0) {
      return res.status(400).json({ status: false, error: "Transaction already processed" });
    }
    
    const [purchase] = await db.insert(inAppPurchases).values({
      userId: req.userId!,
      platform,
      productId,
      transactionId,
      receiptData,
      status: "pending"
    }).returning();
    
    const plan = await db.select().from(subscriptionPlans)
      .where(or(eq(subscriptionPlans.appleProductId, productId), eq(subscriptionPlans.googleProductId, productId)))
      .limit(1);
    
    if (plan.length > 0) {
      const endDate = new Date();
      if (plan[0].intervalType === 'year') {
        endDate.setFullYear(endDate.getFullYear() + (plan[0].intervalCount || 1));
      } else {
        endDate.setMonth(endDate.getMonth() + (plan[0].intervalCount || 1));
      }
      
      await db.update(users)
        .set({ subscriptionStatus: "premium", subscriptionPlan: plan[0].slug, subscriptionExpiresAt: endDate })
        .where(eq(users.id, req.userId!));
      
      await db.update(inAppPurchases)
        .set({ status: "verified", verifiedAt: new Date(), expiresAt: endDate })
        .where(eq(inAppPurchases.id, purchase.id));
    }
    
    res.json({ 
      status: true, 
      message: "Purchase verified",
      note: "Full receipt validation requires Apple/Google server integration"
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to verify purchase" });
  }
});

router.get("/api/admin/iap-purchases", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const purchases = await db.select({
      purchase: inAppPurchases,
      user: { name: users.name, email: users.email }
    }).from(inAppPurchases)
      .leftJoin(users, eq(inAppPurchases.userId, users.id))
      .orderBy(desc(inAppPurchases.createdAt));
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: "Failed to get purchases" });
  }
});

router.post("/api/iap/restore", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { platform, transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ status: false, error: "Transactions array required" });
    }

    let restoredPurchase = null;
    
    for (const tx of transactions) {
      const { productId, transactionId, receiptData } = tx;
      
      const [existing] = await db.select().from(inAppPurchases)
        .where(and(eq(inAppPurchases.transactionId, transactionId), eq(inAppPurchases.status, "verified")));
      
      if (existing && existing.expiresAt && new Date(existing.expiresAt) > new Date()) {
        restoredPurchase = existing;
        
        const plan = await db.select().from(subscriptionPlans)
          .where(or(eq(subscriptionPlans.appleProductId, productId), eq(subscriptionPlans.googleProductId, productId)))
          .limit(1);
        
        if (plan.length > 0) {
          await db.update(users)
            .set({ 
              subscriptionStatus: "premium", 
              subscriptionPlan: plan[0].slug, 
              subscriptionExpiresAt: existing.expiresAt 
            })
            .where(eq(users.id, req.userId!));
        }
        break;
      }
    }

    if (restoredPurchase) {
      res.json({ 
        status: true, 
        message: "Subscription restored successfully",
        data: {
          expires_at: restoredPurchase.expiresAt,
          product_id: restoredPurchase.productId
        }
      });
    } else {
      res.json({ 
        status: false, 
        message: "No active subscription found to restore"
      });
    }
  } catch (error) {
    console.error("Error restoring purchases:", error);
    res.status(500).json({ status: false, error: "Failed to restore purchases" });
  }
});

router.get("/api/subscription/status", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select({
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      subscriptionExpiresAt: users.subscriptionExpiresAt
    }).from(users).where(eq(users.id, req.userId!));

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date();
    const isPremium = user.subscriptionStatus === "premium" && !isExpired;

    if (isExpired && user.subscriptionStatus === "premium") {
      await db.update(users)
        .set({ subscriptionStatus: "free", subscriptionPlan: null, subscriptionExpiresAt: null })
        .where(eq(users.id, req.userId!));
    }

    res.json({
      status: true,
      data: {
        is_premium: isPremium,
        subscription_status: isExpired ? "expired" : user.subscriptionStatus,
        subscription_plan: user.subscriptionPlan,
        expires_at: user.subscriptionExpiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get subscription status" });
  }
});

router.get("/api/subscription/plans", async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    res.json({
      status: true,
      data: plans.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        currency: p.currency,
        interval_type: p.intervalType,
        interval_count: p.intervalCount,
        trial_days: p.trialDays,
        apple_product_id: p.appleProductId,
        google_product_id: p.googleProductId,
        features: p.features
      }))
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to get subscription plans" });
  }
});

// ==================== SOCIAL LOGIN ====================

router.post("/api/auth/social-login", async (req, res) => {
  try {
    const { provider, provider_token, fcm_token, device_type } = req.body;
    
    res.json({ 
      status: false, 
      message: "Social login requires OAuth provider configuration",
      note: "Configure Google/Apple/Facebook OAuth credentials in admin configs"
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Social login failed" });
  }
});

// ==================== PHONE OTP LOGIN ====================

router.post("/api/auth/phone-login", async (req, res) => {
  try {
    const { phone_num, fcm_token, device_type } = req.body;
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.insert(otpSessions).values({
      phone: phone_num,
      otpCode,
      otpToken,
      expiresAt
    });
    
    res.json({
      status: true,
      message: "OTP sent successfully",
      data: { otp_token: otpToken },
      debug_otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to send OTP" });
  }
});

router.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { otp_token, otp_code, fcm_token, device_type } = req.body;
    
    const [session] = await db.select().from(otpSessions)
      .where(and(eq(otpSessions.otpToken, otp_token), eq(otpSessions.isVerified, false)));
    
    if (!session) {
      return res.status(400).json({ status: false, error: "Invalid or expired OTP session" });
    }
    
    if (new Date() > new Date(session.expiresAt)) {
      return res.status(400).json({ status: false, error: "OTP expired" });
    }
    
    if (session.otpCode !== otp_code) {
      return res.status(400).json({ status: false, error: "Invalid OTP code" });
    }
    
    await db.update(otpSessions).set({ isVerified: true }).where(eq(otpSessions.id, session.id));
    
    let [user] = await db.select().from(users).where(eq(users.phone, session.phone));
    
    if (!user) {
      [user] = await db.insert(users).values({
        email: `${session.phone}@phone.local`,
        password: await hashPassword(crypto.randomBytes(16).toString('hex')),
        name: `User ${session.phone.slice(-4)}`,
        phone: session.phone,
        role: "user"
      }).returning();
    }
    
    if (fcm_token && device_type) {
      await db.insert(userDevices).values({
        userId: user.id,
        fcmToken: fcm_token,
        deviceType: device_type
      }).onConflictDoNothing();
    }
    
    const token = generateToken(user.id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      status: true,
      message: "Phone verified successfully",
      data: { token, user: userWithoutPassword }
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to verify OTP" });
  }
});

// ==================== ADMIN DASHBOARD STATS ====================

router.get("/api/admin/dashboard-stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const premiumUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.subscriptionStatus, "premium"));
    const totalQuestions = await db.select({ count: sql<number>`count(*)` }).from(expertQuestions);
    const pendingQuestions = await db.select({ count: sql<number>`count(*)` }).from(expertQuestions).where(eq(expertQuestions.status, "pending"));
    const totalEntries = await db.select({ count: sql<number>`count(*)` }).from(competitionEntries);
    const forumPostsCount = await db.select({ count: sql<number>`count(*)` }).from(forumPosts);
    
    res.json({
      totalUsers: totalUsers[0]?.count || 0,
      premiumUsers: premiumUsers[0]?.count || 0,
      totalQuestions: totalQuestions[0]?.count || 0,
      pendingQuestions: pendingQuestions[0]?.count || 0,
      totalEntries: totalEntries[0]?.count || 0,
      forumPosts: forumPostsCount[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// ==================== STRIPE CHECKOUT ====================

router.get("/api/stripe/config", async (req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({
      publishableKey,
      enabled: isStripeEnabled() && !!publishableKey,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get Stripe config" });
  }
});

router.get("/api/stripe/plans", async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(asc(subscriptionPlans.displayOrder));

    const checkoutPlans = (
      await Promise.all(
        plans.map(async (plan) => ({
          ...plan,
          stripePriceId:
            plan.stripePriceId || (await getStripePriceIdForSlug(plan.slug)) || null,
        })),
      )
    ).filter((plan) => plan.stripePriceId);

    if (checkoutPlans.length > 0) {
      return res.json(checkoutPlans);
    }

    const monthlyPriceId = await getStripePriceIdForSlug("monthly");
    const yearlyPriceId = await getStripePriceIdForSlug("yearly");

    const fallback = [
      {
        id: 0,
        name: "Monthly",
        slug: "monthly",
        description: "Perfect for trying out all premium features",
        price: "9.99",
        currency: "USD",
        intervalType: "month",
        intervalCount: 1,
        trialDays: 7,
        stripePriceId: monthlyPriceId ?? null,
        features: JSON.stringify([
          "Personalized lawn care plans",
          "All video lessons library",
          "AI-powered lawn diagnosis",
          "Expert Q&A access",
          "Monthly competition entry",
          "Exclusive deals & discounts",
        ]),
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 0,
        name: "Yearly",
        slug: "yearly",
        description: "Best value - save over 25%",
        price: "89.99",
        currency: "USD",
        intervalType: "year",
        intervalCount: 1,
        trialDays: 7,
        stripePriceId: yearlyPriceId ?? null,
        features: JSON.stringify([
          "Everything in Monthly",
          "2 months FREE",
          "Priority expert support",
          "Early access to new features",
          "Exclusive seasonal guides",
        ]),
        isActive: true,
        displayOrder: 2,
      },
    ].filter((plan) => plan.stripePriceId);

    res.json(fallback);
  } catch (error) {
    console.error("Error fetching Stripe plans:", error);
    res.status(500).json({ error: "Failed to get plans" });
  }
});

router.get("/api/stripe/products", async (req, res) => {
  try {
    const products = await db.execute(sql`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY pr.unit_amount
    `);
    // postgres-js returns rows as an array directly (not { rows: [...] }).
    res.json(Array.from(products as any));
  } catch (error) {
    console.error("Error fetching Stripe products:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
});

router.post("/api/stripe/create-checkout", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: "priceId is required" });
    }

    const stripe = await getUncachableStripeClient();
    if (!stripe) return res.status(503).json({ error: "Stripe is not configured on this server" });
    
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) return res.status(404).json({ error: "User not found" });
    
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id.toString() },
      });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
    }

    const baseUrl = resolveAppBaseUrl(req);
    const plan = await findPlanByStripePriceId(priceId);
    const trialDays = plan && "trialDays" in plan ? plan.trialDays ?? 7 : 7;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url:
        successUrl ||
        `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/pricing`,
      metadata: { userId: user.id.toString() },
      subscription_data: {
        metadata: { userId: user.id.toString() },
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});

router.get("/api/stripe/verify-session", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.query.session_id as string | undefined;
    if (!sessionId) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const stripe = await getUncachableStripeClient();
    if (!stripe) return res.status(503).json({ error: "Stripe is not configured on this server" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    await syncUserFromCheckoutSession(stripe, session, req.userId!);

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    res.json({
      success: true,
      subscriptionStatus: user?.subscriptionStatus,
      subscriptionPlan: user?.subscriptionPlan,
      subscriptionExpiresAt: user?.subscriptionExpiresAt,
    });
  } catch (error: any) {
    console.error("Verify session error:", error);
    res.status(400).json({ error: error.message || "Failed to verify checkout session" });
  }
});

router.post("/api/stripe/create-portal", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    if (!stripe) return res.status(503).json({ error: "Stripe is not configured on this server" });
    
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe billing profile found for this account" });
    }
    
    const baseUrl = resolveAppBaseUrl(req);
    const returnUrl = req.body?.returnUrl || `${baseUrl}/app/profile`;
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

router.get("/api/stripe/subscription-status", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get subscription status" });
  }
});

// Helper function to check premium status
async function checkPremiumStatus(userId: number): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return false;
  
  if (user.role === "admin") return true;
  if (user.subscriptionStatus !== "premium") return false;
  if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) return false;
  
  return true;
}

// ==================== MOBILE APP - HOME SCREEN API ====================

router.get("/api/home", async (req, res) => {
  try {
    const getItemIdPrefix = (type: string) => {
      if (type === "article" || type === "maintenance" || type === "advance" || type === "future") return "art_";
      if (type === "video") return "vid_";
      if (type === "product") return "prd_";
      return "item_";
    };

    const fetchSection = async (section: string) => {
      const items = await db.select().from(homeContentItems)
        .where(and(eq(homeContentItems.section, section), eq(homeContentItems.isActive, true)))
        .orderBy(asc(homeContentItems.displayOrder));
      return items.map(item => {
        const prefix = getItemIdPrefix(item.type);
        // For articles/products, use media_url as thumbnail fallback (they're images)
        // For videos, use explicit thumbnail or null
        let thumbnailUrl = item.thumbnailUrl;
        if (!thumbnailUrl && (item.type === "article" || item.type === "product" || item.type === "maintenance" || item.type === "advance" || item.type === "future")) {
          // Use media_url as thumbnail for image-based content types
          thumbnailUrl = item.mediaUrl;
        }
        return {
          id: `${prefix}${String(item.id).padStart(2, '0')}`,
          type: item.type,
          name: item.name,
          description: item.description,
          media_url: item.mediaUrl,
          created_at: item.createdAt,
          thumbnail_url: thumbnailUrl || null,
          product_link: item.productLink || null
        };
      });
    };

    const now = new Date();
    const [activeDeals, calendars, diagnosisFlows, ebooks, activeBanners, allVideos] = await Promise.all([
      db.select().from(deals)
        .where(and(
          eq(deals.isActive, true),
          or(isNull(deals.startDate), lte(deals.startDate, now)),
          or(isNull(deals.expiresAt), gte(deals.expiresAt, now))
        ))
        .limit(10),
      db.select().from(lawnCalendars)
        .where(eq(lawnCalendars.isActive, true))
        .orderBy(asc(lawnCalendars.displayOrder)),
      db.select().from(selfDiagnosisFlows)
        .where(eq(selfDiagnosisFlows.isActive, true))
        .orderBy(asc(selfDiagnosisFlows.displayOrder)),
      db.select().from(lawnLibraryEbooks)
        .where(eq(lawnLibraryEbooks.isActive, true))
        .orderBy(asc(lawnLibraryEbooks.displayOrder)),
      db.select().from(banners)
        .where(eq(banners.isActive, true))
        .orderBy(asc(banners.displayOrder))
        .limit(5),
      db.select().from(videoLessons)
        .where(eq(videoLessons.isActive, true))
        .orderBy(desc(videoLessons.isPinned), asc(videoLessons.displayOrder))
        .limit(20)
    ]);

    const [expertCorner, tipsTricks, equipments, fertilizerHerbicide, soilWater, insectsDisease, products] = await Promise.all([
      fetchSection("expert_corner"),
      fetchSection("tips_tricks"),
      fetchSection("equipments"),
      fetchSection("fertilizer_herbicide"),
      fetchSection("soil_water"),
      fetchSection("insects_disease"),
      fetchSection("products")
    ]);

    // Fetch active competition (not expired)
    const [activeCompetition] = await db.select().from(competitions)
      .where(and(
        eq(competitions.isActive, true),
        lte(competitions.startDate, now),
        gte(competitions.endDate, now)
      ))
      .orderBy(desc(competitions.startDate))
      .limit(1);

    // Fetch calendar events for each calendar
    const calendarEventsData = await db.select().from(calendarEvents)
      .where(eq(calendarEvents.isActive, true))
      .orderBy(asc(calendarEvents.displayOrder));

    // Group events by calendar ID
    const eventsByCalendar: Record<number, any[]> = {};
    calendarEventsData.forEach(event => {
      if (!eventsByCalendar[event.calendarId]) {
        eventsByCalendar[event.calendarId] = [];
      }
      eventsByCalendar[event.calendarId].push({
        id: `ev_${event.id}`,
        header: event.header,
        feature: event.feature,
        date: event.eventDate,
        image_url: event.imageUrl
      });
    });

    res.json({
      success: true,
      data: normalizeHomePayload(req, {
        banners: activeBanners.map(b => ({
          id: b.id,
          title: b.title,
          image_url: b.imageUrl,
          redirect_url: b.redirectUrl
        })),
        expert_corner: expertCorner,
        tips_tricks: tipsTricks,
        equipments: equipments,
        fertilizer_herbicide: fertilizerHerbicide,
        soil_water: soilWater,
        insects_disease: insectsDisease,
        deals: activeDeals.map(d => ({
          id: `deal_${d.id}`,
          title: d.title,
          link: d.storeUrl,
          affiliate_link: d.affiliateLink,
          image_url: d.image,
          start_date: d.startDate,
          expires_at: d.expiresAt
        })),
        calenders: calendars.map(c => ({
          id: `cal_${c.id}`,
          title: c.title,
          image_url: c.imageUrl,
          route_name: c.routeName,
          plans: [
            { type: "beginner", title: "Newbie", pdf_url: c.beginnerPdfUrl },
            { type: "intermediate", title: "Intermediate", pdf_url: c.intermediatePdfUrl },
            { type: "advanced", title: "Advanced", pdf_url: c.advancedPdfUrl }
          ],
          week_events: eventsByCalendar[c.id] || []
        })),
        self_diagnosis: diagnosisFlows.map(d => ({
          id: `diag_${d.id}`,
          title: d.title,
          image_url: d.imageUrl,
          questions: d.questions ? JSON.parse(d.questions) : []
        })),
        lawn_library: ebooks.map(e => ({
          id: `ebk_${e.id}`,
          name: e.name,
          image_url: e.imageUrl,
          download_url: e.downloadUrl
        })),
        videos: allVideos.map(v => ({
          id: `vid_${v.id}`,
          type: "video",
          name: v.title,
          title: v.title,
          description: v.description,
          media_url: v.videoUrl,
          video_url: v.videoUrl,
          thumbnail_url: v.thumbnailUrl,
          duration: v.duration,
          category: v.category,
          difficulty: v.difficulty,
          instructor: v.instructor,
          is_pinned: v.isPinned || false,
          is_premium: v.isPremium || false,
          view_count: v.viewCount || 0
        })),
        products: products.map(p => ({
          ...p,
          product_link: (p as any).productLink || null
        })),
        active_competition: activeCompetition ? {
          id: `comp_${activeCompetition.id}`,
          title: activeCompetition.title,
          description: activeCompetition.description,
          prize: activeCompetition.prize,
          start_date: activeCompetition.startDate,
          end_date: activeCompetition.endDate,
          status: activeCompetition.status
        } : null
      }),
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch home data" });
  }
});

// ==================== MOBILE APP - FORUM/POSTS API ====================

router.get("/api/posts", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const posts = await db.select({
      post: forumPosts,
      user: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.isApproved, true))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit)
      .offset(offset);

    let userLikes: number[] = [];
    if (req.userId) {
      const likes = await db.select({ postId: forumLikes.postId }).from(forumLikes)
        .where(eq(forumLikes.userId, req.userId));
      userLikes = likes.map(l => l.postId);
    }

    // Get total posts count
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(forumPosts)
      .where(eq(forumPosts.isApproved, true));
    const totalPosts = Number(countResult?.count || 0);

    const formattedPosts = posts.map(p => {
      const postType = p.post.postType || "text";
      const content: any = {
        text: p.post.content || null
      };
      
      // Parse image URLs if present
      let imageUrls: string[] = [];
      if (p.post.imageUrls) {
        try {
          imageUrls = JSON.parse(p.post.imageUrls);
        } catch (e) {
          imageUrls = [];
        }
      }
      
      // Always include image_urls array
      content.image_urls = imageUrls;
      
      // Add media fields for image/video posts
      if (postType === "image" || postType === "video") {
        content.media_url = p.post.mediaUrl || null;
        content.thumbnail_url = p.post.thumbnailUrl || null;
      }
      
      if (postType === "video") {
        content.duration_seconds = p.post.durationSeconds || 0;
      }

      return {
        post_id: `p${p.post.id}`,
        user_id: `u${p.post.userId}`,
        user_name: p.user?.name || "Anonymous",
        user_image: p.user?.avatar || null,
        post_type: postType,
        content,
        total_likes: p.post.likesCount || 0,
        total_comments: p.post.commentsCount || 0,
        is_liked: userLikes.includes(p.post.id),
        created_at: p.post.createdAt
      };
    });

    res.json({
      success: true,
      current_page: page,
      total_posts: totalPosts,
      data: formattedPosts
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});

router.get("/api/posts/:post_id", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.post_id);

    const [postData] = await db.select({
      post: forumPosts,
      user: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.id, postId));

    if (!postData) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    let isLiked = false;
    if (req.userId) {
      const [like] = await db.select().from(forumLikes)
        .where(and(eq(forumLikes.postId, postId), eq(forumLikes.userId, req.userId)));
      isLiked = !!like;
    }

    const comments = await db.select({
      comment: forumComments,
      user: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(forumComments)
      .leftJoin(users, eq(forumComments.userId, users.id))
      .where(eq(forumComments.postId, postId))
      .orderBy(asc(forumComments.createdAt))
      .limit(50);

    const formattedComments = comments.map(c => ({
      id: c.comment.id,
      user_id: c.comment.userId,
      user_name: c.user?.name || "Anonymous",
      user_avatar: c.user?.avatar || null,
      content: c.comment.content,
      created_at: c.comment.createdAt
    }));

    // Parse image URLs
    let imageUrls: string[] = [];
    if (postData.post.imageUrls) {
      try {
        imageUrls = JSON.parse(postData.post.imageUrls);
      } catch (e) {
        imageUrls = [];
      }
    }

    const postType = postData.post.postType || "text";
    const contentObj: any = {
      text: postData.post.content || null,
      image_urls: imageUrls
    };
    
    if (postType === "image" || postType === "video") {
      contentObj.media_url = postData.post.mediaUrl || null;
      contentObj.thumbnail_url = postData.post.thumbnailUrl || null;
    }
    if (postType === "video") {
      contentObj.duration_seconds = postData.post.durationSeconds || 0;
    }

    res.json({
      success: true,
      data: {
        post_id: `p${postData.post.id}`,
        user_id: `u${postData.post.userId}`,
        user_name: postData.user?.name || "Anonymous",
        user_image: postData.user?.avatar || null,
        post_type: postType,
        content: contentObj,
        total_likes: postData.post.likesCount || 0,
        total_comments: postData.post.commentsCount || 0,
        is_liked: isLiked,
        created_at: postData.post.createdAt,
        comments: formattedComments
      }
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ success: false, error: "Failed to fetch post" });
  }
});

router.post("/api/posts", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { post_type, content, media_url, thumbnail_url, duration_seconds, image_urls } = req.body;

    // Convert image_urls array to JSON string
    const imageUrlsJson = image_urls && Array.isArray(image_urls) ? JSON.stringify(image_urls) : null;

    const [newPost] = await db.insert(forumPosts).values({
      userId: req.userId!,
      postType: post_type || "text",
      content: content || null,
      mediaUrl: media_url || null,
      thumbnailUrl: thumbnail_url || null,
      durationSeconds: duration_seconds || null,
      imageUrls: imageUrlsJson,
      isApproved: true
    }).returning();

    const [user] = await db.select({ name: users.name, avatar: users.avatar })
      .from(users).where(eq(users.id, req.userId!));

    const postType = newPost.postType || "text";
    const contentObj: any = {
      text: newPost.content || null,
      image_urls: image_urls || []
    };
    
    if (postType === "image" || postType === "video") {
      contentObj.media_url = newPost.mediaUrl || null;
      contentObj.thumbnail_url = newPost.thumbnailUrl || null;
    }
    if (postType === "video") {
      contentObj.duration_seconds = newPost.durationSeconds || 0;
    }

    res.json({
      success: true,
      data: {
        post_id: `p${newPost.id}`,
        user_id: `u${newPost.userId}`,
        user_name: user?.name || "Anonymous",
        user_image: user?.avatar || null,
        post_type: postType,
        content: contentObj,
        total_likes: 0,
        total_comments: 0,
        is_liked: false,
        created_at: newPost.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
});

router.post("/api/posts/:post_id/like", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.post_id);
    
    const [existing] = await db.select().from(forumLikes)
      .where(and(eq(forumLikes.postId, postId), eq(forumLikes.userId, req.userId!)));

    if (existing) {
      await db.delete(forumLikes)
        .where(and(eq(forumLikes.postId, postId), eq(forumLikes.userId, req.userId!)));
      await db.update(forumPosts)
        .set({ likesCount: sql`GREATEST(${forumPosts.likesCount} - 1, 0)` })
        .where(eq(forumPosts.id, postId));
      
      res.json({ success: true, action: "unliked" });
    } else {
      await db.insert(forumLikes).values({ postId, userId: req.userId! });
      await db.update(forumPosts)
        .set({ likesCount: sql`${forumPosts.likesCount} + 1` })
        .where(eq(forumPosts.id, postId));
      
      res.json({ success: true, action: "liked" });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, error: "Failed to toggle like" });
  }
});

router.get("/api/posts/:post_id/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.post_id);

    const comments = await db.select({
      comment: forumComments,
      user: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(forumComments)
      .leftJoin(users, eq(forumComments.userId, users.id))
      .where(and(eq(forumComments.postId, postId), eq(forumComments.isApproved, true)))
      .orderBy(asc(forumComments.createdAt));

    const formattedComments = comments.map(c => ({
      comment_id: `c${c.comment.id}`,
      user_id: `u${c.comment.userId}`,
      user_name: c.user?.name || "Anonymous",
      user_image: c.user?.avatar || null,
      comment_text: c.comment.content,
      created_at: c.comment.createdAt
    }));

    res.json({
      success: true,
      total_comments: comments.length,
      data: formattedComments
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, error: "Failed to fetch comments" });
  }
});

router.post("/api/posts/:post_id/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.post_id);
    const { comment_text } = req.body;

    if (!comment_text || comment_text.trim() === "") {
      return res.status(400).json({ success: false, error: "Comment text is required" });
    }

    const [newComment] = await db.insert(forumComments).values({
      postId,
      userId: req.userId!,
      content: comment_text.trim(),
      isApproved: true
    }).returning();

    await db.update(forumPosts)
      .set({ commentsCount: sql`${forumPosts.commentsCount} + 1` })
      .where(eq(forumPosts.id, postId));

    const [user] = await db.select({ name: users.name, avatar: users.avatar })
      .from(users).where(eq(users.id, req.userId!));

    res.json({
      success: true,
      data: {
        comment_id: `c${newComment.id}`,
        user_id: `u${newComment.userId}`,
        user_name: user?.name || "Anonymous",
        user_image: user?.avatar || null,
        comment_text: newComment.content,
        created_at: newComment.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ success: false, error: "Failed to create comment" });
  }
});

// ==================== MOBILE APP - CONTEST API (legacy aliases) ====================

router.get("/api/contest/info", handleContestInfo);
router.get("/api/contest/entries", optionalAuthMiddleware, handleActiveEntries);
router.post("/api/contest/submit", authMiddleware, handleSubmitActiveEntry);
router.get("/api/contest/winners", handleWinners);

// ==================== MOBILE APP - QUESTIONS/CHAT API ====================

router.post("/api/questions/submit", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { description, priority, image_url } = req.body;

    if (!description || description.trim() === "") {
      return res.status(400).json({ success: false, error: "Description is required" });
    }

    const validPriorities = ["Emergency", "High", "Medium", "Low"];
    const questionPriority = validPriorities.includes(priority) ? priority : "Medium";

    const [newQuestion] = await db.insert(expertQuestions).values({
      userId: req.userId!,
      subject: `${questionPriority} Priority Question`,
      question: description.trim(),
      imageUrl: image_url || null,
      category: questionPriority.toLowerCase(),
      status: "pending",
      isPublic: false
    }).returning();

    await db.insert(chatMessages).values({
      questionId: newQuestion.id,
      senderId: req.userId!,
      senderType: "user",
      text: description.trim(),
      imageUrl: image_url || null
    });

    // Get user name for notification
    const [user] = await db.select({ name: users.name })
      .from(users).where(eq(users.id, req.userId!));

    // Send web push notification to admins for new Expert Q&A question
    console.log(`🌐 New Expert Q&A question submitted, sending web push to admins...`);
    notifyAdminsWebPush(
      "New Expert Question",
      `${user?.name || 'User'} asked: ${description.substring(0, 100)}`,
      { questionId: String(newQuestion.id), type: "new_expert_question", priority: questionPriority }
    ).catch(err => console.error('🔔 New question web push failed:', err));

    res.json({
      success: true,
      data: {
        question_id: newQuestion.id,
        description: newQuestion.question,
        priority: questionPriority,
        image_url: newQuestion.imageUrl,
        status: newQuestion.status,
        created_at: newQuestion.createdAt
      }
    });
  } catch (error) {
    console.error("Error submitting question:", error);
    res.status(500).json({ success: false, error: "Failed to submit question" });
  }
});

router.get("/api/user/chat/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.query.question_id as string);
    
    if (!questionId) {
      return res.status(400).json({ success: false, error: "question_id is required" });
    }

    const [question] = await db.select().from(expertQuestions)
      .where(and(eq(expertQuestions.id, questionId), eq(expertQuestions.userId, req.userId!)));

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const messages = await db.select({
      message: chatMessages,
      sender: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.questionId, questionId))
      .orderBy(asc(chatMessages.createdAt));

    const formattedMessages = messages.map(m => ({
      id: m.message.id,
      sender_id: m.message.senderId,
      sender_name: m.sender?.name || "Admin",
      sender_avatar: m.sender?.avatar,
      sender_type: m.message.senderType,
      ...normalizeQaMessage(req, { text: m.message.text, image_url: m.message.imageUrl }),
      is_read: m.message.isRead,
      created_at: m.message.createdAt
    }));

    await db.update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.questionId, questionId),
        eq(chatMessages.senderType, "admin")
      ));

    res.json({
      success: true,
      data: formattedMessages,
      question: {
        id: question.id,
        question: question.question,
        status: question.status,
        created_at: question.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

router.post("/api/user/chat/send", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { question_id, text, image_url } = req.body;

    if (!question_id) {
      return res.status(400).json({ success: false, error: "question_id is required" });
    }

    if (!text && !image_url) {
      return res.status(400).json({ success: false, error: "text or image_url is required" });
    }

    const [question] = await db.select().from(expertQuestions)
      .where(and(eq(expertQuestions.id, question_id), eq(expertQuestions.userId, req.userId!)));

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const [newMessage] = await db.insert(chatMessages).values({
      questionId: question_id,
      senderId: req.userId!,
      senderType: "user",
      text: text || null,
      imageUrl: image_url || null
    }).returning();

    const [user] = await db.select({ name: users.name, avatar: users.avatar })
      .from(users).where(eq(users.id, req.userId!));

    // Send web push notification to admins for Expert Q&A messages
    console.log(`🌐 User sent Expert Q&A message, sending web push to admins...`);
    notifyAdminsWebPush(
      "New Expert Q&A Message",
      `${user?.name || 'User'}: ${text?.substring(0, 100) || 'New message'}`,
      { questionId: String(question_id), type: "expert_qa_message" }
    ).catch(err => console.error('🔔 Expert Q&A web push failed:', err));

    res.json({
      success: true,
      data: {
        id: newMessage.id,
        sender_id: newMessage.senderId,
        sender_name: user?.name || "User",
        sender_avatar: user?.avatar,
        sender_type: newMessage.senderType,
        ...normalizeQaMessage(req, { text: newMessage.text, image_url: newMessage.imageUrl }),
        is_read: newMessage.isRead,
        created_at: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

router.get("/api/user/questions", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const questions = await db.select().from(expertQuestions)
      .where(eq(expertQuestions.userId, req.userId!))
      .orderBy(desc(expertQuestions.createdAt));

    const questionsWithUnread = await Promise.all(questions.map(async (q) => {
      const [unreadCount] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(chatMessages)
        .where(and(
          eq(chatMessages.questionId, q.id),
          eq(chatMessages.senderType, "admin"),
          eq(chatMessages.isRead, false)
        ));

      return {
        id: q.id,
        question: q.question,
        image_url: q.imageUrl,
        category: q.category,
        status: q.status,
        answer: q.answer,
        unread_messages: Number(unreadCount?.count || 0),
        created_at: q.createdAt,
        answered_at: q.answeredAt
      };
    }));

    res.json({
      success: true,
      data: questionsWithUnread
    });
  } catch (error) {
    console.error("Error fetching user questions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch questions" });
  }
});

// ==================== ADMIN - CHAT API ====================

router.get("/api/admin/chat/messages", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(req.query.question_id as string);
    
    if (!questionId) {
      return res.status(400).json({ success: false, error: "question_id is required" });
    }

    const messages = await db.select({
      message: chatMessages,
      sender: { id: users.id, name: users.name, avatar: users.avatar }
    }).from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.questionId, questionId))
      .orderBy(asc(chatMessages.createdAt));

    const formattedMessages = messages.map(m => ({
      id: m.message.id,
      sender_id: m.message.senderId,
      sender_name: m.sender?.name || "User",
      sender_avatar: m.sender?.avatar,
      sender_type: m.message.senderType,
      ...normalizeQaMessage(req, { text: m.message.text, image_url: m.message.imageUrl }),
      is_read: m.message.isRead,
      created_at: m.message.createdAt
    }));

    await db.update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.questionId, questionId),
        eq(chatMessages.senderType, "user")
      ));

    res.json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error("Error fetching admin chat messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

router.post("/api/admin/chat/send", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { question_id, text, image_url } = req.body;

    if (!question_id) {
      return res.status(400).json({ success: false, error: "question_id is required" });
    }

    if (!text && !image_url) {
      return res.status(400).json({ success: false, error: "text or image_url is required" });
    }

    const [newMessage] = await db.insert(chatMessages).values({
      questionId: question_id,
      senderId: req.userId!,
      senderType: "admin",
      text: text || null,
      imageUrl: image_url || null
    }).returning();

    await db.update(expertQuestions)
      .set({ status: "answered", answeredBy: req.userId!, answeredAt: new Date() })
      .where(eq(expertQuestions.id, question_id));

    const [admin] = await db.select({ name: users.name, avatar: users.avatar })
      .from(users).where(eq(users.id, req.userId!));

    res.json({
      success: true,
      data: {
        id: newMessage.id,
        sender_id: newMessage.senderId,
        sender_name: admin?.name || "Admin",
        sender_avatar: admin?.avatar,
        sender_type: newMessage.senderType,
        ...normalizeQaMessage(req, { text: newMessage.text, image_url: newMessage.imageUrl }),
        is_read: newMessage.isRead,
        created_at: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

// ==================== ADMIN - HOME CONTENT MANAGEMENT ====================

router.get("/api/admin/home-content", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const section = req.query.section as string;
    
    let query = db.select().from(homeContentItems);
    if (section) {
      query = query.where(eq(homeContentItems.section, section)) as any;
    }
    
    const items = await query.orderBy(asc(homeContentItems.displayOrder));
    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching home content:", error);
    res.status(500).json({ success: false, error: "Failed to fetch home content" });
  }
});

router.post("/api/admin/home-content", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { section, type, name, description, mediaUrl, thumbnailUrl, productLink, displayOrder } = req.body;

    const [item] = await db.insert(homeContentItems).values({
      section,
      type,
      name,
      description,
      mediaUrl,
      thumbnailUrl,
      productLink: productLink || null,
      displayOrder: displayOrder || 0
    }).returning();

    res.json({ success: true, data: item });
  } catch (error) {
    console.error("Error creating home content:", error);
    res.status(500).json({ success: false, error: "Failed to create home content" });
  }
});

router.put("/api/admin/home-content/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { section, type, name, description, mediaUrl, thumbnailUrl, productLink, displayOrder, isActive } = req.body;

    const [item] = await db.update(homeContentItems)
      .set({
        section,
        type,
        name,
        description,
        mediaUrl,
        thumbnailUrl,
        productLink: productLink || null,
        displayOrder,
        isActive
      })
      .where(eq(homeContentItems.id, id))
      .returning();

    res.json({ success: true, data: item });
  } catch (error) {
    console.error("Error updating home content:", error);
    res.status(500).json({ success: false, error: "Failed to update home content" });
  }
});

router.delete("/api/admin/home-content/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(homeContentItems).where(eq(homeContentItems.id, id));
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting home content:", error);
    res.status(500).json({ success: false, error: "Failed to delete home content" });
  }
});

// ==================== ADMIN - CALENDARS MANAGEMENT ====================

router.get("/api/admin/calendars", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const calendars = await db.select().from(lawnCalendars).orderBy(asc(lawnCalendars.displayOrder));
    res.json({ success: true, data: calendars });
  } catch (error) {
    console.error("Error fetching calendars:", error);
    res.status(500).json({ success: false, error: "Failed to fetch calendars" });
  }
});

router.post("/api/admin/calendars", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, imageUrl, routeName, beginnerPdfUrl, intermediatePdfUrl, advancedPdfUrl } = req.body;

    const [calendar] = await db.insert(lawnCalendars).values({
      title,
      imageUrl,
      routeName,
      beginnerPdfUrl,
      intermediatePdfUrl,
      advancedPdfUrl
    }).returning();

    res.json({ success: true, data: calendar });
  } catch (error) {
    console.error("Error creating calendar:", error);
    res.status(500).json({ success: false, error: "Failed to create calendar" });
  }
});

router.put("/api/admin/calendars/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, imageUrl, routeName, beginnerPdfUrl, intermediatePdfUrl, advancedPdfUrl, displayOrder } = req.body;

    const [calendar] = await db.update(lawnCalendars).set({
      title,
      imageUrl,
      routeName,
      beginnerPdfUrl,
      intermediatePdfUrl,
      advancedPdfUrl,
      displayOrder
    }).where(eq(lawnCalendars.id, id)).returning();

    res.json({ success: true, data: calendar });
  } catch (error) {
    console.error("Error updating calendar:", error);
    res.status(500).json({ success: false, error: "Failed to update calendar" });
  }
});

router.delete("/api/admin/calendars/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(lawnCalendars).where(eq(lawnCalendars.id, id));
    res.json({ success: true, message: "Calendar deleted" });
  } catch (error) {
    console.error("Error deleting calendar:", error);
    res.status(500).json({ success: false, error: "Failed to delete calendar" });
  }
});

// ==================== ADMIN - SELF DIAGNOSIS MANAGEMENT ====================

router.get("/api/admin/self-diagnosis", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const flows = await db.select().from(selfDiagnosisFlows).orderBy(asc(selfDiagnosisFlows.displayOrder));
    res.json({ success: true, data: flows });
  } catch (error) {
    console.error("Error fetching diagnosis flows:", error);
    res.status(500).json({ success: false, error: "Failed to fetch diagnosis flows" });
  }
});

router.post("/api/admin/self-diagnosis", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, imageUrl, questions } = req.body;

    const [flow] = await db.insert(selfDiagnosisFlows).values({
      title,
      imageUrl,
      questions: typeof questions === "string" ? questions : JSON.stringify(questions)
    }).returning();

    res.json({ success: true, data: flow });
  } catch (error) {
    console.error("Error creating diagnosis flow:", error);
    res.status(500).json({ success: false, error: "Failed to create diagnosis flow" });
  }
});

router.put("/api/admin/self-diagnosis/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, imageUrl, questions, displayOrder } = req.body;

    const [flow] = await db.update(selfDiagnosisFlows).set({
      title,
      imageUrl,
      questions: typeof questions === "string" ? questions : JSON.stringify(questions),
      displayOrder
    }).where(eq(selfDiagnosisFlows.id, id)).returning();

    res.json({ success: true, data: flow });
  } catch (error) {
    console.error("Error updating diagnosis flow:", error);
    res.status(500).json({ success: false, error: "Failed to update diagnosis flow" });
  }
});

router.delete("/api/admin/self-diagnosis/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(selfDiagnosisFlows).where(eq(selfDiagnosisFlows.id, id));
    res.json({ success: true, message: "Diagnosis flow deleted" });
  } catch (error) {
    console.error("Error deleting diagnosis flow:", error);
    res.status(500).json({ success: false, error: "Failed to delete diagnosis flow" });
  }
});

// ==================== ADMIN - LAWN LIBRARY EBOOKS ====================

router.get("/api/admin/ebooks", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ebooks = await db.select().from(lawnLibraryEbooks).orderBy(asc(lawnLibraryEbooks.displayOrder));
    res.json({ success: true, data: ebooks });
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    res.status(500).json({ success: false, error: "Failed to fetch ebooks" });
  }
});

router.post("/api/admin/ebooks", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, imageUrl, downloadUrl } = req.body;

    const [ebook] = await db.insert(lawnLibraryEbooks).values({
      name,
      imageUrl,
      downloadUrl
    }).returning();

    res.json({ success: true, data: ebook });
  } catch (error) {
    console.error("Error creating ebook:", error);
    res.status(500).json({ success: false, error: "Failed to create ebook" });
  }
});

router.put("/api/admin/ebooks/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, imageUrl, downloadUrl, displayOrder } = req.body;

    const [ebook] = await db.update(lawnLibraryEbooks).set({
      name,
      imageUrl,
      downloadUrl,
      displayOrder
    }).where(eq(lawnLibraryEbooks.id, id)).returning();

    res.json({ success: true, data: ebook });
  } catch (error) {
    console.error("Error updating ebook:", error);
    res.status(500).json({ success: false, error: "Failed to update ebook" });
  }
});

router.delete("/api/admin/ebooks/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(lawnLibraryEbooks).where(eq(lawnLibraryEbooks.id, id));
    res.json({ success: true, message: "Ebook deleted" });
  } catch (error) {
    console.error("Error deleting ebook:", error);
    res.status(500).json({ success: false, error: "Failed to delete ebook" });
  }
});

// ==================== FILE UPLOAD ENDPOINTS ====================

router.post("/api/admin/upload/image", authMiddleware, adminMiddleware, uploadImage.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const fileUrl = await uploadToObjectStorage(req.file.buffer, req.file.originalname, req.file.mimetype, "content");
    res.json({ success: true, url: fileUrl, filename: req.file.originalname });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, error: "Failed to upload image" });
  }
});

router.post("/api/admin/upload/content", authMiddleware, adminMiddleware, uploadContent.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    
    const fileUrl = await uploadToObjectStorage(req.file.buffer, req.file.originalname, req.file.mimetype, "content");
    res.json({ success: true, url: fileUrl, filename: req.file.originalname });
  } catch (error) {
    console.error("Error uploading content:", error);
    res.status(500).json({ success: false, error: "Failed to upload content" });
  }
});

router.post("/api/admin/upload/pdf", authMiddleware, adminMiddleware, uploadEbook.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const fileUrl = await uploadToObjectStorage(req.file.buffer, req.file.originalname, req.file.mimetype, "ebooks");
    res.json({ success: true, url: fileUrl, filename: req.file.originalname });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ success: false, error: "Failed to upload PDF" });
  }
});

// ==================== GENERAL MEDIA UPLOAD ====================

router.post("/api/upload/media", authMiddleware, uploadContent.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, error: "No file uploaded" });
    }
    
    const mimeType = req.file.mimetype;
    let fileType = "document";
    
    if (mimeType.startsWith("image/")) {
      fileType = "image";
    } else if (mimeType.startsWith("video/") || needsConversion(req.file.originalname) || path.extname(req.file.originalname).toLowerCase() === ".mp4") {
      fileType = "video";
    } else if (mimeType === "application/pdf") {
      fileType = "pdf";
    }
    
    // Auto-convert any uploaded image to a compact, web-friendly PNG.
    let uploadBuffer = req.file.buffer;
    let uploadName = req.file.originalname;
    let uploadMime = req.file.mimetype;
    if (shouldConvertToPng(req.file.originalname, req.file.mimetype)) {
      try {
        const converted = await convertImageToPng(req.file.buffer, req.file.originalname);
        uploadBuffer = converted.buffer;
        uploadName = converted.filename;
        uploadMime = converted.mimeType;
        fileType = "image";
      } catch (convErr) {
        console.error("Image conversion failed:", convErr);
        // Only keep the original if a browser can actually display it.
        // HEIC/HEIF/BMP/TIFF would be unrenderable, so reject instead.
        if (!isBrowserRenderableImage(req.file.originalname, req.file.mimetype)) {
          return res.status(422).json({ status: false, error: "Could not process this image. Please try a JPG or PNG." });
        }
      }
    }
    
    const fileUrl = await uploadToObjectStorage(uploadBuffer, uploadName, uploadMime, "content");
    
    res.json({
      status: true,
      message: "File uploaded successfully",
      data: {
        url: fileUrl,
        fileType,
        fileName: uploadName,
        fileSize: uploadBuffer.length,
        mimeType: uploadMime
      }
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ status: false, error: "Failed to upload file" });
  }
});

// ==================== REAL-TIME CHAT SYSTEM ====================

// Get chat list - shows all conversations with last message
router.get("/api/chats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Get all conversations where user is a participant
    const userConversations = await db.select({
      conversation: conversations,
      user1: {
        id: sql<number>`u1.id`,
        name: sql<string>`u1.name`,
        avatar: sql<string>`u1.avatar`
      },
      user2: {
        id: sql<number>`u2.id`,
        name: sql<string>`u2.name`,
        avatar: sql<string>`u2.avatar`
      }
    })
      .from(conversations)
      .leftJoin(sql`users u1`, sql`${conversations.user1Id} = u1.id`)
      .leftJoin(sql`users u2`, sql`${conversations.user2Id} = u2.id`)
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)))
      .orderBy(desc(conversations.lastMessageAt));
    
    // Get last message for each conversation
    const chatList = await Promise.all(userConversations.map(async (conv) => {
      const otherUser = conv.conversation.user1Id === userId ? conv.user2 : conv.user1;
      const unreadCount = conv.conversation.user1Id === userId 
        ? conv.conversation.user1Unread 
        : conv.conversation.user2Unread;
      
      // Get last message
      const [lastMessage] = await db.select().from(directMessages)
        .where(eq(directMessages.conversationId, conv.conversation.id))
        .orderBy(desc(directMessages.createdAt))
        .limit(1);
      
      return {
        conversationId: conv.conversation.id,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar
        },
        lastMessage: lastMessage
          ? (() => {
              const n = normalizeChatMessage(req, lastMessage);
              return {
                id: lastMessage.id,
                type: n.messageType,
                content: n.content,
                mediaUrl: n.mediaUrl,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt
              };
            })()
          : null,
        unreadCount: unreadCount || 0,
        lastMessageAt: conv.conversation.lastMessageAt
      };
    }));
    
    res.json({ status: true, data: chatList });
  } catch (error) {
    console.error("Error getting chats:", error);
    res.status(500).json({ status: false, error: "Failed to get chats" });
  }
});

// Start a new conversation or get existing one
router.post("/api/chats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { recipientId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ status: false, error: "Recipient ID is required" });
    }
    
    if (recipientId === userId) {
      return res.status(400).json({ status: false, error: "Cannot chat with yourself" });
    }
    
    // Check if conversation already exists
    const existingConv = await db.select().from(conversations)
      .where(or(
        and(eq(conversations.user1Id, userId), eq(conversations.user2Id, recipientId)),
        and(eq(conversations.user1Id, recipientId), eq(conversations.user2Id, userId))
      ))
      .limit(1);
    
    if (existingConv.length > 0) {
      return res.json({ status: true, data: { conversationId: existingConv[0].id, isNew: false } });
    }
    
    // Create new conversation
    const [newConv] = await db.insert(conversations).values({
      user1Id: userId,
      user2Id: recipientId
    }).returning();
    
    res.json({ status: true, data: { conversationId: newConv.id, isNew: true } });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ status: false, error: "Failed to create conversation" });
  }
});

// Get messages for a conversation (chat room)
router.get("/api/chats/:conversationId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;
    const { page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Verify user is part of this conversation
    const [conv] = await db.select().from(conversations)
      .where(and(
        eq(conversations.id, parseInt(conversationId)),
        or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId))
      ));
    
    if (!conv) {
      return res.status(404).json({ status: false, error: "Conversation not found" });
    }
    
    // Get messages - include all messages from both users in the conversation
    const messages = await db.select({
      message: directMessages,
      sender: { id: users.id, name: users.name, avatar: users.avatar }
    })
      .from(directMessages)
      .leftJoin(users, eq(directMessages.senderId, users.id))
      .where(and(
        eq(directMessages.conversationId, parseInt(conversationId)),
        or(eq(directMessages.isDeleted, false), sql`${directMessages.isDeleted} IS NULL`)
      ))
      .orderBy(desc(directMessages.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    console.log(`[User Chat] User ${userId}, Conversation ${conversationId}: Found ${messages.length} messages from senders:`, messages.map(m => m.message.senderId));
    
    // Mark messages as read
    const isUser1 = conv.user1Id === userId;
    await db.update(conversations)
      .set(isUser1 ? { user1Unread: 0 } : { user2Unread: 0 })
      .where(eq(conversations.id, parseInt(conversationId)));
    
    // Mark individual messages as read
    await db.update(directMessages)
      .set({ isRead: true })
      .where(and(
        eq(directMessages.conversationId, parseInt(conversationId)),
        sql`${directMessages.senderId} != ${userId}`
      ));
    
    const formattedMessages = messages.map(m => {
      const n = normalizeChatMessage(req, { messageType: m.message.messageType, content: m.message.content, mediaUrl: m.message.mediaUrl });
      return {
        id: m.message.id,
        type: n.messageType,
        content: n.content,
        mediaUrl: n.mediaUrl,
        thumbnailUrl: absolutizeUrl(req, m.message.thumbnailUrl),
        fileName: m.message.fileName,
        fileSize: m.message.fileSize,
        isRead: m.message.isRead,
        sender: m.sender,
        isMine: m.message.senderId === userId,
        createdAt: m.message.createdAt
      };
    }).reverse(); // Reverse to get oldest first
    
    res.json({ status: true, data: formattedMessages, page: pageNum });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ status: false, error: "Failed to get messages" });
  }
});

// Send a message (supports text, image, video, document)
router.post("/api/chats/:conversationId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;
    const { messageType = "text", content, mediaUrl, thumbnailUrl, fileName, fileSize } = req.body;
    
    // Verify user is part of this conversation
    const [conv] = await db.select().from(conversations)
      .where(and(
        eq(conversations.id, parseInt(conversationId)),
        or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId))
      ));
    
    if (!conv) {
      return res.status(404).json({ status: false, error: "Conversation not found" });
    }
    
    // Validate message
    if (messageType === "text" && !content) {
      return res.status(400).json({ status: false, error: "Content is required for text messages" });
    }
    if (["image", "video", "document"].includes(messageType) && !mediaUrl) {
      return res.status(400).json({ status: false, error: "Media URL is required for media messages" });
    }
    
    // Create the message
    const [message] = await db.insert(directMessages).values({
      conversationId: parseInt(conversationId),
      senderId: userId,
      messageType,
      content,
      mediaUrl,
      thumbnailUrl,
      fileName,
      fileSize
    }).returning();
    
    // Update conversation with last message info
    const isUser1 = conv.user1Id === userId;
    const recipientId = isUser1 ? conv.user2Id : conv.user1Id;
    
    await db.update(conversations)
      .set({
        lastMessageId: message.id,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        // Increment unread count for the other user
        ...(isUser1 ? { user2Unread: sql`${conversations.user2Unread} + 1` } : { user1Unread: sql`${conversations.user1Unread} + 1` })
      })
      .where(eq(conversations.id, parseInt(conversationId)));
    
    // Get sender info
    const [sender] = await db.select({ id: users.id, name: users.name, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, userId));
    
    // Send push notification to recipient
    const { notifyChatMessage } = await import('./notifications');
    const messagePreview = messageType === 'text' ? content : `Sent a ${messageType}`;
    notifyChatMessage(userId, recipientId, sender?.name || 'User', messagePreview, parseInt(conversationId)).catch(console.error);
    
    // Check if recipient is an admin - if so, also send web push
    const [recipient] = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, recipientId));
    
    if (recipient?.role === 'admin') {
      console.log(`🌐 User sent message to admin, sending web push...`);
      notifyAdminsWebPush(
        "New Chat Message",
        `${sender?.name || 'User'}: ${messagePreview?.substring(0, 100) || 'New message'}`,
        { conversationId: String(conversationId), type: "chat_message" }
      ).catch(err => console.error('🔔 Chat web push failed:', err));
    }
    
    const sentNorm = normalizeChatMessage(req, { messageType: message.messageType, content: message.content, mediaUrl: message.mediaUrl });
    res.json({
      status: true,
      message: "Message sent successfully",
      data: {
        id: message.id,
        type: sentNorm.messageType,
        content: sentNorm.content,
        mediaUrl: sentNorm.mediaUrl,
        thumbnailUrl: absolutizeUrl(req, message.thumbnailUrl),
        fileName: message.fileName,
        fileSize: message.fileSize,
        sender,
        isMine: true,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ status: false, error: "Failed to send message" });
  }
});

// Upload chat media (images, videos, documents)
router.post("/api/chats/upload", authMiddleware, uploadContent.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, error: "No file uploaded" });
    }
    
    const mimeType = req.file.mimetype;
    let messageType = "document";
    
    if (mimeType.startsWith("image/")) {
      messageType = "image";
    } else if (mimeType.startsWith("video/")) {
      messageType = "video";
    }
    
    // Auto-convert any uploaded image to a compact, web-friendly PNG.
    let uploadBuffer = req.file.buffer;
    let uploadName = req.file.originalname;
    let uploadMime = req.file.mimetype;
    if (shouldConvertToPng(req.file.originalname, req.file.mimetype)) {
      try {
        const converted = await convertImageToPng(req.file.buffer, req.file.originalname);
        uploadBuffer = converted.buffer;
        uploadName = converted.filename;
        uploadMime = converted.mimeType;
        messageType = "image";
      } catch (convErr) {
        console.error("Image conversion failed:", convErr);
        // Only keep the original if a browser can actually display it.
        if (!isBrowserRenderableImage(req.file.originalname, req.file.mimetype)) {
          return res.status(422).json({ status: false, error: "Could not process this image. Please try a JPG or PNG." });
        }
      }
    }
    
    const fileUrl = await uploadToObjectStorage(uploadBuffer, uploadName, uploadMime, "chat");
    
    res.json({
      status: true,
      data: {
        url: fileUrl,
        messageType,
        fileName: uploadName,
        fileSize: uploadBuffer.length
      }
    });
  } catch (error) {
    console.error("Error uploading chat media:", error);
    res.status(500).json({ status: false, error: "Failed to upload file" });
  }
});

// Delete a message
router.delete("/api/chats/messages/:messageId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { messageId } = req.params;
    
    // Verify user owns this message
    const [message] = await db.select().from(directMessages)
      .where(and(eq(directMessages.id, parseInt(messageId)), eq(directMessages.senderId, userId)));
    
    if (!message) {
      return res.status(404).json({ status: false, error: "Message not found or not yours" });
    }
    
    // Soft delete
    await db.update(directMessages)
      .set({ isDeleted: true })
      .where(eq(directMessages.id, parseInt(messageId)));
    
    res.json({ status: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ status: false, error: "Failed to delete message" });
  }
});

// Get unread message count
router.get("/api/chats/unread-count", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    const convs = await db.select().from(conversations)
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)));
    
    let totalUnread = 0;
    for (const conv of convs) {
      if (conv.user1Id === userId) {
        totalUnread += conv.user1Unread || 0;
      } else {
        totalUnread += conv.user2Unread || 0;
      }
    }
    
    res.json({ status: true, data: { unreadCount: totalUnread } });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ status: false, error: "Failed to get unread count" });
  }
});

// ==================== SUPPORT CHAT (User-Admin) ====================

// Get admin user ID for support chat - users can directly message admin through regular chat
router.get("/api/support/admin-id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Admin user ID is always 1 (the seeded admin account)
    const ADMIN_USER_ID = 1;
    res.json({ status: true, data: { adminId: ADMIN_USER_ID } });
  } catch (error) {
    console.error("Error getting admin ID:", error);
    res.status(500).json({ status: false, error: "Failed to get admin ID" });
  }
});

// Start or get existing conversation with admin for support
router.post("/api/support/start-chat", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const ADMIN_USER_ID = 1;
    
    if (userId === ADMIN_USER_ID) {
      return res.status(400).json({ status: false, error: "Admin cannot start support chat with self" });
    }
    
    // Check if conversation already exists
    const existingConv = await db.select().from(conversations)
      .where(or(
        and(eq(conversations.user1Id, userId), eq(conversations.user2Id, ADMIN_USER_ID)),
        and(eq(conversations.user1Id, ADMIN_USER_ID), eq(conversations.user2Id, userId))
      ))
      .limit(1);
    
    if (existingConv.length > 0) {
      return res.json({ status: true, data: { conversationId: existingConv[0].id, isNew: false } });
    }
    
    // Create new conversation with admin
    const [newConv] = await db.insert(conversations).values({
      user1Id: userId,
      user2Id: ADMIN_USER_ID,
      lastMessageAt: new Date()
    }).returning();
    
    res.json({ status: true, data: { conversationId: newConv.id, isNew: true } });
  } catch (error) {
    console.error("Error starting support chat:", error);
    res.status(500).json({ status: false, error: "Failed to start support chat" });
  }
});

// User: Get my support tickets
router.get("/api/support/tickets", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    const tickets = await db.select({
      ticket: supportTickets,
      lastMessage: {
        content: supportMessages.content,
        createdAt: supportMessages.createdAt,
        senderType: supportMessages.senderType
      }
    }).from(supportTickets)
      .leftJoin(supportMessages, and(
        eq(supportMessages.ticketId, supportTickets.id),
        eq(supportMessages.createdAt, supportTickets.lastMessageAt)
      ))
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.lastMessageAt));
    
    res.json({
      status: true,
      data: tickets.map(t => ({
        id: t.ticket.id,
        subject: t.ticket.subject,
        status: t.ticket.status,
        priority: t.ticket.priority,
        unreadCount: t.ticket.userUnread,
        lastMessage: t.lastMessage?.content || null,
        lastMessageAt: t.ticket.lastMessageAt,
        createdAt: t.ticket.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ status: false, error: "Failed to fetch tickets" });
  }
});

// User: Create new support ticket
router.post("/api/support/tickets", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ status: false, error: "Subject and message are required" });
    }
    
    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
    
    // Create ticket
    const [ticket] = await db.insert(supportTickets).values({
      userId,
      subject,
      status: "open",
      priority: "normal",
      adminUnread: 1,
      userUnread: 0
    }).returning();
    
    // Create first message
    const [msg] = await db.insert(supportMessages).values({
      ticketId: ticket.id,
      senderId: userId,
      senderType: "user",
      messageType: "text",
      content: message
    }).returning();
    
    // Notify admins about new ticket
    const { notifyNewTicket } = await import('./notifications');
    notifyNewTicket(subject, user?.name || 'User').catch(console.error);
    
    res.json({
      status: true,
      data: {
        ticketId: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        message: {
          id: msg.id,
          content: msg.content,
          senderType: "user",
          createdAt: msg.createdAt
        }
      }
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ status: false, error: "Failed to create ticket" });
  }
});

// User: Get messages for a ticket
router.get("/api/support/tickets/:ticketId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const ticketId = parseInt(req.params.ticketId);
    
    // Verify user owns this ticket
    const [ticket] = await db.select().from(supportTickets)
      .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, userId)));
    
    if (!ticket) {
      return res.status(404).json({ status: false, error: "Ticket not found" });
    }
    
    // Get messages
    const messages = await db.select({
      message: supportMessages,
      sender: { id: users.id, name: users.name, avatar: users.avatar, role: users.role }
    }).from(supportMessages)
      .leftJoin(users, eq(supportMessages.senderId, users.id))
      .where(eq(supportMessages.ticketId, ticketId))
      .orderBy(asc(supportMessages.createdAt));
    
    // Mark as read for user
    await db.update(supportTickets)
      .set({ userUnread: 0 })
      .where(eq(supportTickets.id, ticketId));
    
    await db.update(supportMessages)
      .set({ isRead: true })
      .where(and(eq(supportMessages.ticketId, ticketId), eq(supportMessages.senderType, "admin")));
    
    res.json({
      status: true,
      data: {
        ticket: {
          id: ticket.id,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt
        },
        messages: messages.map(m => {
          const n = normalizeChatMessage(req, { messageType: m.message.messageType, content: m.message.content, mediaUrl: m.message.mediaUrl });
          return {
            id: m.message.id,
            senderType: m.message.senderType,
            senderName: m.sender?.name || "Support",
            senderAvatar: m.sender?.avatar,
            messageType: n.messageType,
            content: n.content,
            mediaUrl: n.mediaUrl,
            fileName: m.message.fileName,
            createdAt: m.message.createdAt
          };
        })
      }
    });
  } catch (error) {
    console.error("Error fetching ticket messages:", error);
    res.status(500).json({ status: false, error: "Failed to fetch messages" });
  }
});

// User: Send message to ticket
router.post("/api/support/tickets/:ticketId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const ticketId = parseInt(req.params.ticketId);
    const { message_type, content, media_url, file_name, file_size } = req.body;
    
    // Verify user owns this ticket
    const [ticket] = await db.select().from(supportTickets)
      .where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, userId)));
    
    if (!ticket) {
      return res.status(404).json({ status: false, error: "Ticket not found" });
    }
    
    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
    
    // Create message
    const [msg] = await db.insert(supportMessages).values({
      ticketId,
      senderId: userId,
      senderType: "user",
      messageType: message_type || "text",
      content,
      mediaUrl: media_url,
      fileName: file_name,
      fileSize: file_size
    }).returning();
    
    // Update ticket
    await db.update(supportTickets)
      .set({
        lastMessageAt: new Date(),
        adminUnread: sql`${supportTickets.adminUnread} + 1`,
        status: ticket.status === "resolved" ? "open" : ticket.status,
        updatedAt: new Date()
      })
      .where(eq(supportTickets.id, ticketId));
    
    // Notify admins via FCM
    console.log(`📱 User ${user?.name || 'Unknown'} sent support message in ticket ${ticketId}, notifying admins...`);
    const { notifySupportMessage } = await import('./notifications');
    notifySupportMessage(ticketId, 'user', user?.name || 'User', content || 'New message').catch(console.error);
    
    // Notify admins via Web Push (for browser notifications)
    console.log(`🌐 Calling notifyAdminsWebPush for ticket ${ticketId}...`);
    notifyAdminsWebPush(
      "New Support Message",
      `${user?.name || 'User'}: ${content?.substring(0, 100) || 'New message'}`,
      { ticketId: String(ticketId), type: "support_message" }
    ).catch(err => console.error('🔔 notifyAdminsWebPush call failed:', err));
    
    const userMsgNorm = normalizeChatMessage(req, { messageType: msg.messageType, content: msg.content, mediaUrl: msg.mediaUrl });
    res.json({
      status: true,
      data: {
        id: msg.id,
        senderType: "user",
        messageType: userMsgNorm.messageType,
        content: userMsgNorm.content,
        mediaUrl: userMsgNorm.mediaUrl,
        createdAt: msg.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ status: false, error: "Failed to send message" });
  }
});

// User: Get unread support count
router.get("/api/support/unread-count", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    const [result] = await db.select({
      total: sql<number>`COALESCE(SUM(${supportTickets.userUnread}), 0)`
    }).from(supportTickets)
      .where(eq(supportTickets.userId, userId));
    
    res.json({ status: true, data: { unreadCount: Number(result?.total || 0) } });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ status: false, error: "Failed to get count" });
  }
});

// ==================== ADMIN SUPPORT CHAT ====================

// Admin: Get all support tickets
router.get("/api/admin/support/tickets", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status, priority, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let query = db.select({
      ticket: supportTickets,
      user: { id: users.id, name: users.name, email: users.email, avatar: users.avatar }
    }).from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .orderBy(desc(supportTickets.lastMessageAt))
      .limit(limitNum)
      .offset(offset);
    
    // Apply filters
    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(supportTickets.status, status as string));
    }
    if (priority && priority !== "all") {
      conditions.push(eq(supportTickets.priority, priority as string));
    }
    
    const tickets = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;
    
    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(supportTickets);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const [countResult] = await countQuery;
    
    res.json({
      status: true,
      data: tickets.map(t => ({
        id: t.ticket.id,
        subject: t.ticket.subject,
        status: t.ticket.status,
        priority: t.ticket.priority,
        unreadCount: t.ticket.adminUnread,
        user: {
          id: t.user?.id,
          name: t.user?.name,
          email: t.user?.email,
          avatar: t.user?.avatar
        },
        lastMessageAt: t.ticket.lastMessageAt,
        createdAt: t.ticket.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countResult?.count || 0)
      }
    });
  } catch (error) {
    console.error("Error fetching admin support tickets:", error);
    res.status(500).json({ status: false, error: "Failed to fetch tickets" });
  }
});

// Admin: Get messages for a ticket
router.get("/api/admin/support/tickets/:ticketId/messages", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    
    const [ticket] = await db.select({
      ticket: supportTickets,
      user: { id: users.id, name: users.name, email: users.email, avatar: users.avatar }
    }).from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .where(eq(supportTickets.id, ticketId));
    
    if (!ticket) {
      return res.status(404).json({ status: false, error: "Ticket not found" });
    }
    
    const messages = await db.select({
      message: supportMessages,
      sender: { id: users.id, name: users.name, avatar: users.avatar, role: users.role }
    }).from(supportMessages)
      .leftJoin(users, eq(supportMessages.senderId, users.id))
      .where(eq(supportMessages.ticketId, ticketId))
      .orderBy(asc(supportMessages.createdAt));
    
    // Mark as read for admin
    await db.update(supportTickets)
      .set({ adminUnread: 0 })
      .where(eq(supportTickets.id, ticketId));
    
    await db.update(supportMessages)
      .set({ isRead: true })
      .where(and(eq(supportMessages.ticketId, ticketId), eq(supportMessages.senderType, "user")));
    
    res.json({
      status: true,
      data: {
        ticket: {
          id: ticket.ticket.id,
          subject: ticket.ticket.subject,
          status: ticket.ticket.status,
          priority: ticket.ticket.priority,
          createdAt: ticket.ticket.createdAt,
          user: {
            id: ticket.user?.id,
            name: ticket.user?.name,
            email: ticket.user?.email,
            avatar: ticket.user?.avatar
          }
        },
        messages: messages.map(m => {
          const n = normalizeChatMessage(req, { messageType: m.message.messageType, content: m.message.content, mediaUrl: m.message.mediaUrl });
          return {
            id: m.message.id,
            senderType: m.message.senderType,
            senderName: m.sender?.name || "Unknown",
            senderAvatar: m.sender?.avatar,
            senderRole: m.sender?.role,
            messageType: n.messageType,
            content: n.content,
            mediaUrl: n.mediaUrl,
            fileName: m.message.fileName,
            createdAt: m.message.createdAt
          };
        })
      }
    });
  } catch (error) {
    console.error("Error fetching ticket messages:", error);
    res.status(500).json({ status: false, error: "Failed to fetch messages" });
  }
});

// Admin: Send message to ticket
router.post("/api/admin/support/tickets/:ticketId/messages", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const adminId = req.userId!;
    const ticketId = parseInt(req.params.ticketId);
    const { message_type, content, media_url, file_name, file_size } = req.body;
    
    const [ticket] = await db.select().from(supportTickets)
      .where(eq(supportTickets.id, ticketId));
    
    if (!ticket) {
      return res.status(404).json({ status: false, error: "Ticket not found" });
    }
    
    // Create message
    const [msg] = await db.insert(supportMessages).values({
      ticketId,
      senderId: adminId,
      senderType: "admin",
      messageType: message_type || "text",
      content,
      mediaUrl: media_url,
      fileName: file_name,
      fileSize: file_size
    }).returning();
    
    // Update ticket
    await db.update(supportTickets)
      .set({
        lastMessageAt: new Date(),
        userUnread: sql`${supportTickets.userUnread} + 1`,
        assignedTo: ticket.assignedTo || adminId,
        status: ticket.status === "open" ? "in_progress" : ticket.status,
        updatedAt: new Date()
      })
      .where(eq(supportTickets.id, ticketId));
    
    const [admin] = await db.select({ name: users.name, avatar: users.avatar })
      .from(users).where(eq(users.id, adminId));
    
    // Notify the user who created the ticket
    const { notifySupportMessage } = await import('./notifications');
    notifySupportMessage(ticketId, 'admin', admin?.name || 'Admin', content || 'New reply', ticket.userId).catch(console.error);
    
    const adminMsgNorm = normalizeChatMessage(req, { messageType: msg.messageType, content: msg.content, mediaUrl: msg.mediaUrl });
    res.json({
      status: true,
      data: {
        id: msg.id,
        senderType: "admin",
        senderName: admin?.name || "Admin",
        senderAvatar: admin?.avatar,
        messageType: adminMsgNorm.messageType,
        content: adminMsgNorm.content,
        mediaUrl: adminMsgNorm.mediaUrl,
        createdAt: msg.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    res.status(500).json({ status: false, error: "Failed to send message" });
  }
});

// Admin: Update ticket status
router.patch("/api/admin/support/tickets/:ticketId", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const { status, priority } = req.body;
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    
    const [ticket] = await db.update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, ticketId))
      .returning();
    
    if (!ticket) {
      return res.status(404).json({ status: false, error: "Ticket not found" });
    }
    
    res.json({ status: true, data: ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ status: false, error: "Failed to update ticket" });
  }
});

// Admin: Get unread support count
router.get("/api/admin/support/unread-count", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const [result] = await db.select({
      total: sql<number>`COALESCE(SUM(${supportTickets.adminUnread}), 0)`
    }).from(supportTickets);
    
    res.json({ status: true, data: { unreadCount: Number(result?.total || 0) } });
  } catch (error) {
    console.error("Error getting admin unread count:", error);
    res.status(500).json({ status: false, error: "Failed to get count" });
  }
});

// ==================== ADMIN USER CHATS ====================

// Get all user conversations for admin
router.get("/api/admin/chats", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get all conversations with user info
    const allConversations = await db.select({
      conversation: conversations,
      user1: {
        id: sql<number>`u1.id`,
        name: sql<string>`u1.name`,
        email: sql<string>`u1.email`,
        avatar: sql<string>`u1.avatar`
      },
      user2: {
        id: sql<number>`u2.id`,
        name: sql<string>`u2.name`,
        email: sql<string>`u2.email`,
        avatar: sql<string>`u2.avatar`
      }
    })
      .from(conversations)
      .leftJoin(sql`users u1`, sql`${conversations.user1Id} = u1.id`)
      .leftJoin(sql`users u2`, sql`${conversations.user2Id} = u2.id`)
      .orderBy(desc(conversations.lastMessageAt));
    
    // Get last message for each conversation
    const chatList = await Promise.all(allConversations.map(async (conv) => {
      // Get last message
      const [lastMessage] = await db.select().from(directMessages)
        .where(eq(directMessages.conversationId, conv.conversation.id))
        .orderBy(desc(directMessages.createdAt))
        .limit(1);
      
      // Count total messages in conversation
      const [msgCount] = await db.select({ count: sql<number>`count(*)` }).from(directMessages)
        .where(eq(directMessages.conversationId, conv.conversation.id));
      
      return {
        conversationId: conv.conversation.id,
        user1: {
          id: conv.user1.id,
          name: conv.user1.name,
          email: conv.user1.email,
          avatar: conv.user1.avatar
        },
        user2: {
          id: conv.user2.id,
          name: conv.user2.name,
          email: conv.user2.email,
          avatar: conv.user2.avatar
        },
        lastMessage: lastMessage
          ? (() => {
              const n = normalizeChatMessage(req, lastMessage);
              return {
                id: lastMessage.id,
                type: n.messageType,
                content: n.content,
                mediaUrl: n.mediaUrl,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt
              };
            })()
          : null,
        messageCount: Number(msgCount?.count || 0),
        lastMessageAt: conv.conversation.lastMessageAt,
        createdAt: conv.conversation.createdAt
      };
    }));
    
    res.json({ status: true, data: chatList });
  } catch (error) {
    console.error("Error getting admin chats:", error);
    res.status(500).json({ status: false, error: "Failed to get chats" });
  }
});

// Get conversation messages for admin
router.get("/api/admin/chats/:conversationId/messages", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    
    // Get conversation with user info
    const [conv] = await db.select({
      conversation: conversations,
      user1: {
        id: sql<number>`u1.id`,
        name: sql<string>`u1.name`,
        email: sql<string>`u1.email`,
        avatar: sql<string>`u1.avatar`
      },
      user2: {
        id: sql<number>`u2.id`,
        name: sql<string>`u2.name`,
        email: sql<string>`u2.email`,
        avatar: sql<string>`u2.avatar`
      }
    })
      .from(conversations)
      .leftJoin(sql`users u1`, sql`${conversations.user1Id} = u1.id`)
      .leftJoin(sql`users u2`, sql`${conversations.user2Id} = u2.id`)
      .where(eq(conversations.id, conversationId));
    
    if (!conv) {
      return res.status(404).json({ status: false, error: "Conversation not found" });
    }
    
    // Get all messages from both participants
    const messages = await db.select({
      message: directMessages,
      sender: {
        id: sql<number>`u.id`,
        name: sql<string>`u.name`,
        avatar: sql<string>`u.avatar`
      }
    })
      .from(directMessages)
      .leftJoin(sql`users u`, sql`${directMessages.senderId} = u.id`)
      .where(and(
        eq(directMessages.conversationId, conversationId),
        or(eq(directMessages.isDeleted, false), sql`${directMessages.isDeleted} IS NULL`)
      ))
      .orderBy(asc(directMessages.createdAt));
    
    console.log(`[Admin Chat] Conversation ${conversationId}: Found ${messages.length} messages`);
    
    res.json({
      status: true,
      conversation: {
        id: conv.conversation.id,
        user1: conv.user1,
        user2: conv.user2,
        createdAt: conv.conversation.createdAt
      },
      messages: messages.map(m => {
        const n = normalizeChatMessage(req, { messageType: m.message.messageType, content: m.message.content, mediaUrl: m.message.mediaUrl });
        return {
          id: m.message.id,
          senderId: m.message.senderId,
          messageType: n.messageType,
          content: n.content,
          mediaUrl: n.mediaUrl,
          thumbnailUrl: absolutizeUrl(req, m.message.thumbnailUrl),
          fileName: m.message.fileName,
          fileSize: m.message.fileSize,
          isRead: m.message.isRead,
          createdAt: m.message.createdAt,
          sender: m.sender
        };
      })
    });
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    res.status(500).json({ status: false, error: "Failed to get messages" });
  }
});

// Admin: Send message in a conversation
router.post("/api/admin/chats/:conversationId/messages", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const adminId = req.userId!;
    const conversationId = parseInt(req.params.conversationId);
    const { content, message_type = "text", media_url, file_name, file_size } = req.body;
    
    if (!content && !media_url) {
      return res.status(400).json({ status: false, error: "Message content or media is required" });
    }
    
    // Verify conversation exists
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    if (!conv) {
      return res.status(404).json({ status: false, error: "Conversation not found" });
    }
    
    // Determine the recipient (the other user in the conversation)
    const recipientId = conv.user1Id === adminId ? conv.user2Id : conv.user1Id;
    
    // Create the message
    const [message] = await db.insert(directMessages).values({
      conversationId,
      senderId: adminId,
      messageType: message_type,
      content: content || "",
      mediaUrl: media_url,
      fileName: file_name,
      fileSize: file_size
    }).returning();
    
    // Update conversation last message time and increment unread count for recipient
    const isRecipientUser1 = conv.user1Id === recipientId;
    await db.update(conversations)
      .set({ 
        lastMessageAt: new Date(),
        ...(isRecipientUser1 ? { user1Unread: sql`${conversations.user1Unread} + 1` } : { user2Unread: sql`${conversations.user2Unread} + 1` })
      })
      .where(eq(conversations.id, conversationId));
    
    // Get sender info
    const [sender] = await db.select({ id: users.id, name: users.name, avatar: users.avatar })
      .from(users).where(eq(users.id, adminId));
    
    // Send push notification to the recipient user
    try {
      const recipientDevices = await db.select().from(userDevices)
        .where(eq(userDevices.userId, recipientId));
      
      if (recipientDevices.length > 0) {
        const tokens = recipientDevices.map(d => d.fcmToken).filter(Boolean);
        if (tokens.length > 0) {
          const { sendPushNotification } = await import('./firebase');
          const notificationTitle = sender?.name || "Support";
          const notificationBody = message_type === "text" 
            ? (content?.substring(0, 100) || "New message") 
            : `Sent ${message_type}`;
          
          await sendPushNotification(
            tokens,
            notificationTitle,
            notificationBody,
            undefined,
            { 
              type: "chat_message",
              conversationId: conversationId.toString(),
              senderId: adminId.toString(),
              messageId: message.id.toString()
            }
          );
          console.log(`[Admin Chat] Push notification sent to user ${recipientId} for message ${message.id}`);
        }
      }
    } catch (pushError) {
      console.error("Error sending push notification:", pushError);
      // Don't fail the request if push fails
    }
    
    const adminSentNorm = normalizeChatMessage(req, { messageType: message.messageType, content: message.content, mediaUrl: message.mediaUrl });
    res.json({
      status: true,
      data: {
        id: message.id,
        senderId: message.senderId,
        messageType: adminSentNorm.messageType,
        content: adminSentNorm.content,
        mediaUrl: adminSentNorm.mediaUrl,
        createdAt: message.createdAt,
        sender
      }
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    res.status(500).json({ status: false, error: "Failed to send message" });
  }
});

// ==================== FIREBASE WEB PUSH NOTIFICATIONS ====================

// Check if Firebase push is enabled
router.get("/api/push/status", (req, res) => {
  res.json({ enabled: isFirebaseEnabled() });
});

// Subscribe admin to Firebase push notifications
router.post("/api/admin/push/subscribe", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ error: "FCM token required" });
    }
    
    // Remove existing subscription for this token
    await db.delete(adminWebPushSubscriptions)
      .where(eq(adminWebPushSubscriptions.fcmToken, fcmToken));
    
    // Add new subscription
    await db.insert(adminWebPushSubscriptions).values({
      userId,
      fcmToken
    });
    
    console.log(`Admin ${userId} subscribed to Firebase push notifications`);
    res.json({ success: true, message: "Subscribed to push notifications" });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Unsubscribe from Firebase push
router.post("/api/admin/push/unsubscribe", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (fcmToken) {
      await db.delete(adminWebPushSubscriptions)
        .where(eq(adminWebPushSubscriptions.fcmToken, fcmToken));
    }
    
    res.json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// Test notification endpoint - sends a test notification to the current admin
router.post("/api/admin/push/test", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Get this admin's web push token
    const subscriptions = await db.select().from(adminWebPushSubscriptions)
      .where(eq(adminWebPushSubscriptions.userId, userId));
    
    if (subscriptions.length === 0) {
      return res.status(400).json({ error: "No push subscription found. Please enable notifications first." });
    }
    
    const tokens = subscriptions.map(s => s.fcmToken);
    console.log(`🔔 Test notification: Sending to ${tokens.length} tokens for admin ${userId}`);
    
    const result = await sendFirebaseWebPushToMultiple(tokens, {
      title: "Test Notification",
      body: "This is a test notification from LawnCare Workshop!",
      icon: "/icon-192.png",
      data: { type: "test", timestamp: Date.now().toString() }
    });
    
    console.log(`🔔 Test notification result: ${result.success} success, ${result.failure} failed`);
    
    if (result.success > 0) {
      res.json({ 
        success: true, 
        message: `Test notification sent! Success: ${result.success}, Failed: ${result.failure}` 
      });
    } else {
      res.status(500).json({ 
        error: `Failed to send notification. Failures: ${result.failure}`,
        details: result.invalidTokens 
      });
    }
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: error.message || "Failed to send test notification" });
  }
});

// Test mobile push notification - sends to user's mobile devices
router.post("/api/admin/push/test-mobile", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Get all registered mobile devices from user_devices table
    const devices = await db.select().from(userDevices)
      .where(and(
        eq(userDevices.userId, userId),
        eq(userDevices.isActive, true)
      ));
    
    if (devices.length === 0) {
      return res.status(400).json({ error: "No mobile devices found. Please open the mobile app first." });
    }
    
    console.log(`🔔 Mobile test: Found ${devices.length} devices for user ${userId}`);
    
    const deviceList = devices.map(d => ({
      token: d.fcmToken,
      deviceType: d.deviceType || "android"
    }));
    
    const result = await sendPushToMultipleDevices(deviceList, {
      title: "Test Notification",
      body: "This is a test notification from LawnCare Workshop!",
      data: { type: "test", timestamp: Date.now().toString() }
    });
    
    console.log(`🔔 Mobile test result: ${result.success} success, ${result.failure} failed`);
    
    // Deactivate invalid tokens
    for (const invalidToken of result.invalidTokens) {
      await db.update(userDevices)
        .set({ isActive: false })
        .where(eq(userDevices.fcmToken, invalidToken));
    }
    
    if (result.success > 0) {
      res.json({ 
        success: true, 
        message: `Sent to ${result.success} device(s)! Failed: ${result.failure}` 
      });
    } else {
      res.status(500).json({ 
        error: `Failed to send to any devices. Failures: ${result.failure}`,
        details: "Tokens may be expired or invalid"
      });
    }
  } catch (error: any) {
    console.error("Error sending mobile test notification:", error);
    res.status(500).json({ error: error.message || "Failed to send test notification" });
  }
});

// Helper function to send push to all admins via Firebase
async function notifyAdminsWebPush(title: string, body: string, data?: any) {
  console.log(`🔔 notifyAdminsWebPush: Sending "${title}" to admins...`);
  try {
    const subscriptions = await db.select().from(adminWebPushSubscriptions);
    const tokens = subscriptions.map(sub => sub.fcmToken);
    
    console.log(`🔔 notifyAdminsWebPush: Found ${tokens.length} admin web tokens`);
    
    if (tokens.length === 0) {
      console.log('🔔 notifyAdminsWebPush: No tokens found, skipping');
      return;
    }
    
    const result = await sendFirebaseWebPushToMultiple(tokens, {
      title,
      body,
      icon: "/favicon.jpg",
      data
    });
    
    console.log(`🔔 notifyAdminsWebPush: Result - ${result.success} success, ${result.failure} failed`);
    
    // Remove invalid tokens
    for (const invalidToken of result.invalidTokens) {
      console.log(`🔔 notifyAdminsWebPush: Removing invalid token`);
      await db.delete(adminWebPushSubscriptions)
        .where(eq(adminWebPushSubscriptions.fcmToken, invalidToken));
    }
  } catch (error) {
    console.error("🔔 notifyAdminsWebPush ERROR:", error);
  }
}

export { notifyAdminsWebPush };

// ==================== FIREBASE WEB CONFIG (Dynamic from Admin Panel) ====================

// Public endpoint - returns Firebase web config for client-side initialization
router.get("/api/firebase-config", async (req, res) => {
  try {
    const configs = await db.select().from(adminConfigs)
      .where(sql`${adminConfigs.configKey} LIKE 'firebase_web_%'`);
    
    const configMap: Record<string, string> = {};
    configs.forEach(c => {
      // Convert firebase_web_api_key to apiKey format
      const key = c.configKey.replace('firebase_web_', '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      configMap[key] = c.configValue || '';
    });
    
    // Only return if minimally configured
    if (!configMap.apiKey || !configMap.projectId) {
      res.json({ configured: false });
      return;
    }
    
    res.json({
      configured: true,
      apiKey: configMap.apiKey,
      authDomain: configMap.authDomain,
      projectId: configMap.projectId,
      storageBucket: configMap.storageBucket,
      messagingSenderId: configMap.messagingSenderId,
      appId: configMap.appId,
      vapidKey: configMap.vapidKey
    });
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    res.json({ configured: false });
  }
});

// Admin endpoint - get all Firebase settings
router.get("/api/admin/firebase-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const configs = await db.select().from(adminConfigs)
      .where(sql`${adminConfigs.configKey} LIKE 'firebase_%'`);
    
    const settings: Record<string, string> = {};
    configs.forEach(c => {
      settings[c.configKey] = c.configValue || '';
    });
    
    res.json({
      // Server-side (for sending push notifications)
      firebase_service_account: settings.firebase_service_account ? '(configured)' : '',
      // Client-side web config
      firebase_web_api_key: settings.firebase_web_api_key || '',
      firebase_web_auth_domain: settings.firebase_web_auth_domain || '',
      firebase_web_project_id: settings.firebase_web_project_id || '',
      firebase_web_storage_bucket: settings.firebase_web_storage_bucket || '',
      firebase_web_messaging_sender_id: settings.firebase_web_messaging_sender_id || '',
      firebase_web_app_id: settings.firebase_web_app_id || '',
      firebase_web_vapid_key: settings.firebase_web_vapid_key || ''
    });
  } catch (error) {
    console.error("Error fetching Firebase settings:", error);
    res.status(500).json({ error: "Failed to fetch Firebase settings" });
  }
});

// Admin endpoint - update Firebase settings
router.put("/api/admin/firebase-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allowedKeys = [
      'firebase_service_account',
      'firebase_web_api_key',
      'firebase_web_auth_domain',
      'firebase_web_project_id',
      'firebase_web_storage_bucket',
      'firebase_web_messaging_sender_id',
      'firebase_web_app_id',
      'firebase_web_vapid_key'
    ];
    
    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedKeys.includes(key)) continue;
      if (key === 'firebase_service_account' && value === '(configured)') continue; // Skip if not changed
      
      const existing = await db.select().from(adminConfigs)
        .where(eq(adminConfigs.configKey, key))
        .limit(1);
      
      if (existing.length > 0) {
        await db.update(adminConfigs)
          .set({ configValue: value as string, updatedAt: new Date() })
          .where(eq(adminConfigs.configKey, key));
      } else {
        await db.insert(adminConfigs).values({
          configKey: key,
          configValue: value as string
        });
      }
    }
    
    // Reinitialize Firebase if service account was updated
    let firebaseInitialized: boolean | undefined;
    let firebaseError: string | null = null;
    if (req.body.firebase_service_account && req.body.firebase_service_account !== '(configured)') {
      const { reinitializeFirebase, getLastFirebaseError } = await import('./firebase');
      firebaseInitialized = await reinitializeFirebase();
      if (!firebaseInitialized) firebaseError = getLastFirebaseError();
    }
    
    res.json({ success: true, message: "Firebase settings updated", firebaseInitialized, firebaseError });
  } catch (error) {
    console.error("Error updating Firebase settings:", error);
    res.status(500).json({ error: "Failed to update Firebase settings" });
  }
});

// ==================== EMAIL / SMTP SETTINGS ====================

router.get("/api/admin/email-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const configs = await db.select().from(adminConfigs)
      .where(sql`${adminConfigs.configKey} LIKE 'smtp_%'`);

    const settings: Record<string, string> = {};
    configs.forEach(c => {
      settings[c.configKey] = c.configValue || '';
    });

    res.json({
      smtp_host: settings.smtp_host || '',
      smtp_port: settings.smtp_port || '587',
      smtp_user: settings.smtp_user || '',
      // Never return the actual password; only whether it's set
      smtp_pass: settings.smtp_pass ? '(configured)' : '',
      smtp_from: settings.smtp_from || '',
      configured: Boolean(settings.smtp_host && settings.smtp_user && settings.smtp_pass),
    });
  } catch (error) {
    console.error("Error fetching email settings:", error);
    res.status(500).json({ error: "Failed to fetch email settings" });
  }
});

router.put("/api/admin/email-settings", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const allowedKeys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from'];

    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedKeys.includes(key)) continue;
      // Skip password placeholder so we don't overwrite the stored secret with the mask
      if (key === 'smtp_pass' && (value === '(configured)' || value === '')) continue;

      const existing = await db.select().from(adminConfigs)
        .where(eq(adminConfigs.configKey, key))
        .limit(1);

      if (existing.length > 0) {
        await db.update(adminConfigs)
          .set({ configValue: value as string, updatedAt: new Date(), updatedBy: req.userId, isSecret: key === 'smtp_pass' })
          .where(eq(adminConfigs.configKey, key));
      } else {
        await db.insert(adminConfigs).values({
          configKey: key,
          configValue: value as string,
          isSecret: key === 'smtp_pass',
          description: 'SMTP email setting',
          updatedBy: req.userId,
        });
      }
    }

    res.json({ success: true, message: "Email settings updated" });
  } catch (error) {
    console.error("Error updating email settings:", error);
    res.status(500).json({ error: "Failed to update email settings" });
  }
});

// ==================== OPENAI / AI SETTINGS ====================

router.get("/api/admin/openai-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const configs = await db.select().from(adminConfigs)
      .where(sql`${adminConfigs.configKey} LIKE 'openai_%'`);

    const settings: Record<string, string> = {};
    configs.forEach(c => {
      settings[c.configKey] = c.configValue || '';
    });

    const hasDbKey = Boolean(settings.openai_api_key);
    const hasEnvKey = Boolean(process.env.OPENAI_API_KEY?.trim());

    res.json({
      openai_api_key: hasDbKey ? '(configured)' : '',
      openai_base_url: settings.openai_base_url || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      configured: hasDbKey || hasEnvKey,
      source: hasDbKey ? 'admin_panel' : hasEnvKey ? 'environment' : 'none',
    });
  } catch (error) {
    console.error("Error fetching OpenAI settings:", error);
    res.status(500).json({ error: "Failed to fetch OpenAI settings" });
  }
});

router.put("/api/admin/openai-settings", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const allowedKeys = ['openai_api_key', 'openai_base_url'];

    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedKeys.includes(key)) continue;
      if (key === 'openai_api_key' && (value === '(configured)' || value === '')) continue;

      const existing = await db.select().from(adminConfigs)
        .where(eq(adminConfigs.configKey, key))
        .limit(1);

      if (existing.length > 0) {
        await db.update(adminConfigs)
          .set({ configValue: value as string, updatedAt: new Date(), updatedBy: req.userId, isSecret: key === 'openai_api_key' })
          .where(eq(adminConfigs.configKey, key));
      } else {
        await db.insert(adminConfigs).values({
          configKey: key,
          configValue: value as string,
          isSecret: key === 'openai_api_key',
          description: 'OpenAI API setting',
          updatedBy: req.userId,
        });
      }
    }

    res.json({ success: true, message: "OpenAI settings updated" });
  } catch (error) {
    console.error("Error updating OpenAI settings:", error);
    res.status(500).json({ error: "Failed to update OpenAI settings" });
  }
});

router.post("/api/admin/openai-settings/test", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!(await isOpenAiConfigured())) {
      return res.status(400).json({ error: "OpenAI is not configured. Save your API key first." });
    }

    const prompt = (req.body?.prompt as string)?.trim() || "Say hello in one short sentence as AI of Lawncare Workshop.";
    const content = await createChatCompletion(
      [
        { role: "system", content: AI_SYSTEM_PROMPTS.turfTalk },
        { role: "user", content: prompt },
      ],
      100,
    );

    res.json({ success: true, message: "OpenAI connection successful", data: { content } });
  } catch (error: any) {
    const message = error?.message || "";
    if (message.startsWith("OPENAI_HTTP_")) {
      const status = parseInt(message.replace("OPENAI_HTTP_", ""), 10);
      return res.status(502).json({ error: `OpenAI returned error ${status}. Check your API key and billing.` });
    }
    console.error("Error testing OpenAI:", error);
    res.status(500).json({ error: error?.message || "Failed to test OpenAI connection" });
  }
});

// ==================== WEATHER API SETTINGS ====================

router.get("/api/admin/weather-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const settings = await loadAdminConfigKeys([...WEATHER_CONFIG_KEYS]);
    const hasDbKey = Boolean(settings.weather_api_key);
    const hasEnvKey = Boolean(process.env.WEATHER_API_KEY?.trim());

    res.json({
      weather_api_key: maskSecret(settings.weather_api_key, hasDbKey),
      configured: hasDbKey || hasEnvKey,
      source: configSource(hasDbKey, hasEnvKey),
    });
  } catch (error) {
    console.error("Error fetching weather settings:", error);
    res.status(500).json({ error: "Failed to fetch weather settings" });
  }
});

router.put("/api/admin/weather-settings", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    await saveAdminConfigKeys(
      req.body,
      [...WEATHER_CONFIG_KEYS],
      ["weather_api_key"],
      req.userId,
    );
    res.json({ success: true, message: "Weather API settings updated" });
  } catch (error) {
    console.error("Error updating weather settings:", error);
    res.status(500).json({ error: "Failed to update weather settings" });
  }
});

router.post("/api/admin/weather-settings/test", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const apiKey = await loadWeatherApiKey();
    if (!apiKey) {
      return res.status(400).json({ error: "Weather API is not configured. Save your API key first." });
    }

    const testQuery = (req.body?.query as string)?.trim() || "90210";
    const url = new URL("https://api.weatherapi.com/v1/forecast.json");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", testQuery);
    url.searchParams.set("days", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(502).json({ error: "Weather API returned an error. Check your key." });
    }

    const data = await response.json();
    res.json({
      success: true,
      message: "Weather API connection successful",
      data: {
        location: data.location?.name,
        temp_f: data.current?.temp_f,
        condition: data.current?.condition?.text,
      },
    });
  } catch (error: any) {
    console.error("Error testing weather API:", error);
    res.status(500).json({ error: error?.message || "Failed to test weather API" });
  }
});

// ==================== STRIPE SETTINGS ====================

router.get("/api/admin/stripe-settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const settings = await loadAdminConfigKeys([...STRIPE_CONFIG_KEYS]);
    const hasDbSecret = Boolean(settings.stripe_secret_key);
    const hasEnvSecret = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

    res.json({
      stripe_secret_key: maskSecret(settings.stripe_secret_key, hasDbSecret),
      stripe_publishable_key: settings.stripe_publishable_key || process.env.STRIPE_PUBLISHABLE_KEY || "",
      stripe_webhook_secret: maskSecret(settings.stripe_webhook_secret, Boolean(settings.stripe_webhook_secret)),
      stripe_monthly_price_id:
        settings.stripe_monthly_price_id || process.env.STRIPE_MONTHLY_PRICE_ID || "",
      stripe_yearly_price_id:
        settings.stripe_yearly_price_id || process.env.STRIPE_YEARLY_PRICE_ID || "",
      configured: hasDbSecret || hasEnvSecret,
      source: configSource(hasDbSecret, hasEnvSecret),
    });
  } catch (error) {
    console.error("Error fetching Stripe settings:", error);
    res.status(500).json({ error: "Failed to fetch Stripe settings" });
  }
});

router.put("/api/admin/stripe-settings", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    await saveAdminConfigKeys(
      req.body,
      [...STRIPE_CONFIG_KEYS],
      [...STRIPE_SECRET_KEYS],
      req.userId,
    );
    res.json({ success: true, message: "Stripe settings updated" });
  } catch (error) {
    console.error("Error updating Stripe settings:", error);
    res.status(500).json({ error: "Failed to update Stripe settings" });
  }
});

router.post("/api/admin/stripe-settings/test", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    if (!stripe) {
      return res.status(400).json({ error: "Stripe is not configured. Save your secret and publishable keys first." });
    }

    const balance = await stripe.balance.retrieve();
    res.json({
      success: true,
      message: "Stripe connection successful",
      data: {
        livemode: balance.livemode,
        currency: balance.available?.[0]?.currency,
      },
    });
  } catch (error: any) {
    console.error("Error testing Stripe:", error);
    res.status(500).json({ error: error?.message || "Failed to test Stripe connection" });
  }
});

// Send a test email to verify SMTP settings
router.post("/api/admin/email-settings/test", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!(await isEmailConfigured())) {
      return res.status(400).json({ error: "SMTP is not configured. Save your settings first." });
    }

    const [admin] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    const to = (req.body?.to as string) || admin?.email;
    if (!to) {
      return res.status(400).json({ error: "No recipient email available" });
    }

    await verifySmtpConnection();
    await sendEmail({
      to,
      subject: "Lawncare Workshop SMTP test",
      text: "This is a test email confirming your SMTP settings are working.",
      html: "<p>This is a test email confirming your SMTP settings are working. 🌱</p>",
    });

    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: error?.message || "Failed to send test email" });
  }
});

// ==================== REVENUECAT WEBHOOK ====================
// Configure in RevenueCat dashboard: Project Settings → Integrations → Webhooks
//   URL:           https://<your-domain>/api/webhooks/revenuecat
//   Authorization: Bearer <value of REVENUECAT_WEBHOOK_AUTH env var>
//
// The Flutter app calls Purchases.logIn(userId) with the numeric users.id,
// so RevenueCat's event.app_user_id maps directly to users.id.
router.post("/api/webhooks/revenuecat", async (req, res) => {
  try {
    // Token resolution: env var > admin-panel setting. If neither is configured,
    // REJECT the webhook — accepting unauthenticated state-changing events would
    // let anyone forge subscription grants/revokes.
    let expectedAuth: string | undefined = process.env.REVENUECAT_WEBHOOK_AUTH;
    if (!expectedAuth) {
      const dbSettings = await getOrCreateRevenuecatSettings();
      if (dbSettings?.webhookAuthToken) expectedAuth = dbSettings.webhookAuthToken;
    }
    if (!expectedAuth) {
      console.warn("[RevenueCat] Webhook rejected: no auth token configured (set REVENUECAT_WEBHOOK_AUTH env or configure in /admin/revenuecat)");
      return res.status(503).json({ error: "Webhook not configured" });
    }
    const provided = req.headers.authorization || "";
    const expected = `Bearer ${expectedAuth}`;
    if (provided !== expected) {
      console.warn("[RevenueCat] Webhook rejected: bad Authorization header");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.body?.event;
    if (!event || !event.type) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const eventType: string = event.type;
    const appUserId: string | undefined = event.app_user_id || event.original_app_user_id;
    const productId: string | undefined = event.product_id;
    const transactionId: string | undefined = event.transaction_id || event.original_transaction_id;
    const store: string = (event.store || "").toLowerCase(); // "APP_STORE" | "PLAY_STORE" | ...
    const platform = store.includes("play") ? "android" : store.includes("app") ? "ios" : "unknown";
    const expirationMs: number | undefined = event.expiration_at_ms;
    const expiresAt = expirationMs ? new Date(expirationMs) : null;

    console.log(`[RevenueCat] Event ${eventType} for app_user_id=${appUserId} product=${productId} expires=${expiresAt?.toISOString() ?? "n/a"}`);

    // Ignore alias/transfer events that don't carry a subscription state change
    if (eventType === "SUBSCRIBER_ALIAS" || eventType === "TRANSFER" || eventType === "TEST") {
      return res.json({ received: true, ignored: eventType });
    }

    if (!appUserId) {
      console.warn("[RevenueCat] Missing app_user_id — cannot map to a user");
      return res.status(200).json({ received: true, warning: "missing app_user_id" });
    }

    const userIdNum = parseInt(appUserId, 10);
    if (!Number.isFinite(userIdNum)) {
      console.warn(`[RevenueCat] app_user_id "${appUserId}" is not a numeric users.id — anonymous user, skipping`);
      return res.status(200).json({ received: true, warning: "non-numeric app_user_id" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userIdNum));
    if (!user) {
      console.warn(`[RevenueCat] No user with id=${userIdNum}`);
      return res.status(200).json({ received: true, warning: "user not found" });
    }

    // Look up the matching plan (by Apple or Google product id) to record slug
    let planSlug: string | null = null;
    if (productId) {
      const plan = await db.select().from(subscriptionPlans)
        .where(or(eq(subscriptionPlans.appleProductId, productId), eq(subscriptionPlans.googleProductId, productId)))
        .limit(1);
      if (plan.length > 0) planSlug = plan[0].slug;
    }

    // Events that grant / extend premium access
    const grantEvents = new Set([
      "INITIAL_PURCHASE",
      "RENEWAL",
      "PRODUCT_CHANGE",
      "UNCANCELLATION",
      "NON_RENEWING_PURCHASE",
      "TEMPORARY_ENTITLEMENT_GRANT",
    ]);

    // Events that revoke premium access immediately
    const revokeEvents = new Set([
      "EXPIRATION",
      "SUBSCRIPTION_PAUSED",
      "REFUND",
    ]);

    if (grantEvents.has(eventType)) {
      await db.update(users)
        .set({
          subscriptionStatus: "premium",
          subscriptionPlan: planSlug ?? user.subscriptionPlan,
          subscriptionExpiresAt: expiresAt ?? user.subscriptionExpiresAt,
        })
        .where(eq(users.id, userIdNum));
      console.log(`[RevenueCat] User ${userIdNum} → premium (plan=${planSlug ?? user.subscriptionPlan}, expires=${expiresAt?.toISOString() ?? "unchanged"})`);
    } else if (revokeEvents.has(eventType)) {
      await db.update(users)
        .set({
          subscriptionStatus: "free",
          subscriptionPlan: null,
          subscriptionExpiresAt: null,
        })
        .where(eq(users.id, userIdNum));
      console.log(`[RevenueCat] User ${userIdNum} → free (${eventType})`);
    } else if (eventType === "CANCELLATION") {
      // User cancelled auto-renew but keeps access until expiration_at_ms.
      // Update the expiration so the lazy check in /api/subscription/status downgrades them on time.
      if (expiresAt) {
        await db.update(users)
          .set({ subscriptionExpiresAt: expiresAt })
          .where(eq(users.id, userIdNum));
      }
      console.log(`[RevenueCat] User ${userIdNum} cancelled — access until ${expiresAt?.toISOString() ?? "unchanged"}`);
    } else if (eventType === "BILLING_ISSUE") {
      console.log(`[RevenueCat] User ${userIdNum} billing issue — keeping access until expiration`);
    } else {
      console.log(`[RevenueCat] Unhandled event type: ${eventType}`);
    }

    // Record the transaction for audit
    if (transactionId && productId) {
      try {
        const [existing] = await db.select().from(inAppPurchases)
          .where(eq(inAppPurchases.transactionId, transactionId));
        if (existing) {
          await db.update(inAppPurchases)
            .set({
              status: revokeEvents.has(eventType) ? "expired" : "verified",
              verifiedAt: new Date(),
              expiresAt: expiresAt ?? existing.expiresAt,
            })
            .where(eq(inAppPurchases.id, existing.id));
        } else {
          await db.insert(inAppPurchases).values({
            userId: userIdNum,
            platform,
            productId,
            transactionId,
            receiptData: JSON.stringify({ source: "revenuecat", eventType, raw: event }),
            status: revokeEvents.has(eventType) ? "expired" : "verified",
            verifiedAt: new Date(),
            expiresAt,
          });
        }
      } catch (logErr) {
        console.warn("[RevenueCat] Failed to record purchase row:", logErr);
      }
    }

    res.json({ received: true, eventType, userId: userIdNum });
  } catch (error) {
    console.error("[RevenueCat] Webhook error:", error);
    // Return 200 so RevenueCat doesn't keep retrying on permanent failures;
    // logs above capture the issue for manual review.
    res.status(200).json({ received: true, error: "internal error (see server logs)" });
  }
});

// ==================== NOTIFICATIONS SETTINGS / LOGS / TEST ====================

async function getOrCreateNotificationSettings() {
  const [existing] = await db.select().from(notificationSettings).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(notificationSettings).values({}).returning();
  return created;
}

router.get("/api/admin/notifications/settings", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const settings = await getOrCreateNotificationSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error getting notification settings:", error);
    res.status(500).json({ error: "Failed to get notification settings" });
  }
});

router.patch("/api/admin/notifications/settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const current = await getOrCreateNotificationSettings();
    const { id, createdAt, updatedAt, ...patch } = req.body || {};
    const [updated] = await db.update(notificationSettings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(notificationSettings.id, current.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

router.get("/api/admin/notifications/logs", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const logs = await db.select().from(notificationLogs)
      .orderBy(desc(notificationLogs.createdAt))
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error getting notification logs:", error);
    res.status(500).json({ error: "Failed to get notification logs" });
  }
});

router.post("/api/admin/notifications/test", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { type, recipient, message } = req.body || {};
    if (!type || !recipient) {
      return res.status(400).json({ error: "type and recipient are required" });
    }
    const channel = type === "email" ? "email" : type === "sms" ? "sms" : "push";
    console.log(`[Notification Test] channel=${channel} to=${recipient} message=${message}`);
    const [log] = await db.insert(notificationLogs).values({
      type: "test",
      channel,
      recipient,
      subject: "Test Notification",
      message: message || "",
      status: "sent",
    }).returning();
    res.json({ success: true, log });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: "Failed to send test notification" });
  }
});

// ==================== TAX RATES ====================

router.get("/api/admin/tax/rates", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const rates = await db.select().from(taxRates).orderBy(desc(taxRates.createdAt));
    res.json(rates);
  } catch (error) {
    console.error("Error getting tax rates:", error);
    res.status(500).json({ error: "Failed to get tax rates" });
  }
});

router.post("/api/admin/tax/rates", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertTaxRateSchema.parse(req.body);
    const [rate] = await db.insert(taxRates).values(data).returning();
    res.json(rate);
  } catch (error) {
    console.error("Error creating tax rate:", error);
    res.status(500).json({ error: "Failed to create tax rate" });
  }
});

router.patch("/api/admin/tax/rates/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
    const { id: _i, createdAt, ...patch } = req.body || {};
    const [rate] = await db.update(taxRates).set(patch).where(eq(taxRates.id, id)).returning();
    res.json(rate);
  } catch (error) {
    console.error("Error updating tax rate:", error);
    res.status(500).json({ error: "Failed to update tax rate" });
  }
});

router.delete("/api/admin/tax/rates/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
    await db.delete(taxRates).where(eq(taxRates.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting tax rate:", error);
    res.status(500).json({ error: "Failed to delete tax rate" });
  }
});

// ==================== COMPLIANCE SETTINGS ====================

async function getOrCreateComplianceSettings() {
  const [existing] = await db.select().from(complianceSettings).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(complianceSettings).values({}).returning();
  return created;
}

router.get("/api/admin/compliance", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const settings = await getOrCreateComplianceSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error getting compliance settings:", error);
    res.status(500).json({ error: "Failed to get compliance settings" });
  }
});

router.patch("/api/admin/compliance", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const current = await getOrCreateComplianceSettings();
    const { id, createdAt, updatedAt, ...patch } = req.body || {};
    const [updated] = await db.update(complianceSettings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(complianceSettings.id, current.id))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error updating compliance settings:", error);
    res.status(500).json({ error: "Failed to update compliance settings" });
  }
});

// ==================== DELIVERY PARTNERS ====================

router.get("/api/admin/delivery-partners", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const partners = await db.select().from(deliveryPartners).orderBy(desc(deliveryPartners.createdAt));
    res.json(partners);
  } catch (error) {
    console.error("Error getting delivery partners:", error);
    res.status(500).json({ error: "Failed to get delivery partners" });
  }
});

router.post("/api/admin/delivery-partners", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = insertDeliveryPartnerSchema.parse(req.body);
    const [partner] = await db.insert(deliveryPartners).values(data).returning();
    res.json(partner);
  } catch (error) {
    console.error("Error creating delivery partner:", error);
    res.status(500).json({ error: "Failed to create delivery partner" });
  }
});

router.patch("/api/admin/delivery-partners/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
    const { id: _i, createdAt, ...patch } = req.body || {};
    const [partner] = await db.update(deliveryPartners).set(patch).where(eq(deliveryPartners.id, id)).returning();
    res.json(partner);
  } catch (error) {
    console.error("Error updating delivery partner:", error);
    res.status(500).json({ error: "Failed to update delivery partner" });
  }
});

router.delete("/api/admin/delivery-partners/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
    await db.delete(deliveryPartners).where(eq(deliveryPartners.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting delivery partner:", error);
    res.status(500).json({ error: "Failed to delete delivery partner" });
  }
});

// ==================== REVENUECAT SETTINGS ====================

// Settings is a singleton row, always id=1. Using a fixed id + ON CONFLICT DO NOTHING
// guarantees deterministic reads even under concurrent first-time access.
const REVENUECAT_SETTINGS_ID = 1;

async function getOrCreateRevenuecatSettings() {
  const [existing] = await db.select().from(revenuecatSettings)
    .where(eq(revenuecatSettings.id, REVENUECAT_SETTINGS_ID));
  if (existing) return existing;
  await db.insert(revenuecatSettings)
    .values({ id: REVENUECAT_SETTINGS_ID })
    .onConflictDoNothing();
  const [row] = await db.select().from(revenuecatSettings)
    .where(eq(revenuecatSettings.id, REVENUECAT_SETTINGS_ID));
  return row;
}

const revenuecatSettingsPatchSchema = z.object({
  enabled: z.boolean().optional(),
  iosApiKey: z.string().max(500).optional(),
  androidApiKey: z.string().max(500).optional(),
  webApiKey: z.string().max(500).optional(),
  webhookAuthToken: z.string().max(500).optional(),
  secretApiKey: z.string().max(500).optional(),
  projectId: z.string().max(255).optional(),
  entitlementId: z.string().max(255).optional(),
  monthlyProductId: z.string().max(255).optional(),
  yearlyProductId: z.string().max(255).optional(),
});

// Public — returns only the keys mobile/web apps need at runtime. No secret API key.
router.get("/api/revenuecat/config", async (_req, res) => {
  try {
    const s = await getOrCreateRevenuecatSettings();
    res.json({
      enabled: !!s.enabled,
      iosApiKey: s.iosApiKey || "",
      androidApiKey: s.androidApiKey || "",
      webApiKey: s.webApiKey || "",
      entitlementId: s.entitlementId || "premium",
      monthlyProductId: s.monthlyProductId || "",
      yearlyProductId: s.yearlyProductId || "",
    });
  } catch (error) {
    console.error("Error getting public RevenueCat config:", error);
    res.status(500).json({ error: "Failed to get RevenueCat config" });
  }
});

router.get("/api/admin/revenuecat/settings", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const settings = await getOrCreateRevenuecatSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error getting RevenueCat settings:", error);
    res.status(500).json({ error: "Failed to get RevenueCat settings" });
  }
});

router.put("/api/admin/revenuecat/settings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await getOrCreateRevenuecatSettings();
    const parsed = revenuecatSettingsPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid settings", details: parsed.error.issues });
    }
    const [updated] = await db.update(revenuecatSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(revenuecatSettings.id, REVENUECAT_SETTINGS_ID))
      .returning();
    res.json(updated);
  } catch (error) {
    console.error("Error updating RevenueCat settings:", error);
    res.status(500).json({ error: "Failed to update RevenueCat settings" });
  }
});

// Quick connectivity test: ping RevenueCat REST API with the saved secret key.
router.post("/api/admin/revenuecat/test", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const s = await getOrCreateRevenuecatSettings();
    if (!s.secretApiKey) {
      return res.status(400).json({ ok: false, error: "Secret API key not configured" });
    }
    if (!s.projectId) {
      return res.status(400).json({ ok: false, error: "Project ID not configured" });
    }
    const url = `https://api.revenuecat.com/v2/projects/${encodeURIComponent(s.projectId)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${s.secretApiKey}`, Accept: "application/json" } });
    const body = await r.text();
    if (!r.ok) {
      return res.status(200).json({ ok: false, status: r.status, error: body.slice(0, 500) });
    }
    let project: any = null;
    try { project = JSON.parse(body); } catch {}
    res.json({ ok: true, status: r.status, projectName: project?.name ?? project?.id ?? "(no name)" });
  } catch (error: any) {
    console.error("Error testing RevenueCat:", error);
    res.status(500).json({ ok: false, error: error?.message || "Test failed" });
  }
});

// ==================== WEATHER & SOIL TEMP (web + mobile parity) ====================

async function resolveWeatherQuery(query: { lat?: string; lng?: string; zip?: string }) {
  if (query.lat && query.lng) return `${query.lat},${query.lng}`;
  if (query.zip) return query.zip;
  return null;
}

router.get("/api/weather", async (req, res) => {
  try {
    const q = await resolveWeatherQuery({
      lat: req.query.lat as string | undefined,
      lng: req.query.lng as string | undefined,
      zip: req.query.zip as string | undefined,
    });
    if (!q) return res.status(400).json({ error: "lat/lng or zip is required" });

    const apiKey = await loadWeatherApiKey();
    if (!apiKey) {
      return res.status(503).json({ error: "Weather API is not configured. Add your key in Admin → Integrations." });
    }
    const url = new URL("https://api.weatherapi.com/v1/forecast.json");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", q);
    url.searchParams.set("days", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch weather" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Weather proxy error:", error);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

router.get("/api/soil-temp", async (req, res) => {
  try {
    let lat = req.query.lat ? Number(req.query.lat) : undefined;
    let lng = req.query.lng ? Number(req.query.lng) : undefined;
    const zip = req.query.zip as string | undefined;

    if ((!lat || !lng) && zip) {
      const apiKey = await loadWeatherApiKey();
      if (!apiKey) {
        return res.status(503).json({ error: "Weather API is not configured" });
      }
      const geoResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(zip)}&days=1`,
      );
      if (geoResponse.ok) {
        const geo = await geoResponse.json();
        lat = geo?.location?.lat;
        lng = geo?.location?.lon;
      }
    }

    if (!lat || !lng || Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "lat/lng or zip is required" });
    }

    const now = new Date();
    const startDate = now.toISOString().split("T")[0];
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    const endDate = end.toISOString().split("T")[0];

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("hourly", "soil_temperature_6cm");
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch soil temperature" });
    }

    const data = await response.json();
    const hourly = data?.hourly?.soil_temperature_6cm as number[] | undefined;
    const currentSoilTemp = hourly?.[0] ?? null;
    const avgSoilTemp =
      hourly && hourly.length > 0
        ? hourly.reduce((sum, value) => sum + value, 0) / hourly.length
        : null;

    res.json({
      currentSoilTemp,
      avgSoilTemp,
      hourly: data.hourly,
    });
  } catch (error) {
    console.error("Soil temp proxy error:", error);
    res.status(500).json({ error: "Failed to fetch soil temperature" });
  }
});

router.get("/api/user/my-content", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const posts = await db
      .select({
        id: forumPosts.id,
        content: forumPosts.content,
        imageUrls: forumPosts.imageUrls,
        mediaUrl: forumPosts.mediaUrl,
        likesCount: forumPosts.likesCount,
        commentsCount: forumPosts.commentsCount,
        createdAt: forumPosts.createdAt,
      })
      .from(forumPosts)
      .where(eq(forumPosts.userId, userId))
      .orderBy(desc(forumPosts.createdAt));

    const entries = await db
      .select({
        entry: competitionEntries,
        competition: { id: competitions.id, title: competitions.title },
      })
      .from(competitionEntries)
      .leftJoin(competitions, eq(competitionEntries.competitionId, competitions.id))
      .where(eq(competitionEntries.userId, userId))
      .orderBy(desc(competitionEntries.createdAt));

    res.json({
      status: true,
      data: {
        forumPosts: posts,
        contestEntries: entries.map((row) => ({
          ...row.entry,
          competitionTitle: row.competition?.title,
        })),
      },
    });
  } catch (error) {
    console.error("My content error:", error);
    res.status(500).json({ status: false, error: "Failed to load your content" });
  }
});

export default router;
