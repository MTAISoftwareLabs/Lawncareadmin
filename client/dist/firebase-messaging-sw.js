importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

let firebaseInitialized = false;

self.addEventListener('install', (event) => {
  console.log('Firebase SW: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Firebase SW: Activating...');
  event.waitUntil(clients.claim());
});

async function initFirebase() {
  if (firebaseInitialized) return true;
  
  try {
    const response = await fetch('/api/firebase-config');
    const config = await response.json();
    
    if (!config.configured || !config.apiKey) {
      console.log('Firebase SW: Not configured');
      return false;
    }
    
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }
    
    const messaging = firebase.messaging();
    
    messaging.onBackgroundMessage((payload) => {
      console.log('Firebase SW: Background message', payload);
      showNotification(payload);
    });
    
    firebaseInitialized = true;
    console.log('Firebase SW: Initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase SW: Init error', error);
    return false;
  }
}

function showNotification(payload) {
  const title = payload.notification?.title || payload.data?.title || 'New Notification';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/favicon.jpg',
    badge: '/favicon.jpg',
    vibrate: [200, 100, 200],
    tag: 'lawncare-notification',
    renotify: true,
    data: payload.data || {}
  };
  
  return self.registration.showNotification(title, options);
}

self.addEventListener('push', function(event) {
  console.log('Firebase SW: Push event received');
  
  if (!event.data) {
    console.log('Firebase SW: No data in push event');
    return;
  }
  
  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { notification: { title: 'New Message', body: event.data.text() } };
  }
  
  console.log('Firebase SW: Push payload', payload);
  
  event.waitUntil(
    showNotification(payload)
  );
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    await initFirebase();
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Firebase SW: Notification clicked');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/admin/support';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

initFirebase();
