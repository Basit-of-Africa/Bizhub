
'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile, UserRole } from '@/lib/types';

/**
 * Stable mock user with a role to prevent reference changes on every render.
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

    // 1. Try direct UID lookup
    const docRef = doc(db, 'users', user.uid);
    const unsubscribeDoc = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
        setLoading(false);
      } else {
        // 2. If not found, check if a profile was pre-provisioned by email
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', user.email));
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          const provisionedDoc = emailSnapshot.docs[0];
          const provisionedData = provisionedDoc.data();

          // "Claim" the provisioned profile by moving it to the UID document
          const finalProfile = {
            ...provisionedData,
            userId: user.uid,
            lastLogin: new Date().toISOString(),
            isProvisioned: false // Now fully claimed
          } as UserProfile;

          await setDoc(doc(db, 'users', user.uid), finalProfile);
          // Delete the temporary provisioned doc if it was an auto-id doc
          if (provisionedDoc.id !== user.uid) {
            // We keep the old doc for history or delete it? Usually cleaner to move to UID path.
            // For this implementation, we've mirrored it to UID path.
          }
          setProfile(finalProfile);
        } else {
          // 3. Last resort: Create a default Staff profile if nothing was pre-provisioned
          const newProfile: UserProfile = {
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'New User',
            role: 'Staff', 
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
