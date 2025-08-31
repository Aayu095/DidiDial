// Centralized configuration for API keys and environment
// Use EXPO_PUBLIC_* for values that need to be available in the client.
// In production, keep secrets on the server and proxy requests.

export const CONFIG = {
  // Firebase
  FIREBASE: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MSG,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },

  // Gemini
  GEMINI: {
    proxyUrl: process.env.EXPO_PUBLIC_GEMINI_PROXY_URL,
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY, // avoid in prod; use proxy
  },
};
