import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { initFirebase } from '../services/firebase';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
  user: null,
  profile: null,
  initializing: true,
  signIn: async (_email, _password) => {},
  signUp: async (_name, _email, _password) => {},
  signOut: async () => {},
  updateName: async (_name) => {},
  updateUserProfile: async (_updates) => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [isNewSignup, setIsNewSignup] = useState(false);

  useEffect(() => {
    initFirebase();
    const auth = getAuth();
    
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      // If no user, stop initializing immediately
      if (!u) {
        setProfile(null);
        setInitializing(false);
        setIsNewSignup(false);
      }
    });
    
    return () => unsub();
  }, []);

  // Fast profile loading with offline-first approach
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let disposed = false;

    const loadProfileFast = async () => {
      try {
        // For existing users (not new signups), load from cache first for instant startup
        if (!isNewSignup) {
          try {
            const cachedProfile = await AsyncStorage.getItem(`profile_${user.uid}`);
            if (cachedProfile && !disposed) {
              const parsedProfile = JSON.parse(cachedProfile);
              // Ensure welcomeCompleted is true for cached existing users
              parsedProfile.welcomeCompleted = true;
              setProfile(parsedProfile);
              setInitializing(false);
              console.log('Loaded profile from cache for fast startup');
            }
          } catch (cacheError) {
            console.log('Cache read failed, using fallback');
          }

          // If no cache or cache failed, create immediate fallback
          if (!profile && !disposed) {
            const fallbackProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'बहन',
              email: user.email,
              language: 'hi-IN',
              createdAt: Date.now(),
              welcomeCompleted: true, // Existing users always completed
              streak: { current: 0, best: 0, lastCallDate: null },
              badges: [],
              settings: { safeMode: false },
            };
            
            setProfile(fallbackProfile);
            setInitializing(false);
            
            // Cache the fallback profile
            AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(fallbackProfile)).catch(() => {});
          }

          // Try to sync with Firestore in background (non-blocking)
          const db = getFirestore();
          const ref = doc(db, 'users', user.uid);
          
          getDoc(ref).then((snap) => {
            if (!disposed && snap.exists()) {
              const serverProfile = snap.data();
              
              // Ensure welcomeCompleted is set
              if (serverProfile.welcomeCompleted === undefined || serverProfile.welcomeCompleted === null) {
                serverProfile.welcomeCompleted = true;
                // Update server in background
                setDoc(ref, { welcomeCompleted: true }, { merge: true }).catch(() => {});
              }
              
              setProfile(serverProfile);
              // Update cache with server data
              AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(serverProfile)).catch(() => {});
            } else if (!disposed && !snap.exists()) {
              // No server profile exists, create one from our fallback
              const currentProfile = profile || {
                uid: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'बहन',
                email: user.email,
                language: 'hi-IN',
                createdAt: Date.now(),
                serverCreatedAt: serverTimestamp(),
                welcomeCompleted: true,
                streak: { current: 0, best: 0, lastCallDate: null },
                badges: [],
                settings: { safeMode: false },
              };
              
              // Save to server in background
              setDoc(ref, currentProfile, { merge: true }).catch(() => {});
            }
          }).catch(() => {
            // Network error - silently continue with cached/fallback profile
            console.log('Using offline profile - will sync when online');
          });

        } else {
          // For new signups, wait briefly for signup process to complete
          setTimeout(() => {
            if (!disposed && !profile) {
              setInitializing(false);
            }
          }, 200);
        }

      } catch (error) {
        if (!disposed) {
          console.log('Profile loading error:', error.message);
          setInitializing(false);
        }
      }
    };

    loadProfileFast();

    return () => {
      disposed = true;
    };
  }, [user?.uid, isNewSignup]);

  const signIn = async (email, password) => {
    try {
      setIsNewSignup(false);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (name, email, password) => {
    try {
      setIsNewSignup(true);
      const auth = getAuth();
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      if (name && name.length > 0) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      
      // Create profile immediately
      const newProfile = {
        uid: cred.user.uid,
        name: name?.trim() || cred.user.email?.split('@')[0] || 'बहन',
        email: cred.user.email,
        language: 'hi-IN',
        createdAt: Date.now(),
        serverCreatedAt: serverTimestamp(),
        streak: { current: 0, best: 0, lastCallDate: null },
        badges: [],
        settings: { safeMode: false },
        welcomeCompleted: false, // New users need welcome flow
      };
      
      setProfile(newProfile);
      setInitializing(false);
      
      // Cache the new profile
      AsyncStorage.setItem(`profile_${cred.user.uid}`, JSON.stringify(newProfile)).catch(() => {});
      
      // Save to Firestore in background
      const db = getFirestore();
      const ref = doc(db, 'users', cred.user.uid);
      setDoc(ref, newProfile, { merge: true }).catch(() => {
        console.log('Profile will sync when connection is restored');
      });
      
    } catch (error) {
      setIsNewSignup(false);
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const auth = getAuth();
      await fbSignOut(auth);
      setProfile(null);
      setIsNewSignup(false);
      
      // Clear cached profile
      if (user?.uid) {
        AsyncStorage.removeItem(`profile_${user.uid}`).catch(() => {});
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateName = async (name) => {
    if (!user) return;
    
    try {
      const auth = getAuth();
      await updateProfile(auth.currentUser, { displayName: name });
      
      // Update local profile immediately
      const updatedProfile = { ...(profile || {}), name };
      setProfile(updatedProfile);
      
      // Update cache
      AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile)).catch(() => {});
      
      // Update Firestore in background
      const db = getFirestore();
      const ref = doc(db, 'users', user.uid);
      setDoc(ref, { name }, { merge: true }).catch(() => {
        console.log('Name update will sync when connection is restored');
      });
    } catch (error) {
      console.error('Update name error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    
    try {
      // Update local profile immediately
      const updatedProfile = { ...(profile || {}), ...updates };
      setProfile(updatedProfile);
      
      // Update cache
      AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile)).catch(() => {});
      
      // Update Firestore in background
      const db = getFirestore();
      const ref = doc(db, 'users', user.uid);
      setDoc(ref, updates, { merge: true }).catch(() => {
        console.log('Profile update will sync when connection is restored');
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      // Don't throw error - keep local changes
    }
  };

  const value = useMemo(() => ({ 
    user, 
    profile, 
    initializing, 
    signIn, 
    signUp, 
    signOut, 
    updateName,
    updateUserProfile
  }), [user, profile, initializing]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthGate({ loadingFallback = null, childrenAuthed, childrenUnauthed }) {
  const { user, initializing } = useAuth();

  // Show loading screen while initializing
  if (initializing) {
    return loadingFallback ?? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#A67C52' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return user ? childrenAuthed : childrenUnauthed;
}