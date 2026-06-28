'use client';

import { useEffect, useState } from 'react';
import { fmt } from '@/lib/mockData';
import CategoryIcon from '@/components/ui/CategoryIcon';

interface CategoryBarProps {
  category: string;
  amount: number;
  maxAmount: number;
  color: string;
  onClick?: () => void;
}

export default function CategoryBar({
  category,
  amount,
  maxAmount,
  color,
  onClick,
}: CategoryBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const pct = maxAmount ? (amount / maxAmount) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer hover:bg-surface-elevated/50 rounded-lg px-2 py-1.5 transition-colors"
    >
      <CategoryIcon category={category} size={28} />
      <span className="text-sm text-text-secondary flex-1 min-w-[80px]">
        {category}
      </span>
      <div className="flex-1 h-2 bg-surface-elevated rounded-pill overflow-hidden">
        <div
          className="h-full rounded-pill transition-all duration-700"
          style={{
            width: mounted ? `${pct}%` : '0%',
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-sm text-text-secondary w-20 text-right">
        {fmt(amount)}
      </span>
    </div>
  );
}
