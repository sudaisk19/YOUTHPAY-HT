'use client';

import { MOCK_USER } from '@/lib/mockData';
import { currentMonthLabel } from '@/lib/dashboard-utils';

interface TopHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export default function TopHeader({ title, right }: TopHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 mb-8 border-b border-surface-border">
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <div className="flex items-center gap-4">
        {right}
        <span className="bg-surface-elevated text-text-secondary text-sm px-4 py-2 rounded-pill">
          {currentMonthLabel()}
        </span>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
          {MOCK_USER.avatar}
        </div>
      </div>
    </div>
  );
}
