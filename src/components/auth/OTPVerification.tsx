'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OTPVerification() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [shaking, setShaking] = useState(false);
  const [err, setErr] = useState(false);
  const [secs, setSecs] = useState(45);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const onChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    setErr(false);
    if (ch && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== '')) {
      const code = next.join('');
      if (code === '000000') {
        setShaking(true);
        setErr(true);
        setTimeout(() => setShaking(false), 400);
      } else {
        setTimeout(() => router.push('/onboarding/consent'), 200);
      }
    }
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div>
      <Link
        href="/onboarding/phone"
        className="text-text-muted hover:text-text-primary cursor-pointer mb-6 flex items-center gap-2"
      >
        ← Back
      </Link>

      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-pill transition-all ${
              i <= 2 ? 'w-6 bg-primary' : 'w-2 bg-surface-elevated'
            }`}
          />
        ))}
      </div>
      <p className="text-text-muted text-xs mb-6">Step 2 of 4</p>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Enter the code
      </h1>
      <p className="text-text-secondary text-[15px] mb-6">
        Sent to +92 3XX-XXXXXXX
      </p>

      <div
        className={`flex gap-2 justify-center my-8 ${shaking ? 'animate-shake' : ''}`}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`w-12 h-14 text-center text-xl font-semibold bg-surface-elevated border rounded-input text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 ${
              err
                ? 'border-danger'
                : d
                  ? 'border-primary/50 bg-primary/15'
                  : 'border-surface-border'
            }`}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
          />
        ))}
      </div>

      <div className="text-center">
        {secs > 0 ? (
          <span className="text-text-muted text-sm">
            Resend in 0:{String(secs).padStart(2, '0')}
          </span>
        ) : (
          <button
            type="button"
            className="text-primary font-semibold text-sm hover:underline"
            onClick={() => setSecs(45)}
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}
