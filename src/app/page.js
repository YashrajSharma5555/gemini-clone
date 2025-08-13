// app/page.js
'use client'; // make this a client component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth'); // client-side redirect
  }, [router]);

  return null; // nothing renders on root
}
