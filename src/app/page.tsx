"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to dashboard for the current OS version
    router.replace('/dashboard');
  }, [router]);

  return null;
}
