'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const AVATARS = [
  { letter: 'S', color: '#5B4CF5' },
  { letter: 'A', color: '#A8E63D' },
  { letter: 'M', color: '#FF6B6B' },
  { letter: 'Z', color: '#4ECDC4' },
  { letter: 'F', color: '#FFAB00' },
  { letter: 'K', color: '#FF6EB4' },
];

export default function ProfileSetup() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <Link
        href="/onboarding/consent"
        className="text-text-muted hover:text-text-primary cursor-pointer mb-6 flex items-center gap-2"
      >
        ← Back
      </Link>

      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-6 h-2 bg-primary rounded-pill" />
        ))}
      </div>
      <p className="text-text-muted text-xs mb-6">Step 4 of 4</p>

      <h1 className="text-2xl font-bold text-text-primary mb-4">
        Set up your profile
      </h1>

      <div className="flex gap-3 flex-wrap justify-center my-4">
        {AVATARS.map((avatar, i) => (
          <button
            key={avatar.letter}
            type="button"
            onClick={() => setSelected(i)}
            className={`w-[52px] h-[52px] rounded-full flex items-center justify-center font-bold text-lg text-surface-bg cursor-pointer transition-transform hover:scale-105 ${
              selected === i
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-bg'
                : ''
            }`}
            style={{ backgroundColor: avatar.color }}
          >
            {avatar.letter}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Input label="Full name" defaultValue="Sudais" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-text-secondary font-medium">Age</label>
          <select
            defaultValue="17"
            className="bg-surface-elevated border border-surface-border rounded-input px-4 py-3.5 text-text-primary w-full focus:outline-none focus:border-primary"
          >
            {[13, 14, 15, 16, 17].map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
        <Input label="City" defaultValue="Karachi" />
        <Input label="Monthly allowance (PKR)" placeholder="e.g. 10,000" inputMode="numeric" />
      </div>

      <div className="mt-6">
        <Button variant="accent" fullWidth onClick={() => router.push('/onboarding/success')}>
          Create My Account →
        </Button>
      </div>
    </div>
  );
}
