'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MOCK_USER } from '@/lib/mockData';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/insights', label: 'Insights' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/parent', label: 'Parent View' },
  { href: '/upload', label: 'Upload' },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <aside className="w-60 bg-surface-card border-r border-surface-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-surface-border">
        <span className="text-white font-bold text-2xl">Youth</span>
        <span className="text-accent font-bold text-2xl">Pay</span>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                active
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {MOCK_USER.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {MOCK_USER.name}
            </div>
            <div className="text-xs text-text-muted">Teen Account</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left text-sm text-text-secondary hover:text-danger px-2 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
