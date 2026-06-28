'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type Status = 'idle' | 'loading' | 'sent' | 'ready';

export default function ParentConsent() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');

  const send = () => {
    setStatus('loading');
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => setStatus('ready'), 2000);
    }, 1500);
  };

  return (
    <div>
      <Link
        href="/onboarding/otp"
        className="text-text-muted hover:text-text-primary cursor-pointer mb-6 flex items-center gap-2"
      >
        ← Back
      </Link>

      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-pill transition-all ${
              i <= 3 ? 'w-6 bg-primary' : 'w-2 bg-surface-elevated'
            }`}
          />
        ))}
      </div>
      <p className="text-text-muted text-xs mb-6">Step 3 of 4</p>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Get your parent&apos;s OK
      </h1>
      <p className="text-text-secondary text-[15px] mb-6">
        Pakistani regulations require parental approval for teen accounts.
      </p>

      <div className="flex gap-8 justify-center my-6">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 bg-primary rounded-full" />
          <div className="w-8 h-14 bg-primary/70 rounded-xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 bg-accent rounded-full" />
          <div className="w-6 h-12 bg-accent/70 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Parent's full name" placeholder="e.g. Ahmed Khan" defaultValue="Ahmed Khan" />
        <Input label="Parent's phone number" prefix="+92" placeholder="3XX XXXXXXX" inputMode="numeric" />
      </div>

      {status === 'idle' && (
        <div className="mt-6">
          <Button variant="primary" fullWidth onClick={send}>
            Send Consent Request
          </Button>
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-6">
          <Button variant="primary" fullWidth disabled>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Sending...
          </Button>
        </div>
      )}

      {(status === 'sent' || status === 'ready') && (
        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="w-16 h-16 rounded-full border-4 border-success flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path
                d="M6 12 L10 16 L18 8"
                fill="none"
                stroke="#2DD4BF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-success font-semibold text-center">
            Request sent! Ammi/Abu will receive an SMS shortly.
          </p>
        </div>
      )}

      {status === 'ready' && (
        <div className="mt-4">
          <Button variant="primary" fullWidth onClick={() => router.push('/onboarding/profile')}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
