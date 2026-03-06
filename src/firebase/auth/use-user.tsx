
'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile, UserRole } from '@/lib/types';

/**
 * Stable mock user for demo purposes.
 * This ensures that when not logged in, the user has "Super Admin" clearance
 * to explore all features of the Vela OS.
 */
const MOCK_USER = {
  uid: 'demo-tenant-owner',
  displayName: 'Vela Demo Admin',
  email: 'demo@vela.ai',
  photoURL: 'https://picsum.photos/seed/vela-owner/200/200',
  role: 'Super Admin' as UserRole,
};

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

    const docRef = doc(db, 'users', user.uid);
    const unsubscribeDoc = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
        setLoading(false);
      } else {
        // Multi-tenant Onboarding Logic:
        // 1. Check if invited (provisioned)
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', user.email));
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          const provisionedDoc = emailSnapshot.docs[0];
          const provisionedData = provisionedDoc.data();

          const finalProfile = {
            ...provisionedData,
            userId: user.uid,
            lastLogin: new Date().toISOString(),
            isProvisioned: false 
          } as UserProfile;

          await setDoc(doc(db, 'users', user.uid), finalProfile);
          setProfile(finalProfile);
        } else {
          // 2. New Tenant: First person to sign up in a new UID space is the Super Admin (The Owner)
          const newProfile: UserProfile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Business Owner',
            role: 'Super Admin', 
            lastLogin: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
        setLoading(false);
      }
    }, () => {
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [user, db]);

  const currentUser = useMemo(() => {
    if (user) {
      return {
        ...user,
        role: profile?.role || 'Staff'
      };
    }
    // For the current demo environment, we return the MOCK_USER 
    // to allow full exploration of Admin features without login.
    return MOCK_USER as any;
  }, [user, profile]);

  return { 
    user: currentUser, 
    role: (currentUser?.role || 'Staff') as UserRole,
    loading: loading 
  };
}
