'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import TopHeader from '@/components/shared/TopHeader';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import CategoryBar from '@/components/ui/CategoryBar';
import CategoryIcon from '@/components/ui/CategoryIcon';
import InsightCard from '@/components/ui/InsightCard';
import TransactionRow from '@/components/ui/TransactionRow';
import {
  apiInsightToUi,
  computeHealthScore,
  formatDayLabel,
} from '@/lib/dashboard-utils';
import { recordsToLegacyTransactions } from '@/lib/mock-to-records';
import { CATEGORY_CONFIG, fmt } from '@/lib/mockData';
import { useTransactions } from '@/lib/use-transactions';

export default function TeenDashboard() {
  const [mounted, setMounted] = useState(false);
  const { transactions, stats, insights, loading, error, setError } =
    useTransactions();

  useEffect(() => {
    setMounted(true);
  }, []);

  const legacyTxns = useMemo(
    () => recordsToLegacyTransactions(transactions),
    [transactions]
  );

  const categoryTotals = stats?.category_totals ?? {};
  const sortedCats = Object.entries(categoryTotals)
    .filter(([k]) => k !== 'Allowance')
    .sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCats[0]?.[1] ?? 1;

  const dailySpending = useMemo(() => {
    if (!stats?.daily_totals) return [];
    return Object.entries(stats.daily_totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        day: formatDayLabel(date),
        amount,
      }));
  }, [stats]);

  const maxDay = Math.max(...dailySpending.map((d) => d.amount), 1);
  const recent = [...legacyTxns].slice(-5).reverse();

  const totalSpent = stats?.total_spent ?? 0;
  const totalReceived = stats?.total_received ?? 0;
  const healthScore = computeHealthScore(
    totalSpent,
    totalReceived,
    stats?.duplicate_count ?? 0
  );
  const topCategory = sortedCats[0];
  const utilization =
    totalReceived > 0
      ? Math.round((totalSpent / totalReceived) * 100)
      : 0;

  const uiInsights = insights.slice(0, 4).map(apiInsightToUi);

  if (loading) {
    return (
      <>
        <TopHeader title="Dashboard" />
        <LoadingSpinner label="Loading dashboard..." />
      </>
    );
  }

  return (
    <>
      <TopHeader title="Dashboard" />
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Spent"
          value={fmt(totalSpent)}
          sub="This month"
          bottom={
            totalSpent > 0
              ? `${transactions.filter((t) => t.direction === 'debit').length} transactions`
              : undefined
          }
          bottomColor="danger"
        />
        <StatCard
          label="Allowance Received"
          value={fmt(totalReceived)}
          sub="Credits this month"
          bottom={totalReceived > 0 ? `${utilization}% utilization` : undefined}
          bottomColor="warning"
        />
        <StatCard
          label="Top Category"
          value={
            topCategory ? (
              <span className="flex items-center gap-2">
                <CategoryIcon category={topCategory[0]} size={24} />
                {topCategory[0]}
              </span>
            ) : (
              '—'
            )
          }
          sub={
            topCategory ? `${fmt(topCategory[1])} spent` : 'No spending yet'
          }
        />
        <StatCard label="Financial Health" value="" large={false}>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary font-bold text-5xl">
              {healthScore}
            </span>
            <span className="text-text-muted text-xl">/100</span>
            <span className="ml-2 bg-accent text-surface-bg text-xs font-semibold px-2.5 py-0.5 rounded-pill">
              {healthScore >= 70 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'}
            </span>
          </div>
          <div className="h-1.5 bg-surface-elevated rounded-pill overflow-hidden mt-2">
            <div
              className="h-full bg-primary rounded-pill transition-all duration-700"
              style={{ width: mounted ? `${healthScore}%` : '0%' }}
            />
          </div>
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Where&apos;s it going?
          </h3>
          {sortedCats.length === 0 ? (
            <p className="text-text-muted text-sm">No spending data yet.</p>
          ) : (
            sortedCats.map(([name, amt]) => {
              const cfg = CATEGORY_CONFIG[name] ?? CATEGORY_CONFIG.Other;
              return (
                <CategoryBar
                  key={name}
                  category={name}
                  amount={amt}
                  maxAmount={maxCat}
                  color={cfg.color}
                />
              );
            })
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-text-primary">
              Daily Spending
            </h3>
            <span className="text-text-muted text-xs">This month</span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {dailySpending.length === 0 ? (
              <p className="text-text-muted text-sm">No daily data yet.</p>
            ) : (
              dailySpending.map((d) => {
                const heightPct = maxDay ? (d.amount / maxDay) * 100 : 0;
                const isHighest = d.amount === maxDay && d.amount > 0;
                return (
                  <div
                    key={d.day}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        d.amount === 0
                          ? 'h-1 bg-surface-elevated'
                          : isHighest
                            ? 'bg-primary'
                            : 'bg-surface-elevated'
                      }`}
                      style={{
                        height:
                          mounted && d.amount > 0
                            ? `${Math.max(heightPct, 4)}%`
                            : d.amount === 0
                              ? '4px'
                              : '0%',
                      }}
                    />
                    <span className="text-[10px] text-text-muted">{d.day}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text-primary">
          Insights for you
        </h3>
        <Link href="/insights" className="text-primary text-sm font-semibold">
          See all →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x [&::-webkit-scrollbar]:hidden mb-8">
        {uiInsights.map((insight) => (
          <InsightCard key={insight.title} {...insight} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-text-primary">
          Recent Transactions
        </h3>
        <Link href="/transactions" className="text-primary text-sm font-semibold">
          View all →
        </Link>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="hidden sm:block">
          <div className="grid grid-cols-6 px-4 py-3 text-xs text-text-muted uppercase tracking-wide border-b border-surface-border">
            <span>Date</span>
            <span>Merchant</span>
            <span>Category</span>
            <span>Bank</span>
            <span>Method</span>
            <span className="text-right">Amount</span>
          </div>
          {recent.map((t) => (
            <TransactionRow key={t.id} transaction={t} view="table" />
          ))}
        </div>
        <div className="sm:hidden">
          {recent.map((t) => (
            <TransactionRow key={t.id} transaction={t} view="list" />
          ))}
        </div>
      </Card>
    </>
  );
}
