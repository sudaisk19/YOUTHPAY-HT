'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface LoginResponse {
  user: {
    userId: string;
    email: string;
    role: 'teen' | 'parent';
    fullName: string;
  };
}

const TEST_ACCOUNTS = [
  {
    role: 'Teen',
    name: 'Sudais',
    email: 'sudais@youthpay.test',
    password: 'testpass123',
  },
  {
    role: 'Parent',
    name: 'Parent User',
    email: 'parent@youthpay.test',
    password: 'testpass123',
  },
] as const;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = (await res.json()) as LoginResponse & { error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      if (data.user.role === 'parent') {
        router.push('/dashboard?view=parent');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <>
      <div className="fixed top-6 left-6 z-10 w-72 bg-surface-card border border-surface-border rounded-card p-4 shadow-card">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-3">
          Test credentials
        </p>
        <div className="space-y-3">
          {TEST_ACCOUNTS.map((account) => (
            <div
              key={account.email}
              className="border border-surface-border rounded-lg p-3 bg-surface-elevated/50"
            >
              <p className="text-text-primary text-sm font-semibold mb-0.5">
                {account.role}
              </p>
              <p className="text-text-muted text-xs mb-2">{account.name}</p>
              <p className="text-text-secondary text-xs font-mono break-all">
                {account.email}
              </p>
              <p className="text-text-muted text-xs font-mono mt-1">
                {account.password}
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleLogin(account.email, account.password)}
                className="mt-2 text-primary text-xs font-semibold hover:underline disabled:opacity-50"
              >
                Sign in
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-center mb-8">
          <span className="text-white font-bold text-3xl">Youth</span>
          <span className="text-accent font-bold text-3xl">Pay</span>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-card p-8 shadow-card">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Welcome back
          </h1>
          <p className="text-text-secondary text-[15px] mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="you@youthpay.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="mt-4">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mt-5">
              <Button variant="primary" fullWidth type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {error && (
            <p className="text-danger text-sm text-center mt-4">{error}</p>
          )}

          <p className="text-center text-text-muted text-sm mt-5">
            New to YouthPay?{' '}
            <Link href="/" className="text-primary hover:underline font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
