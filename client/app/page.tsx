'use client';

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to the Collaborative Coding Platform</h1>
      <button onClick={() => router.push('http://localhost:8000/api/auth/google')}>Sign In with Google</button>
    </div>
  );
}
