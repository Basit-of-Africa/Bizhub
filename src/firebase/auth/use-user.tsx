'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Hook to manage and provide the current Firebase user.
 * MODIFIED: Temporarily provides a mock user if no real user is logged in.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Temporary mock user for development/preview without login
  const mockUser = {
    uid: 'demo-business-owner',
    displayName: 'Vela Demo User',
    email: 'demo@vela.ai',
    photoURL: 'https://picsum.photos/seed/vela-user/200/200',
  };

  return { 
    user: user || (mockUser as any), 
    loading: false // Set to false to allow immediate access
  };
}
