
'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile, UserRole } from '@/lib/types';

/**
 * Stable mock user with a role to prevent reference changes on every render.
 * Mock role defaults to 'Super Admin' for testing.
 */
const MOCK_USER = {
  uid: 'demo-business-owner',
  displayName: 'Vela Demo User',
  email: 'demo@vela.ai',
  photoURL: 'https://picsum.photos/seed/vela-user/200/200',
  role: 'Super Admin' as UserRole,
};

/**
 * Hook to manage and provide the current Firebase user and their role profile.
 */
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
    const unsubscribeDoc = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // Fallback or create profile logic can go here
        setProfile({
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'New User',
          role: 'Staff', // Default role
          lastLogin: new Date().toISOString(),
        });
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [user, db]);

  // Combine real or mock data
  const currentUser = useMemo(() => {
    if (user) {
      return {
        ...user,
        role: profile?.role || 'Staff'
      };
    }
    // Return mock for demo purposes if no user is signed in
    return MOCK_USER as any;
  }, [user, profile]);

  return { 
    user: currentUser, 
    role: currentUser.role as UserRole,
    loading: loading 
  };
}
