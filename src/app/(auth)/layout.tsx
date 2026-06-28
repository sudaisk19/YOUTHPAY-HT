'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AuthBackground from '@/components/auth/AuthBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/onboarding')) return;

    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) router.push('/dashboard');
      })
      .catch(() => {});
  }, [router, pathname]);

  return (
    <>
      <AuthBackground />
      <div className="relative z-10 flex min-h-dvh min-h-screen w-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] mx-auto">{children}</div>
      </div>
    </>
  );
}
