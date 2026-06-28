'use client';

import { useMemo, useState } from 'react';
import TopHeader from '@/components/shared/TopHeader';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Card from '@/components/ui/Card';
import TransactionRow from '@/components/ui/TransactionRow';
import { recordsToLegacyTransactions } from '@/lib/mock-to-records';
import { fmt } from '@/lib/mockData';
import { useTransactions } from '@/lib/use-transactions';

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Lifestyle',
  'Utilities',
  'Beauty',
  'Education',
  'Entertainment',
  'Coffee',
  'Allowance',
];

export default function TransactionList() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { transactions, loading, error, setError, deleteTransaction } =
    useTransactions();

  const legacyTxns = useMemo(
    () => recordsToLegacyTransactions(transactions),
    [transactions]
  );

  const filtered = useMemo(() => {
    return legacyTxns.filter((t) => {
      const matchesFilter =
        activeFilter === 'All' || t.category === activeFilter;
      const matchesSearch =
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bank.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [legacyTxns, activeFilter, searchQuery]);

  const totalDebit = filtered
    .filter((t) => t.direction === 'debit')
    .reduce((s, t) => s + t.amount, 0);

  const handleDelete = async (id: number) => {
    const record = transactions.find(
      (t) =>
        parseInt(t.id.replace(/\D/g, '').slice(-8) || '0', 10) === id ||
        t.id === String(id)
    );
    if (record) {
      try {
        await deleteTransaction(record.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    }
  };

  if (loading) {
    return (
      <>
        <TopHeader title="Transactions" />
        <LoadingSpinner label="Loading transactions..." />
      </>
    );
  }

  return (
    <>
      <TopHeader
        title="Transactions"
        right={
          <span className="text-text-muted text-sm">
            {filtered.length} transactions · {fmt(totalDebit)}
          </span>
        }
      />
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <div className="relative mb-4">
        <input
          className="w-full bg-surface-elevated border border-surface-border rounded-input px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
          placeholder="Search merchants, banks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-pill text-sm cursor-pointer transition-all ${
              activeFilter === cat
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-card'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="hidden sm:block">
          <div className="grid grid-cols-6 px-4 py-3 text-xs text-text-muted uppercase tracking-wide border-b border-surface-border bg-surface-card sticky top-0">
            <span>Date</span>
            <span>Merchant</span>
            <span>Category</span>
            <span>Bank</span>
            <span>Direction</span>
            <span className="text-right">Amount</span>
          </div>
          {filtered.map((t) => (
            <div key={t.id} className="group relative">
              <TransactionRow transaction={t} view="table" />
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-danger text-xs px-2 py-1 rounded hover:bg-danger/10 transition-opacity"
                title="Delete transaction"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="sm:hidden">
          {filtered.map((t) => (
            <TransactionRow key={t.id} transaction={t} view="list" />
          ))}
        </div>
      </Card>

      <p className="text-text-muted text-sm mt-4">
        Showing {filtered.length} of {legacyTxns.length} transactions
      </p>
    </>
  );
}
