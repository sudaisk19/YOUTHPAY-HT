'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function WelcomeScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <div className="text-center mb-8">
        <span className="text-white font-bold text-3xl">Youth</span>
        <span className="text-accent font-bold text-3xl">Pay</span>
      </div>

      <div
        className={`bg-surface-card border border-surface-border rounded-[24px] p-10 shadow-card transition-all duration-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Your money, understood.
        </h1>
        <p className="text-text-secondary text-[15px] leading-relaxed mb-8">
          Smart spending insights for Pakistani teens and their parents.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/onboarding/phone">
            <Button variant="primary" fullWidth>
              Create Account
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" fullWidth>
              Sign In
            </Button>
          </Link>
        </div>
        <p className="text-center text-text-muted text-sm mt-6">
          Trusted by teens across Pakistan
        </p>
      </div>
    </div>
  );
}
