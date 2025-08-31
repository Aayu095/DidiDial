import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, getDocs, collection, query, orderBy, limit, getDoc, updateDoc, enableNetwork, disableNetwork } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config/config';

let app;
let db;

export function initFirebase() {
  if (getApps().length) {
    app = getApps()[0];
  } else {
    const cfg = CONFIG.FIREBASE;
    if (!cfg?.apiKey || cfg.apiKey === 'demo-api-key') {
      console.warn('Firebase API key missing or invalid. Add EXPO_PUBLIC_FIREBASE_API_KEY and other config values.');
    }
    app = initializeApp({
      apiKey: cfg?.apiKey,
      authDomain: cfg?.authDomain,
      projectId: cfg?.projectId,
      storageBucket: cfg?.storageBucket,
      messagingSenderId: cfg?.messagingSenderId,
      appId: cfg?.appId,
    });
    // Ensure persisted auth on RN
    try {
      initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch (e) {
      // initializeAuth can only be called once; ignore subsequent attempts
    }
  }
  db = getFirestore(app);
  
  // Enable offline persistence for better offline handling
  try {
    // This will enable offline persistence and caching
    enableNetwork(db);
  } catch (error) {
    console.log('Firestore offline persistence already enabled or failed:', error);
  }
}

export async function saveTurnToFirestore({ sessionId, packId, user, assistant }) {
  if (!db) initFirebase();
  try {
    const ref = doc(db, 'sessions', sessionId);
    await setDoc(ref, {
      id: sessionId,
      packId,
      lastUser: user,
      lastAssistant: assistant,
      updatedAt: Date.now(),
      serverUpdatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving session to Firestore:', error);
    // Don't throw error, just log it
  }
}

export async function getRecentSessions(n = 20) {
  if (!db) initFirebase();
  try {
    const q = query(collection(db, 'sessions'), orderBy('updatedAt', 'desc'), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    return []; // Return empty array if offline
  }
}

export async function updateStreakAndBadges(uid) {
  if (!db) initFirebase();
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const today = new Date();
    const last = data?.streak?.lastCallDate ? new Date(data.streak.lastCallDate) : null;

    let current = data?.streak?.current || 0;
    let best = data?.streak?.best || 0;

    const isSameDay = last && last.toDateString() === today.toDateString();
    const wasYesterday = last && new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toDateString() === last.toDateString();

    if (!last) {
      current = 1;
    } else if (isSameDay) {
      // do nothing
    } else if (wasYesterday) {
      current = current + 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);

    await updateDoc(ref, {
      streak: { current, best, lastCallDate: today.getTime() },
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating streak and badges:', error);
    // Don't throw error, just log it
  }
}