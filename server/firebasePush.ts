import admin from "firebase-admin";
import { initializeFirebase, isFirebaseInitialized } from "./firebase";

// Don't initialize here - firebase.ts handles it

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  fcmToken: string,
  payload: PushPayload,
  deviceType: string = "android"
): Promise<boolean> {
  // Ensure Firebase is initialized
  if (admin.apps.length === 0) {
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.log("Firebase not configured, skipping notification");
      return false;
    }
  }

  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    if (deviceType === "android") {
      message.android = {
        priority: "high",
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "ic_notification",
          channelId: "default",
          sound: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      };
    } else if (deviceType === "ios") {
      message.apns = {
        headers: {
          "apns-priority": "10",
          "apns-push-type": "alert",
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: "default",
            badge: 1,
            "content-available": 1,
            "mutable-content": 1,
          },
        },
      };
    } else if (deviceType === "web") {
      message.webpush = {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/favicon.jpg",
        },
        fcmOptions: {
          link: payload.data?.url || "/",
        },
      };
    }

    const response = await admin.messaging().send(message);
    console.log(`Push notification sent successfully to ${deviceType} device:`, response);
    return true;
  } catch (error: any) {
    console.error(`Error sending push to ${deviceType}:`, error.message, error.code);
    if (error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token") {
      console.log("Token is invalid or expired");
    }
    return false;
  }
}

export async function sendPushToMultipleDevices(
  devices: Array<{ token: string; deviceType: string }>,
  payload: PushPayload
): Promise<{ success: number; failure: number; invalidTokens: string[] }> {
  console.log(`🔔 sendPushToMultipleDevices: Starting with ${devices.length} devices`);
  
  if (devices.length === 0) {
    console.log(`🔔 sendPushToMultipleDevices: No devices, returning early`);
    return { success: 0, failure: 0, invalidTokens: [] };
  }
  
  // Ensure Firebase is initialized
  console.log(`🔔 sendPushToMultipleDevices: Firebase apps count = ${admin.apps.length}`);
  if (admin.apps.length === 0) {
    console.log(`🔔 sendPushToMultipleDevices: Initializing Firebase...`);
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.log(`🔔 sendPushToMultipleDevices: Firebase init failed!`);
      return { success: 0, failure: devices.length, invalidTokens: devices.map(d => d.token) };
    }
    console.log(`🔔 sendPushToMultipleDevices: Firebase initialized successfully`);
  }

  const results = { success: 0, failure: 0, invalidTokens: [] as string[] };

  for (const device of devices) {
    const sent = await sendPushNotification(device.token, payload, device.deviceType);
    if (sent) {
      results.success++;
    } else {
      results.failure++;
      results.invalidTokens.push(device.token);
    }
  }

  console.log(`Push results: ${results.success} success, ${results.failure} failed`);
  return results;
}

export async function sendFirebaseWebPush(
  fcmToken: string,
  payload: PushPayload
): Promise<boolean> {
  return sendPushNotification(fcmToken, payload, "web");
}

export async function sendFirebaseWebPushToMultiple(
  fcmTokens: string[],
  payload: PushPayload
): Promise<{ success: number; failure: number; invalidTokens: string[] }> {
  const devices = fcmTokens.map(token => ({ token, deviceType: "web" }));
  return sendPushToMultipleDevices(devices, payload);
}

export function isFirebaseEnabled(): boolean {
  return admin.apps.length > 0 || isFirebaseInitialized();
}
