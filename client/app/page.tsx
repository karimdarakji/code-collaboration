'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from './contexts/AuthContext';
import GoogleSignInButton from './components/GoogleButton';

export default function Home() {
  const router = useRouter()

  return (
    <section className="container mx-autos h-dvh">
      <div className="flex h-full items-center">
        <div className="w-2/4">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Collaborate on Code in Real Time</h1>
          <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Join our platform to code together.</p>
        </div>
        <div className="w-2/4">
          <div className="w-2/4 mx-auto">
            <GoogleSignInButton />
          </div>
        </div>

    </div>
    </section>
  );
}
