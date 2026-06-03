import { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean, real, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS & AUTH ====================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  zipCode: varchar("zip_code", { length: 20 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("free"),
  subscriptionPlan: varchar("subscription_plan", { length: 20 }),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  isNotificationEnabled: boolean("is_notification_enabled").default(true),
  isBanned: boolean("is_banned").default(false),
  bannedReason: text("banned_reason"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ==================== LAWN PROFILES ====================

export const lawnProfiles = pgTable("lawn_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lawnName: varchar("lawn_name", { length: 100 }).default("My Lawn"),
  grassType: varchar("grass_type", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }),
  lawnSize: varchar("lawn_size", { length: 50 }),
  sunExposure: varchar("sun_exposure", { length: 50 }),
  soilType: varchar("soil_type", { length: 50 }),
  irrigationType: varchar("irrigation_type", { length: 50 }),
  mainGoals: text("main_goals"),
  problemAreas: text("problem_areas"),
  lastMowingDate: date("last_mowing_date"),
  lastFertilizingDate: date("last_fertilizing_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLawnProfileSchema = createInsertSchema(lawnProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLawnProfile = z.infer<typeof insertLawnProfileSchema>;
export type LawnProfile = typeof lawnProfiles.$inferSelect;

// ==================== GRASS TYPES ====================

export const grassTypes = pgTable("grass_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  idealTemperature: varchar("ideal_temperature", { length: 50 }),
  waterNeeds: varchar("water_needs", { length: 50 }),
  sunRequirements: varchar("sun_requirements", { length: 50 }),
  maintenanceLevel: varchar("maintenance_level", { length: 50 }),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGrassTypeSchema = createInsertSchema(grassTypes).omit({ id: true, createdAt: true });
export type InsertGrassType = z.infer<typeof insertGrassTypeSchema>;
export type GrassType = typeof grassTypes.$inferSelect;

// ==================== LAWN CARE PLANS ====================

export const lawnCarePlans = pgTable("lawn_care_plans", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  grassType: varchar("grass_type", { length: 100 }),
  region: varchar("region", { length: 100 }),
  season: varchar("season", { length: 50 }).notNull(),
  month: integer("month"),
  weekNumber: integer("week_number"),
  taskType: varchar("task_type", { length: 50 }).notNull(),
  instructions: text("instructions").notNull(),
  tips: text("tips"),
  products: text("products"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  isPremium: boolean("is_premium").default(false),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLawnCarePlanSchema = createInsertSchema(lawnCarePlans).omit({ id: true, createdAt: true });
export type InsertLawnCarePlan = z.infer<typeof insertLawnCarePlanSchema>;
export type LawnCarePlan = typeof lawnCarePlans.$inferSelect;

// ==================== VIDEO LESSONS ====================

export const videoLessons = pgTable("video_lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).default("beginner"),
  instructor: varchar("instructor", { length: 100 }).default("TurfguyRoss"),
  isPinned: boolean("is_pinned").default(false),
  isPremium: boolean("is_premium").default(false),
  viewCount: integer("view_count").default(0),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoLessonSchema = createInsertSchema(videoLessons).omit({ id: true, createdAt: true });
export type InsertVideoLesson = z.infer<typeof insertVideoLessonSchema>;
export type VideoLesson = typeof videoLessons.$inferSelect;

// ==================== LESSON PROGRESS ====================

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => videoLessons.id).notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  lastWatchedAt: timestamp("last_watched_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({ id: true, createdAt: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

// ==================== LAWN DIAGNOSES ====================

export const lawnDiagnoses = pgTable("lawn_diagnoses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  problemType: varchar("problem_type", { length: 100 }),
  severity: varchar("severity", { length: 50 }),
  diagnosis: text("diagnosis"),
  recommendations: text("recommendations"),
  products: text("products"),
  status: varchar("status", { length: 50 }).default("pending"),
  aiConfidence: real("ai_confidence"),
  expertReview: text("expert_review"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLawnDiagnosisSchema = createInsertSchema(lawnDiagnoses).omit({ id: true, createdAt: true });
export type InsertLawnDiagnosis = z.infer<typeof insertLawnDiagnosisSchema>;
export type LawnDiagnosis = typeof lawnDiagnoses.$inferSelect;

// ==================== DEALS & PRODUCTS ====================

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer("discount_percent"),
  image: text("image"),
  store: varchar("store", { length: 100 }).notNull(),
  storeUrl: text("store_url"),
  affiliateLink: text("affiliate_link"),
  category: varchar("category", { length: 100 }),
  couponCode: varchar("coupon_code", { length: 50 }),
  startDate: timestamp("start_date"),
  expiresAt: timestamp("expires_at"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

// ==================== COMPETITIONS ====================

export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  rules: text("rules"),
  prize: text("prize"),
  prizeImageUrl: text("prize_image_url"),
  month: varchar("month", { length: 50 }),
  year: integer("year"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  votingEndsAt: timestamp("voting_ends_at"),
  status: varchar("status", { length: 50 }).default("upcoming"),
  winnerId: integer("winner_id").references(() => users.id),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetitionSchema = createInsertSchema(competitions).omit({ id: true, createdAt: true });
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type Competition = typeof competitions.$inferSelect;

// ==================== COMPETITION ENTRIES ====================

export const competitionEntries = pgTable("competition_entries", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").references(() => competitions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  beforeImageUrl: text("before_image_url"),
  votes: integer("votes").default(0),
  rank: integer("rank"),
  isWinner: boolean("is_winner").default(false),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetitionEntrySchema = createInsertSchema(competitionEntries).omit({ id: true, createdAt: true });
export type InsertCompetitionEntry = z.infer<typeof insertCompetitionEntrySchema>;
export type CompetitionEntry = typeof competitionEntries.$inferSelect;

// ==================== VOTES ====================

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  entryId: integer("entry_id").references(() => competitionEntries.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, createdAt: true });
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// ==================== EXPERT Q&A ====================

export const expertQuestions = pgTable("expert_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  question: text("question").notNull(),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  answer: text("answer"),
  answeredBy: integer("answered_by").references(() => users.id),
  answeredAt: timestamp("answered_at"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpertQuestionSchema = createInsertSchema(expertQuestions).omit({ id: true, createdAt: true });
export type InsertExpertQuestion = z.infer<typeof insertExpertQuestionSchema>;
export type ExpertQuestion = typeof expertQuestions.$inferSelect;

// ==================== SUBSCRIPTIONS ====================

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// ==================== TESTIMONIALS ====================

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }),
  avatar: text("avatar"),
  rating: integer("rating").default(5),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  beforeImage: text("before_image"),
  afterImage: text("after_image"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// ==================== FAQ ====================

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true });
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// ==================== BLOG POSTS ====================

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  image: text("image"),
  category: varchar("category", { length: 100 }),
  author: varchar("author", { length: 100 }).default("TurfguyRoss"),
  tags: text("tags"),
  viewCount: integer("view_count").default(0),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// ==================== NOTIFICATIONS ====================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info"),
  link: text("link"),
  imageUrl: text("image_url"),
  isRead: boolean("is_read").default(false),
  isGlobal: boolean("is_global").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ==================== WEATHER CACHE ====================

export const weatherCache = pgTable("weather_cache", {
  id: serial("id").primaryKey(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  temperature: real("temperature"),
  soilTemperature: real("soil_temperature"),
  humidity: real("humidity"),
  conditions: varchar("conditions", { length: 100 }),
  icon: varchar("icon", { length: 50 }),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertWeatherCacheSchema = createInsertSchema(weatherCache).omit({ id: true });
export type InsertWeatherCache = z.infer<typeof insertWeatherCacheSchema>;
export type WeatherCache = typeof weatherCache.$inferSelect;

// ==================== SITE SETTINGS ====================

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 100 }).default("Lawncare Workshop"),
  tagline: varchar("tagline", { length: 255 }).default("Professional lawncare guidance"),
  logo: text("logo"),
  heroTitle: text("hero_title").default("Master Your Lawn With Confidence"),
  heroSubtitle: text("hero_subtitle").default("Professional lawn care guidance built for cool-season lawns"),
  heroImage: text("hero_image"),
  primaryColor: varchar("primary_color", { length: 50 }).default("#22c55e"),
  secondaryColor: varchar("secondary_color", { length: 50 }).default("#16a34a"),
  contactEmail: varchar("contact_email", { length: 255 }),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialYoutube: text("social_youtube"),
  socialTwitter: text("social_twitter"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).default("9.99"),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }).default("89.99"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// ==================== ACTIVITY LOG ====================

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

// ==================== STATIC PAGES (CMS) ====================

export const staticPages = pgTable("static_pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaticPageSchema = createInsertSchema(staticPages).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStaticPage = z.infer<typeof insertStaticPageSchema>;
export type StaticPage = typeof staticPages.$inferSelect;

// ==================== PRIVACY CONTENT ====================

export const privacyContent = pgTable("privacy_content", {
  id: serial("id").primaryKey(),
  heading: varchar("heading", { length: 255 }).notNull(),
  text: text("text").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPrivacyContentSchema = createInsertSchema(privacyContent).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrivacyContent = z.infer<typeof insertPrivacyContentSchema>;
export type PrivacyContent = typeof privacyContent.$inferSelect;

// ==================== HOME BANNERS ====================

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  redirectUrl: text("redirect_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

// ==================== LIBRARY CATEGORIES ====================

export const libraryCategories = pgTable("library_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLibraryCategorySchema = createInsertSchema(libraryCategories).omit({ id: true, createdAt: true });
export type InsertLibraryCategory = z.infer<typeof insertLibraryCategorySchema>;
export type LibraryCategory = typeof libraryCategories.$inferSelect;

// ==================== LIBRARY ITEMS ====================

export const libraryItems = pgTable("library_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => libraryCategories.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  contentHtml: text("content_html").notNull(),
  imageUrl: text("image_url"),
  isPremium: boolean("is_premium").default(false),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLibraryItemSchema = createInsertSchema(libraryItems).omit({ id: true, createdAt: true });
export type InsertLibraryItem = z.infer<typeof insertLibraryItemSchema>;
export type LibraryItem = typeof libraryItems.$inferSelect;

// ==================== USER FAVORITES ====================

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  itemId: integer("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// ==================== FORUM POSTS ====================

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postType: varchar("post_type", { length: 20 }).default("text"), // text, image, video
  content: text("content"),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: integer("duration_seconds"),
  imageUrls: text("image_urls"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  isApproved: boolean("is_approved").default(true),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true });
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

// ==================== FORUM COMMENTS ====================

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => forumPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({ id: true, createdAt: true });
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type ForumComment = typeof forumComments.$inferSelect;

// ==================== FORUM LIKES ====================

export const forumLikes = pgTable("forum_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => forumPosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumLikeSchema = createInsertSchema(forumLikes).omit({ id: true, createdAt: true });
export type InsertForumLike = z.infer<typeof insertForumLikeSchema>;
export type ForumLike = typeof forumLikes.$inferSelect;

// ==================== USER DEVICES (FCM) ====================

export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fcmToken: text("fcm_token").notNull(),
  deviceType: varchar("device_type", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserDeviceSchema = createInsertSchema(userDevices).omit({ id: true, createdAt: true });
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type UserDevice = typeof userDevices.$inferSelect;

// ==================== PUSH NOTIFICATIONS LOG ====================

export const pushNotifications = pgTable("push_notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  actionUrl: text("action_url"),
  actionType: varchar("action_type", { length: 50 }),
  targetType: varchar("target_type", { length: 50 }).default("all"),
  targetUserIds: text("target_user_ids"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  sentBy: integer("sent_by").references(() => users.id),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPushNotificationSchema = createInsertSchema(pushNotifications).omit({ id: true, createdAt: true });
export type InsertPushNotification = z.infer<typeof insertPushNotificationSchema>;
export type PushNotification = typeof pushNotifications.$inferSelect;

// ==================== ADMIN CONFIG ====================

export const adminConfigs = pgTable("admin_configs", {
  id: serial("id").primaryKey(),
  configKey: varchar("config_key", { length: 100 }).notNull().unique(),
  configValue: text("config_value"),
  configType: varchar("config_type", { length: 50 }).default("string"),
  description: text("description"),
  isSecret: boolean("is_secret").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertAdminConfigSchema = createInsertSchema(adminConfigs).omit({ id: true, updatedAt: true });
export type InsertAdminConfig = z.infer<typeof insertAdminConfigSchema>;
export type AdminConfig = typeof adminConfigs.$inferSelect;

// ==================== SUBSCRIPTION PLANS ====================

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  intervalType: varchar("interval_type", { length: 20 }).notNull(),
  intervalCount: integer("interval_count").default(1),
  trialDays: integer("trial_days").default(7),
  features: text("features"),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  appleProductId: varchar("apple_product_id", { length: 255 }),
  googleProductId: varchar("google_product_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// ==================== IN-APP PURCHASES ====================

export const inAppPurchases = pgTable("in_app_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  productId: varchar("product_id", { length: 255 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  receiptData: text("receipt_data"),
  status: varchar("status", { length: 50 }).default("pending"),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInAppPurchaseSchema = createInsertSchema(inAppPurchases).omit({ id: true, createdAt: true });
export type InsertInAppPurchase = z.infer<typeof insertInAppPurchaseSchema>;
export type InAppPurchase = typeof inAppPurchases.$inferSelect;

// ==================== SOCIAL AUTH PROVIDERS ====================

export const socialAuthProviders = pgTable("social_auth_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  providerEmail: varchar("provider_email", { length: 255 }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialAuthProviderSchema = createInsertSchema(socialAuthProviders).omit({ id: true, createdAt: true });
export type InsertSocialAuthProvider = z.infer<typeof insertSocialAuthProviderSchema>;
export type SocialAuthProvider = typeof socialAuthProviders.$inferSelect;

// ==================== HOME CONTENT ITEMS ====================

export const homeContentItems = pgTable("home_content_items", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 50 }).notNull(), // expert_corner, tips_tricks, equipments, fertilizer_herbicide, soil_water, insects_disease, products
  type: varchar("type", { length: 50 }).notNull(), // article, video, product
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  productLink: text("product_link"), // Link to external product page
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHomeContentItemSchema = createInsertSchema(homeContentItems).omit({ id: true, createdAt: true });
export type InsertHomeContentItem = z.infer<typeof insertHomeContentItemSchema>;
export type HomeContentItem = typeof homeContentItems.$inferSelect;

// ==================== LAWN CALENDARS ====================

export const lawnCalendars = pgTable("lawn_calendars", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  routeName: varchar("route_name", { length: 100 }),
  beginnerPdfUrl: text("beginner_pdf_url"),
  intermediatePdfUrl: text("intermediate_pdf_url"),
  advancedPdfUrl: text("advanced_pdf_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLawnCalendarSchema = createInsertSchema(lawnCalendars).omit({ id: true, createdAt: true });
export type InsertLawnCalendar = z.infer<typeof insertLawnCalendarSchema>;
export type LawnCalendar = typeof lawnCalendars.$inferSelect;

// ==================== CALENDAR EVENTS ====================

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  calendarId: integer("calendar_id").references(() => lawnCalendars.id).notNull(),
  header: varchar("header", { length: 255 }).notNull(),
  feature: text("feature"),
  eventDate: date("event_date").notNull(),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// ==================== SELF DIAGNOSIS FLOWS ====================

export const selfDiagnosisFlows = pgTable("self_diagnosis_flows", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  questions: text("questions").notNull(), // JSON string of questions array
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSelfDiagnosisFlowSchema = createInsertSchema(selfDiagnosisFlows).omit({ id: true, createdAt: true });
export type InsertSelfDiagnosisFlow = z.infer<typeof insertSelfDiagnosisFlowSchema>;
export type SelfDiagnosisFlow = typeof selfDiagnosisFlows.$inferSelect;

// ==================== LAWN LIBRARY EBOOKS ====================

export const lawnLibraryEbooks = pgTable("lawn_library_ebooks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  downloadUrl: text("download_url").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLawnLibraryEbookSchema = createInsertSchema(lawnLibraryEbooks).omit({ id: true, createdAt: true });
export type InsertLawnLibraryEbook = z.infer<typeof insertLawnLibraryEbookSchema>;
export type LawnLibraryEbook = typeof lawnLibraryEbooks.$inferSelect;

// ==================== CHAT MESSAGES (for Expert Q&A) ====================

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => expertQuestions.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // user, admin
  text: text("text"),
  imageUrl: text("image_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ==================== CONVERSATIONS (User-to-User Chat) ====================

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").references(() => users.id).notNull(),
  user2Id: integer("user2_id").references(() => users.id).notNull(),
  lastMessageId: integer("last_message_id"),
  lastMessageAt: timestamp("last_message_at"),
  user1Unread: integer("user1_unread").default(0),
  user2Unread: integer("user2_unread").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// ==================== DIRECT MESSAGES ====================

export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text").notNull(), // text, image, video, document
  content: text("content"), // text content or file description
  mediaUrl: text("media_url"), // URL for images, videos, documents
  thumbnailUrl: text("thumbnail_url"), // thumbnail for videos
  fileName: text("file_name"), // original file name for documents
  fileSize: integer("file_size"), // file size in bytes
  isRead: boolean("is_read").default(false),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ id: true, createdAt: true });
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;

// ==================== OTP SESSIONS ====================

export const otpSessions = pgTable("otp_sessions", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  otpCode: varchar("otp_code", { length: 10 }).notNull(),
  otpToken: varchar("otp_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpSessionSchema = createInsertSchema(otpSessions).omit({ id: true, createdAt: true });
export type InsertOtpSession = z.infer<typeof insertOtpSessionSchema>;
export type OtpSession = typeof otpSessions.$inferSelect;

// ==================== PASSWORD RESET OTPS ====================

export const passwordResetOtps = pgTable("password_reset_otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otpCode: varchar("otp_code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPasswordResetOtpSchema = createInsertSchema(passwordResetOtps).omit({ id: true, createdAt: true });
export type InsertPasswordResetOtp = z.infer<typeof insertPasswordResetOtpSchema>;
export type PasswordResetOtp = typeof passwordResetOtps.$inferSelect;

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many, one }) => ({
  lawnProfiles: many(lawnProfiles),
  lessonProgress: many(lessonProgress),
  diagnoses: many(lawnDiagnoses),
  competitionEntries: many(competitionEntries),
  questions: many(expertQuestions),
  subscriptions: many(subscriptions),
  notifications: many(notifications),
  votes: many(votes),
}));

export const lawnProfilesRelations = relations(lawnProfiles, ({ one }) => ({
  user: one(users, { fields: [lawnProfiles.userId], references: [users.id] }),
}));

export const videoLessonsRelations = relations(videoLessons, ({ many }) => ({
  progress: many(lessonProgress),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(videoLessons, { fields: [lessonProgress.lessonId], references: [videoLessons.id] }),
}));

export const competitionsRelations = relations(competitions, ({ many, one }) => ({
  entries: many(competitionEntries),
  winner: one(users, { fields: [competitions.winnerId], references: [users.id] }),
}));

export const competitionEntriesRelations = relations(competitionEntries, ({ one, many }) => ({
  competition: one(competitions, { fields: [competitionEntries.competitionId], references: [competitions.id] }),
  user: one(users, { fields: [competitionEntries.userId], references: [users.id] }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
  entry: one(competitionEntries, { fields: [votes.entryId], references: [competitionEntries.id] }),
}));

export const expertQuestionsRelations = relations(expertQuestions, ({ one }) => ({
  user: one(users, { fields: [expertQuestions.userId], references: [users.id] }),
  expert: one(users, { fields: [expertQuestions.answeredBy], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const lawnDiagnosesRelations = relations(lawnDiagnoses, ({ one }) => ({
  user: one(users, { fields: [lawnDiagnoses.userId], references: [users.id] }),
  reviewer: one(users, { fields: [lawnDiagnoses.reviewedBy], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// ==================== SUPPORT TICKETS (User-Admin Chat) ====================

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  status: varchar("status", { length: 20 }).default("open").notNull(), // open, in_progress, resolved, closed
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  assignedTo: integer("assigned_to").references(() => users.id), // admin user
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  userUnread: integer("user_unread").default(0),
  adminUnread: integer("admin_unread").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  senderType: varchar("sender_type", { length: 10 }).notNull(), // user or admin
  messageType: varchar("message_type", { length: 20 }).default("text").notNull(), // text, image, video, document
  content: text("content"),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({ id: true, createdAt: true });
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  assignedAdmin: one(users, { fields: [supportTickets.assignedTo], references: [users.id] }),
  messages: many(supportMessages),
}));

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportMessages.ticketId], references: [supportTickets.id] }),
  sender: one(users, { fields: [supportMessages.senderId], references: [users.id] }),
}));

// ==================== ADMIN WEB PUSH SUBSCRIPTIONS ====================

export const adminWebPushSubscriptions = pgTable("admin_web_push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fcmToken: text("fcm_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminWebPushSubscription = typeof adminWebPushSubscriptions.$inferSelect;

// ==================== NOTIFICATION SETTINGS ====================

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(false),
  smtpHost: varchar("smtp_host", { length: 255 }).default(""),
  smtpPort: integer("smtp_port").default(587),
  smtpUser: varchar("smtp_user", { length: 255 }).default(""),
  smtpPassword: text("smtp_password").default(""),
  smtpFrom: varchar("smtp_from", { length: 255 }).default(""),
  twilioAccountSid: text("twilio_account_sid").default(""),
  twilioAuthToken: text("twilio_auth_token").default(""),
  twilioPhoneNumber: varchar("twilio_phone_number", { length: 50 }).default(""),
  firebaseServerKey: text("firebase_server_key").default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NotificationSettings = typeof notificationSettings.$inferSelect;

export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  channel: varchar("channel", { length: 50 }).notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NotificationLog = typeof notificationLogs.$inferSelect;

// ==================== TAX & COMPLIANCE ====================

export const taxRates = pgTable("tax_rates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("GST"),
  rate: real("rate").notNull(),
  state: varchar("state", { length: 100 }).default(""),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaxRateSchema = createInsertSchema(taxRates).omit({ id: true, createdAt: true });
export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;
export type TaxRate = typeof taxRates.$inferSelect;

export const complianceSettings = pgTable("compliance_settings", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name", { length: 255 }).default(""),
  gstNumber: varchar("gst_number", { length: 50 }).default(""),
  panNumber: varchar("pan_number", { length: 50 }).default(""),
  tanNumber: varchar("tan_number", { length: 50 }).default(""),
  cinNumber: varchar("cin_number", { length: 50 }).default(""),
  address: text("address").default(""),
  city: varchar("city", { length: 100 }).default(""),
  state: varchar("state", { length: 100 }).default(""),
  pincode: varchar("pincode", { length: 20 }).default(""),
  phone: varchar("phone", { length: 50 }).default(""),
  email: varchar("email", { length: 255 }).default(""),
  enableGst: boolean("enable_gst").default(true),
  defaultTaxRate: real("default_tax_rate").default(18),
  taxInclusive: boolean("tax_inclusive").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ComplianceSettings = typeof complianceSettings.$inferSelect;

// ==================== DELIVERY PARTNERS ====================

export const deliveryPartners = pgTable("delivery_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 50 }).notNull(),
  vehicleNumber: varchar("vehicle_number", { length: 50 }).default(""),
  assignedAreas: text("assigned_areas").default(""),
  isActive: boolean("is_active").default(true),
  totalDeliveries: integer("total_deliveries").default(0),
  rating: real("rating").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliveryPartnerSchema = createInsertSchema(deliveryPartners).omit({ id: true, createdAt: true, totalDeliveries: true, rating: true });
export type InsertDeliveryPartner = z.infer<typeof insertDeliveryPartnerSchema>;
export type DeliveryPartner = typeof deliveryPartners.$inferSelect;

// ==================== REVENUECAT SETTINGS ====================

export const revenuecatSettings = pgTable("revenuecat_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").default(false),
  iosApiKey: text("ios_api_key").default(""),
  androidApiKey: text("android_api_key").default(""),
  webApiKey: text("web_api_key").default(""),
  webhookAuthToken: text("webhook_auth_token").default(""),
  secretApiKey: text("secret_api_key").default(""),
  projectId: varchar("project_id", { length: 255 }).default(""),
  entitlementId: varchar("entitlement_id", { length: 255 }).default("premium"),
  monthlyProductId: varchar("monthly_product_id", { length: 255 }).default(""),
  yearlyProductId: varchar("yearly_product_id", { length: 255 }).default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RevenuecatSettings = typeof revenuecatSettings.$inferSelect;
