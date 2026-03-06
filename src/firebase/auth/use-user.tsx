'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Stable mock user to prevent reference changes on every render
 */
const MOCK_USER = {
  uid: 'demo-business-owner',
  displayName: 'Vela Demo User',
  email: 'demo@vela.ai',
  photoURL: 'https://picsum.photos/seed/vela-user/200/200',
};

/**
 * Hook to manage and provide the current Firebase user.
 * In demo mode, it immediately returns a mock user to prevent loading blocks.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // For the current "Disabled Login" mode, we return the mock user if no real user exists.
  // We return loading: false to ensure the UI doesn't block on hydration.
  return { 
    user: user || (MOCK_USER as any), 
    loading: false 
  };
}
