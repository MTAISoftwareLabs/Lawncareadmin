import { useEffect, useState, useCallback, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { 
  initializeFirebase, 
  requestNotificationPermission, 
  setupForegroundMessage,
  isFirebaseConfigured 
} from "@/lib/firebase";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const hasNotificationAPI = "Notification" in window;
      const firebaseConfigured = await isFirebaseConfigured();
      const supported = hasNotificationAPI && firebaseConfigured;
      
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        await initializeFirebase();
        await checkSubscription();
      }
      setIsLoading(false);
    }
    
    init();
  }, []);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isSupported) return;

    async function setupListener() {
      unsubscribeRef.current = await setupForegroundMessage((payload) => {
        if (payload.notification) {
          new Notification(payload.notification.title || "New Message", {
            body: payload.notification.body,
            icon: "/favicon.jpg",
          });
        }
      });
    }
    
    setupListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isSupported]);

  async function checkSubscription() {
    try {
      const storedToken = localStorage.getItem("fcm_token");
      if (storedToken) {
        setFcmToken(storedToken);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error("Push notifications not supported in this browser. Try Chrome on desktop or Android.");
    }

    // This will throw with a specific error message
    const token = await requestNotificationPermission();

    setPermission(Notification.permission);
    
    await apiRequest("/api/admin/push/subscribe", {
      method: "POST",
      body: JSON.stringify({ fcmToken: token })
    });

    localStorage.setItem("fcm_token", token);
    setFcmToken(token);
    setIsSubscribed(true);
    return true;
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      const token = fcmToken || localStorage.getItem("fcm_token");
      if (token) {
        await apiRequest("/api/admin/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ fcmToken: token })
        });
      }
      
      localStorage.removeItem("fcm_token");
      setFcmToken(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("Error unsubscribing:", error);
      throw error;
    }
  }, [fcmToken]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe
  };
}
