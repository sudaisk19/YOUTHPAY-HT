'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildStats } from '@/lib/aggregator';
import { fetcher } from '@/lib/fetcher';
import { isFallbackInsights } from '@/lib/insights-fallback';
import { InsightCard, TransactionRecord, TransactionStats } from '@/lib/types';

interface TransactionsResponse {
  transactions: TransactionRecord[];
}

interface InsightsResponse {
  insights: InsightCard[];
}

export function useTransactions(options?: { skipInsights?: boolean }) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    const txRes = await fetcher<TransactionsResponse>('/api/transactions');
    setTransactions(txRes.transactions);
    setStats(buildStats(txRes.transactions));
  }, []);

  const loadInsights = useCallback(async (refresh = false) => {
    setInsightsLoading(true);
    try {
      const insRes = await fetcher<InsightsResponse>('/api/insights', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });

      if (!refresh && isFallbackInsights(insRes.insights)) {
        const fresh = await fetcher<InsightsResponse>('/api/insights', {
          method: 'POST',
          body: JSON.stringify({ refresh: true }),
        });
        setInsights(fresh.insights);
        return;
      }

      setInsights(insRes.insights);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const load = useCallback(
    async (refreshInsights = false) => {
      setLoading(true);
      setError(null);
      try {
        await loadTransactions();
        if (!options?.skipInsights) {
          await loadInsights(refreshInsights);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    },
    [loadTransactions, loadInsights, options?.skipInsights]
  );

  useEffect(() => {
    load();
  }, [load]);

  const deleteTransaction = async (id: string) => {
    await fetcher(`/api/transactions/${id}`, { method: 'DELETE' });
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      setStats(buildStats(updated));
      return updated;
    });
    await loadInsights(true);
  };

  return {
    transactions,
    stats,
    insights,
    loading,
    insightsLoading,
    error,
    reload: () => load(false),
    refreshInsights: () => loadInsights(true),
    deleteTransaction,
    setError,
  };
}
