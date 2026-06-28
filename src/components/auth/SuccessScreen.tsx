'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const COLORS = ['#5B4CF5', '#A8E63D', '#2DD4BF', '#FFAB00', '#FF6EB4', '#4ECDC4'];

export default function SuccessScreen() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sudais@youthpay.test',
        password: 'testpass123',
      }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (count <= 0) {
      router.push('/dashboard');
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle
            cx="40"
            cy="40"
            r="36"
            className="stroke-success fill-none stroke-[4] [stroke-dasharray:226] [stroke-dashoffset:226] animate-[drawCircle_0.6s_ease_forwards]"
          />
          <path
            d="M24 40 L34 50 L56 28"
            className="stroke-success fill-none stroke-[4] stroke-linecap-round stroke-linejoin-round [stroke-dasharray:50] [stroke-dashoffset:50] animate-[drawCheck_0.4s_ease_0.5s_forwards]"
          />
        </svg>
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 90;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full animate-[confetti_0.8s_ease-out_0.6s_both]"
                style={{
                  backgroundColor: COLORS[i % COLORS.length],
                  ['--tx' as string]: `${Math.cos(angle) * dist}px`,
                  ['--ty' as string]: `${Math.sin(angle) * dist}px`,
                }}
              />
            );
          })}
        </div>
      </div>

      <h1 className="text-5xl font-bold text-text-primary">You&apos;re in!</h1>
      <p className="text-text-secondary">Welcome to YouthPay, Sudais!</p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link href="/dashboard">
          <Button variant="primary" fullWidth>
            Go to my dashboard
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" fullWidth>
            Set up later
          </Button>
        </Link>
      </div>

      <p className="text-text-muted text-sm">Redirecting in {count}...</p>
    </div>
  );
}
