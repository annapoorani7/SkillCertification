// firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let app;
let messaging = null;

// Only initialize if projectId is present to prevent crash
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase configuration is missing. Push notifications will be disabled.");
}

export const requestPermission = async () => {
  if (!messaging) {
    console.warn("Firebase messaging not initialized. Cannot request permission.");
    return null;
  }
  try {
    const token = await getToken(messaging, { vapidKey: process.env.REACT_APP_VAPID_KEY });
    if (token) {
      console.log('FCM Token:', token);
      // Send token to backend to store for push notifications
      return token;
    } else {
      console.log('No registration token available.');
    }
  } catch (error) {
    console.log('An error occurred while retrieving token. ', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (!messaging) {
      return reject(new Error("Firebase messaging not initialized"));
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };