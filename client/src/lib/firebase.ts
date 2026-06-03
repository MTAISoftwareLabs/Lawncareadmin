import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

interface FirebaseConfig {
  configured: boolean;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  vapidKey?: string;
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let cachedConfig: FirebaseConfig | null = null;

async function fetchFirebaseConfig(): Promise<FirebaseConfig> {
  if (cachedConfig) return cachedConfig;
  
  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      return { configured: false };
    }
    cachedConfig = await response.json();
    return cachedConfig!;
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
    return { configured: false };
  }
}

export async function initializeFirebase(): Promise<FirebaseApp | null> {
  const config = await fetchFirebaseConfig();
  
  if (!config.configured || !config.apiKey || !config.projectId) {
    console.log("Firebase not configured");
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  } else {
    app = getApps()[0];
  }
  return app;
}

let swRegistration: ServiceWorkerRegistration | null = null;

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }
  
  try {
    swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Firebase SW registered:', swRegistration.scope);
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    
    const config = await fetchFirebaseConfig();
    if (config.configured) {
      const activeWorker = swRegistration.active || swRegistration.installing || swRegistration.waiting;
      if (activeWorker) {
        activeWorker.postMessage({
          type: 'INIT_FIREBASE',
          config: {
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
            appId: config.appId,
          }
        });
      }
    }
    
    return swRegistration;
  } catch (error) {
    console.error('SW registration failed:', error);
    return null;
  }
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!app) {
    app = await initializeFirebase();
  }
  if (!app) return null;

  if (!messaging) {
    try {
      await registerServiceWorker();
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error);
      return null;
    }
  }
  return messaging;
}

export async function requestNotificationPermission(): Promise<string> {
  const messagingInstance = await getFirebaseMessaging();
  if (!messagingInstance) {
    throw new Error("Firebase messaging failed to initialize. Check browser console for details.");
  }

  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);
  if (permission !== "granted") {
    throw new Error("Notification permission denied. Please allow notifications in browser settings.");
  }

  const config = await fetchFirebaseConfig();
  if (!config.vapidKey) {
    throw new Error("VAPID key not configured in Firebase settings.");
  }
  
  const registration = await registerServiceWorker();
  if (!registration) {
    throw new Error("Service worker registration failed. Try refreshing the page.");
  }
  
  console.log("Getting FCM token with VAPID key...");
  try {
    const token = await getToken(messagingInstance, { 
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration
    });
    if (!token) {
      throw new Error("Failed to get FCM token. Please try again.");
    }
    console.log("FCM token obtained successfully");
    return token;
  } catch (error: any) {
    console.error("FCM token error:", error);
    throw new Error(`FCM error: ${error?.message || error?.code || 'Unknown error'}`);
  }
}

export async function setupForegroundMessage(callback: (payload: any) => void): Promise<() => void> {
  const messagingInstance = await getFirebaseMessaging();
  if (!messagingInstance) return () => {};
  return onMessage(messagingInstance, callback);
}

export async function isFirebaseConfigured(): Promise<boolean> {
  const config = await fetchFirebaseConfig();
  return config.configured;
}

export function clearFirebaseConfigCache(): void {
  cachedConfig = null;
}
