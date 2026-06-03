import { db } from "../server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function generateDatabaseDump() {
  console.log("Generating database dump...\n");
  
  const tables = [
    "users",
    "grass_types", 
    "video_lessons",
    "lawn_care_plans",
    "deals",
    "competitions",
    "competition_entries",
    "votes",
    "testimonials",
    "faqs",
    "blog_posts",
    "site_settings",
    "static_pages",
    "privacy_content",
    "banners",
    "home_content_items",
    "lawn_calendars",
    "calendar_events",
    "self_diagnosis_flows",
    "lawn_library_ebooks",
    "expert_questions",
    "chat_messages",
    "forum_posts",
    "forum_comments",
    "forum_likes",
    "support_tickets",
    "support_messages",
    "user_devices",
    "lawn_diagnoses",
    "notifications",
    "subscription_plans",
    "subscriptions"
  ];

  let dumpContent = `-- =============================================
-- Lawncare Workshop Database Dump
-- Generated: ${new Date().toISOString()}
-- =============================================

-- Note: This is a partial dump for development/testing
-- For full production backup, use pg_dump

`;

  for (const table of tables) {
    try {
      const result = await db.execute(sql.raw(`SELECT * FROM ${table} LIMIT 100`));
      // postgres-js returns rows as an array directly (not { rows: [...] }).
      const rows = Array.from(result as any) as Record<string, unknown>[];
      
      if (rows.length > 0) {
        dumpContent += `\n-- Table: ${table}\n`;
        dumpContent += `-- Rows: ${rows.length}\n`;
        
        const columns = Object.keys(rows[0]);
        
        for (const row of rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return "NULL";
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return String(val);
          });
          
          dumpContent += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT DO NOTHING;\n`;
        }
      }
    } catch (error) {
      console.log(`Skipping table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const outputPath = path.join(process.cwd(), "dump.sql");
  fs.writeFileSync(outputPath, dumpContent);
  console.log(`\nDump saved to: ${outputPath}`);
  console.log("Done!");
  
  process.exit(0);
}

generateDatabaseDump().catch(console.error);
