'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

function StepDots({ active }: { active: number }) {
  return (
    <>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-pill transition-all ${
              i <= active ? 'w-6 bg-primary' : 'w-2 bg-surface-elevated'
            }`}
          />
        ))}
      </div>
      <p className="text-text-muted text-xs mb-6">Step {active} of 4</p>
    </>
  );
}

export default function PhoneEntry() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  return (
    <div>
      <Link
        href="/"
        className="text-text-muted hover:text-text-primary cursor-pointer mb-6 flex items-center gap-2"
      >
        ← Back
      </Link>

      <StepDots active={1} />

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        What&apos;s your number?
      </h1>
      <p className="text-text-secondary text-[15px] mb-6">
        We&apos;ll send you a verification code.
      </p>

      <label className="text-sm text-text-secondary font-medium block mb-1.5">
        Phone number
      </label>
      <div className="flex">
        <span className="bg-surface-elevated border border-surface-border border-r-0 rounded-l-input px-4 py-3.5 text-text-primary text-[15px] whitespace-nowrap flex items-center">
          +92
        </span>
        <input
          className="flex-1 bg-surface-elevated border border-surface-border rounded-r-input px-4 py-3.5 text-text-primary text-[15px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          inputMode="numeric"
          placeholder="3XX XXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <Button variant="primary" fullWidth onClick={() => router.push('/onboarding/otp')}>
          Send Code
        </Button>
      </div>

      <p className="text-center text-text-muted text-xs mt-4">
        By continuing you agree to our{' '}
        <span className="text-primary">Terms</span> &{' '}
        <span className="text-primary">Privacy Policy</span>
      </p>
    </div>
  );
}
