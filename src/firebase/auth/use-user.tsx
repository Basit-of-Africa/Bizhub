
'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile, UserRole } from '@/lib/types';

/**
 * Stable mock user for demo purposes.
 */
const MOCK_USER = {
  uid: 'demo-tenant-owner',
  displayName: 'Vela Demo Admin',
  email: 'demo@vela.ai',
  photoURL: 'https://picsum.photos/seed/vela-owner/200/200',
  role: 'Super Admin' as UserRole,
  businessName: 'Vela Global Inc.',
  setupCompleted: true,
};

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Snappy transition for demo purposes
  const isDemo = typeof window !== 'undefined' && !window.localStorage.getItem('vela_signed_in');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const docRef = doc(db, 'users', user.uid);
    const unsubscribeDoc = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
        setLoading(false);
      } else {
        // Multi-tenant Onboarding Logic:
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', user.email));
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          const provisionedDoc = emailSnapshot.docs[0];
          const provisionedData = provisionedDoc.data();

          const finalProfile: UserProfile = {
            ...provisionedData as any,
            userId: user.uid,
            lastLogin: new Date().toISOString(),
            isProvisioned: false,
            setupCompleted: true // Provisioned users bypass onboarding
          };

          await setDoc(doc(db, 'users', user.uid), finalProfile);
          setProfile(finalProfile);
        } else {
          // New Tenant: First person to sign up is the Super Admin
          const newProfile: UserProfile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Business Owner',
            role: 'Super Admin', 
            lastLogin: new Date().toISOString(),
            setupCompleted: false, // Must go through onboarding
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
        setLoading(false);
      }
    }, (error) => {
      console.error("Profile sync failed:", error);
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [user, db]);

  const currentUser = useMemo(() => {
    if (user) {
      return {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: profile?.role || 'Staff',
        businessName: profile?.businessName,
        setupCompleted: profile?.setupCompleted ?? true,
      };
    }
    // Demo Mode fallback
    return MOCK_USER;
  }, [user, profile]);

  // Adjust loading state for snappy demo start
  const finalLoading = user === null && isDemo ? false : loading;

  return { 
    user: currentUser, 
    role: (currentUser?.role || 'Staff') as UserRole,
    loading: finalLoading 
  };
}
