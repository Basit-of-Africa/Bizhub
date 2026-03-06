'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { initializeFirebase } from './index';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // We initialize the instances only once on the client.
  // Using useState + useEffect ensures we don't hit hydration mismatches
  // by keeping the initial server render clean of Firebase instances if they affect state.
  const firebaseData = useMemo(() => initializeFirebase(), []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <FirebaseProvider 
      firebaseApp={firebaseData.firebaseApp} 
      firestore={firebaseData.firestore} 
      auth={firebaseData.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
