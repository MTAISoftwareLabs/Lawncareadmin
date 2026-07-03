import { db } from './db';
import { sql } from 'drizzle-orm';

export async function runSchemaMigrations(): Promise<void> {
  console.log('🔄 Running schema migrations...');
  
  try {
    await db.execute(sql`
      ALTER TABLE support_tickets 
      ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS user_unread INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_unread INTEGER DEFAULT 1
    `);
    console.log('✅ Support tickets schema updated');
  } catch (error: any) {
    if (!error.message?.includes('already exists')) {
      console.log('⚠️ Support tickets migration:', error.message);
    }
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_password_reset_otps_code ON password_reset_otps (otp_code)
    `);
    console.log('✅ Password reset OTP schema updated');
  } catch (error: any) {
    if (!error.message?.includes('already exists')) {
      console.log('⚠️ Password reset OTP migration:', error.message);
    }
  }

  console.log('✅ Schema migrations complete');

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_saved_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id VARCHAR(255) NOT NULL,
        section VARCHAR(100),
        payload JSONB NOT NULL DEFAULT '{}',
        saved_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, item_id)
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_saved_items_user ON user_saved_items (user_id)
    `);
    console.log('✅ User saved items schema updated');
  } catch (error: any) {
    if (!error.message?.includes('already exists')) {
      console.log('⚠️ User saved items migration:', error.message);
    }
  }

  try {
    await db.execute(sql`
      ALTER TABLE site_settings
      ADD COLUMN IF NOT EXISTS hero_image_2 TEXT,
      ADD COLUMN IF NOT EXISTS hero_button_text VARCHAR(100) DEFAULT 'Start Your 7-Day Free Trial',
      ADD COLUMN IF NOT EXISTS hero_badge_text VARCHAR(150) DEFAULT 'Built for Cool-Season Lawns',
      ADD COLUMN IF NOT EXISTS app_store_url TEXT,
      ADD COLUMN IF NOT EXISTS play_store_url TEXT
    `);
    console.log('✅ Site settings schema updated');
  } catch (error: any) {
    if (!error.message?.includes('already exists')) {
      console.log('⚠️ Site settings migration:', error.message);
    }
  }
}
