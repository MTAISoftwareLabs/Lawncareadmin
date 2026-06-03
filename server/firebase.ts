import admin from 'firebase-admin';
import { db } from './db';
import { adminConfigs } from '../shared/schema';
import { sql } from 'drizzle-orm';

let firebaseInitialized = false;
let lastFirebaseError: string | null = null;

export function getLastFirebaseError(): string | null {
  return lastFirebaseError;
}

// Tear down any existing Firebase app and initialize again. Use this after the
// admin uploads a new service account so the new credentials take effect
// without restarting the server (plain initializeFirebase() early-returns when
// an app already exists).
export async function reinitializeFirebase(): Promise<boolean> {
  try {
    await Promise.all(admin.apps.map((a) => a?.delete()));
  } catch (err: any) {
    console.error('🔥 Firebase: Error deleting existing app(s):', err?.message || err);
  }
  firebaseInitialized = false;
  return initializeFirebase();
}

export async function initializeFirebase(): Promise<boolean> {
  // Check if already initialized globally
  if (admin.apps.length > 0) {
    console.log('🔥 Firebase: Already initialized, reusing existing app');
    firebaseInitialized = true;
    lastFirebaseError = null;
    return true;
  }
  
  try {
    console.log('🔥 Firebase: Starting initialization...');
    
    // First, try to use admin_configs from database
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_configs'
      ) as exists
    `);
    
    let serviceAccount: any = null;
    
    // postgres-js returns rows as an array directly (not { rows: [...] }).
    if ((tableCheck as any)[0]?.exists) {
      console.log('🔥 Firebase: admin_configs table exists, fetching configs...');

      const configs = await db.select().from(adminConfigs)
        .where(sql`${adminConfigs.configKey} LIKE 'firebase_%'`);
      
      console.log(`🔥 Firebase: Found ${configs.length} firebase configs:`, configs.map(c => c.configKey));
      
      const serviceAccountConfig = configs.find(c => c.configKey === 'firebase_service_account');
      
      if (serviceAccountConfig?.configValue) {
        console.log('🔥 Firebase: Service account found in admin_configs, parsing JSON...');
        try {
          let raw = serviceAccountConfig.configValue.trim();
          // Some clients double-encode the JSON (store it as a quoted string).
          // Unwrap once if that happened so JSON.parse yields the object.
          if (raw.startsWith('"') && raw.endsWith('"')) {
            try {
              const unwrapped = JSON.parse(raw);
              if (typeof unwrapped === 'string') raw = unwrapped;
            } catch {
              /* fall through and parse as-is */
            }
          }
          serviceAccount = JSON.parse(raw);
        } catch (parseError) {
          console.error('🔥 Firebase: Invalid service account JSON in admin_configs:', parseError);
        }
      }
    }
    
    // Fallback to environment variables if no admin_configs
    if (!serviceAccount) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (projectId && clientEmail && privateKey) {
        console.log('🔥 Firebase: Using environment variables as fallback');
        serviceAccount = {
          type: 'service_account',
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        };
      }
    }
    
    if (!serviceAccount) {
      console.log('🔥 Firebase: No service account configured (neither admin_configs nor env vars)');
      lastFirebaseError = 'No Firebase service account configured. Upload the Service Account JSON in Firebase Config.';
      return false;
    }

    // Normalize escaped newlines in the private key. A correctly-formatted key
    // (real newlines) is unaffected; a key with literal "\n" sequences (common
    // when the JSON gets re-encoded) is repaired so cert() can parse the PEM.
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // Validate required fields up front so we can give a precise reason instead
    // of a generic "not configured" message.
    const missing = ['project_id', 'client_email', 'private_key']
      .filter((k) => !serviceAccount[k]);
    if (missing.length > 0) {
      console.error(`🔥 Firebase: Service account is missing required field(s): ${missing.join(', ')}`);
      lastFirebaseError = `Service account JSON is missing required field(s): ${missing.join(', ')}. Re-upload the file from Firebase Console.`;
      return false;
    }

    console.log('🔥 Firebase: Service account valid, project_id:', serviceAccount.project_id);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    firebaseInitialized = true;
    lastFirebaseError = null;
    console.log('🔥 Firebase Admin SDK initialized successfully for project:', serviceAccount.project_id);
    return true;
  } catch (error: any) {
    const reason = error?.message || String(error);
    console.error('🔥 Firebase initialization error:', reason);
    lastFirebaseError = /private key|PEM|DECODER/i.test(reason)
      ? 'The service account private key is invalid. Re-download and re-upload the JSON from Firebase Console (Project Settings → Service Accounts).'
      : `Firebase initialization failed: ${reason}`;
    return false;
  }
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  imageUrl?: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const errors: string[] = [];
  
  console.log(`🔥 sendPushNotification called with ${tokens.length} tokens`);
  
  if (admin.apps.length === 0) {
    console.log('🔥 Firebase app not initialized, attempting to initialize...');
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.log('🔥 Firebase initialization failed');
      return { 
        successCount: 0, 
        failureCount: tokens.length, 
        errors: [lastFirebaseError || 'Firebase not configured. Please add Firebase Service Account JSON in Push Notifications settings.'] 
      };
    }
  }

  if (tokens.length === 0) {
    console.log('🔥 No tokens provided');
    return { successCount: 0, failureCount: 0, errors: ['No device tokens provided'] };
  }

  try {
    console.log('🔥 Building FCM message...');
    console.log('🔥 Image URL:', imageUrl || 'none');
    
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl })
      },
      data: {
        ...(data || {}),
        ...(imageUrl && { imageUrl })
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'lawncare_notifications',
          ...(imageUrl && { imageUrl })
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'mutable-content': 1
          }
        },
        fcmOptions: {
          ...(imageUrl && { imageUrl })
        }
      }
    };

    console.log('🔥 Sending FCM message...');
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`🔥 FCM response: ${response.successCount} success, ${response.failureCount} failed`);
    
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        console.log(`🔥 Token ${idx} failed: ${resp.error.message}`);
        errors.push(`Token ${idx}: ${resp.error.message}`);
      }
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors
    };
  } catch (error: any) {
    console.error('🔥 FCM send error:', error);
    return {
      successCount: 0,
      failureCount: tokens.length,
      errors: [error.message || 'Unknown FCM error']
    };
  }
}

export async function sendToTopic(
  topic: string,
  title: string,
  body: string,
  imageUrl?: string
): Promise<boolean> {
  if (admin.apps.length === 0) {
    const initialized = await initializeFirebase();
    if (!initialized) return false;
  }

  try {
    await admin.messaging().send({
      topic,
      notification: { title, body, ...(imageUrl && { imageUrl }) }
    });
    return true;
  } catch (error) {
    console.error('FCM topic send error:', error);
    return false;
  }
}

export function isFirebaseInitialized(): boolean {
  return admin.apps.length > 0;
}
