'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/insights', label: 'Insights' },
  { href: '/parent', label: 'Parent' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center bg-surface-card border-t border-surface-border px-2 py-2 z-50">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 cursor-pointer rounded-xl transition-colors ${
              active ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
