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
}
