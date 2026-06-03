import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { seedDatabaseIfEmpty } from "../server/seed";

async function resetDatabase() {
  console.log("⚠️  WARNING: This will delete all data and reseed the database!");
  console.log("Proceeding in 3 seconds...\n");
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("Clearing database tables...\n");
  
  const tablesToClear = [
    "votes",
    "competition_entries", 
    "competitions",
    "support_messages",
    "support_tickets",
    "chat_messages",
    "expert_questions",
    "forum_comments",
    "forum_likes",
    "forum_posts",
    "lawn_diagnoses",
    "lesson_progress",
    "notifications",
    "user_devices",
    "subscriptions",
    "lawn_profiles",
    "favorites",
    "direct_messages",
    "conversations",
    "calendar_events",
    "lawn_calendars",
    "self_diagnosis_flows",
    "lawn_library_ebooks",
    "privacy_content",
    "static_pages",
    "home_content_items",
    "banners",
    "blog_posts",
    "faqs",
    "testimonials",
    "deals",
    "lawn_care_plans",
    "video_lessons",
    "grass_types",
    "site_settings",
    "subscription_plans",
    "users"
  ];

  for (const table of tablesToClear) {
    try {
      await db.execute(sql.raw(`DELETE FROM ${table}`));
      console.log(`✓ Cleared ${table}`);
    } catch (error) {
      console.log(`⚠ Skipped ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log("\nReseeding database...\n");
  
  await seedDatabaseIfEmpty();
  
  console.log("\n✅ Database reset complete!");
  process.exit(0);
}

resetDatabase().catch(console.error);
