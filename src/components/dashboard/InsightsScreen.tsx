'use client';

import { useMemo, useState } from 'react';
import TopHeader from '@/components/shared/TopHeader';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Card from '@/components/ui/Card';
import InsightCard from '@/components/ui/InsightCard';
import Button from '@/components/ui/Button';
import {
  apiInsightToUi,
  computeHealthScore,
} from '@/lib/dashboard-utils';
import { CATEGORY_CONFIG, fmt } from '@/lib/mockData';
import { useTransactions } from '@/lib/use-transactions';

export default function InsightsScreen() {
  const { stats, insights, loading, insightsLoading, error, setError, refreshInsights } =
    useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  const categoryTotals = stats?.category_totals ?? {};
  const total = Object.values(categoryTotals).reduce((s, n) => s + n, 0);
  const healthScore = computeHealthScore(
    stats?.total_spent ?? 0,
    stats?.total_received ?? 0,
    stats?.duplicate_count ?? 0
  );

  const uiInsights = useMemo(
    () => insights.map(apiInsightToUi),
    [insights]
  );

  const savingRate =
    stats && stats.total_received > 0
      ? Math.round(
          ((stats.total_received - stats.total_spent) / stats.total_received) * 100
        )
      : null;

  const weekendPct = stats
    ? Math.round(stats.weekend_ratio * 100)
    : 0;

  const donutBg = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) return 'conic-gradient(#5B4CF5 0% 100%)';
    let cumulative = 0;
    const stops = entries.map(([k, v]) => {
      const pct = total > 0 ? (v / total) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      const color = CATEGORY_CONFIG[k]?.color ?? '#5B4CF5';
      return `${color} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [categoryTotals, total]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh insights');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopHeader title="Insights" />
        <LoadingSpinner label="Loading insights..." />
      </>
    );
  }

  return (
    <>
      <TopHeader
        title="Insights"
        right={
          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={refreshing || insightsLoading}
            className="!px-3 !py-1.5 text-sm"
          >
            {refreshing || insightsLoading ? 'Refreshing...' : 'Refresh insights'}
          </Button>
        }
      />
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <div className="bg-surface-card border border-primary/20 rounded-card p-8 mb-6 lg:flex gap-8 items-center">
        <div>
          <div className="text-text-muted text-sm mb-2">Financial Health Score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary font-bold text-7xl">
              {healthScore}
            </span>
            <span className="text-text-muted text-3xl">/100</span>
          </div>
          <span className="inline-block mt-2 bg-accent text-surface-bg text-xs font-semibold px-2.5 py-0.5 rounded-pill">
            {healthScore >= 70 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'}
          </span>
          <p className="text-text-muted text-xs mt-3">
            Based on {stats?.total_spent ? fmt(stats.total_spent) : 'PKR 0'} spent this month
          </p>
        </div>
        <div className="flex-1 mt-6 lg:mt-0 space-y-4">
          {[
            {
              label: 'Saving Rate',
              value: savingRate !== null ? `${savingRate}%` : 'No income data',
              pct: savingRate !== null ? Math.max(0, Math.min(100, savingRate)) : 0,
              color: savingRate !== null && savingRate >= 0 ? 'bg-success' : 'bg-danger',
            },
            {
              label: 'Spending Control',
              value:
                stats && stats.total_received > 0 && stats.total_spent > stats.total_received
                  ? 'Over budget'
                  : 'On track',
              pct:
                stats && stats.total_received > 0
                  ? Math.min(100, Math.round((stats.total_spent / stats.total_received) * 100))
                  : 50,
              color:
                stats && stats.total_spent > stats.total_received
                  ? 'bg-danger'
                  : 'bg-success',
            },
            {
              label: 'Weekend Spending',
              value: `${weekendPct}% of debits`,
              pct: weekendPct,
              color: weekendPct > 40 ? 'bg-warning' : 'bg-success',
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-muted">{item.label}</span>
                <span className="text-text-secondary">{item.value}</span>
              </div>
              <div className="h-1.5 bg-surface-elevated rounded-pill overflow-hidden">
                <div
                  className={`h-full rounded-pill ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-4">
            AI Insights
          </h3>
          <p className="text-text-muted text-xs mb-4">
            Generated from your transaction stats via Gemini. Click Refresh after importing new data.
          </p>
          <div className="space-y-3">
            {uiInsights.length > 0 ? (
              uiInsights.map((insight) => (
                <InsightCard key={insight.title} {...insight} />
              ))
            ) : (
              <p className="text-text-muted text-sm">
                No insights yet. Add transactions via Inbox, Upload, or CSV, then click Refresh insights.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Where did it go?
          </h3>
          {Object.keys(categoryTotals).length === 0 ? (
            <p className="text-text-muted text-sm">No spending data yet.</p>
          ) : (
            <div className="flex flex-col items-center">
              <div
                className="relative w-44 h-44 rounded-full mb-4"
                style={{ background: donutBg }}
              >
                <div className="absolute inset-0 w-28 h-28 m-auto bg-surface-card rounded-full flex items-center justify-center text-xs text-center">
                  <div>
                    <div className="font-bold text-lg">{fmt(total)}</div>
                    <div className="text-text-muted">Total</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {Object.entries(categoryTotals).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: CATEGORY_CONFIG[k]?.color ?? '#5B4CF5',
                      }}
                    />
                    <span className="text-text-secondary flex-1">{k}</span>
                    <span className="text-text-muted">
                      {total > 0 ? ((v / total) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {stats && stats.duplicate_count > 0 && (
        <Card className="mt-6">
          <h3 className="text-base font-semibold text-text-primary mb-2">
            Duplicate Transactions
          </h3>
          <p className="text-text-secondary text-sm">
            {stats.duplicate_count} possible duplicate
            {stats.duplicate_count > 1 ? 's' : ''} detected this month.
          </p>
        </Card>
      )}
    </>
  );
}
