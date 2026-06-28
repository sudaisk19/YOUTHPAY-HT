'use client';

import Link from 'next/link';
import TopHeader from '@/components/shared/TopHeader';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import InsightCard from '@/components/ui/InsightCard';
import { apiInsightToUi } from '@/lib/dashboard-utils';
import { fmt } from '@/lib/mockData';
import { useTransactions } from '@/lib/use-transactions';

export default function ParentDashboard() {
  const { transactions, stats, insights, loading, error, setError } =
    useTransactions();

  const spent = stats?.total_spent ?? 0;
  const allowance = stats?.total_received ?? 10000;
  const over = spent - allowance;
  const categoryTotals = stats?.category_totals ?? {};
  const totalCatSpend = Object.entries(categoryTotals)
    .filter(([k]) => k !== 'Allowance')
    .reduce((s, [, v]) => s + v, 0);
  const sortedCats = Object.entries(categoryTotals)
    .filter(([k]) => k !== 'Allowance')
    .sort((a, b) => b[1] - a[1]);

  const uiInsights = insights.slice(0, 4).map(apiInsightToUi);

  if (loading) {
    return (
      <>
        <TopHeader title="Parent View" />
        <LoadingSpinner label="Loading parent view..." />
      </>
    );
  }

  return (
    <>
      <TopHeader
        title="Parent View"
        right={
          <span className="bg-surface-elevated text-text-secondary text-sm px-3 py-1.5 rounded-pill">
            Viewing: Sudais
          </span>
        }
      />
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <Link
        href="/dashboard"
        className="inline-block mb-4 text-text-secondary text-xs font-semibold bg-surface-card border border-surface-border px-3.5 py-2 rounded-pill hover:text-primary transition-colors"
      >
        Switch to Teen
      </Link>

      {over > 0 && (
        <div className="bg-danger/10 border border-danger rounded-card p-4 mb-6">
          <strong className="text-danger text-sm">
            Sudais has exceeded the monthly allowance by {fmt(over)} (
            {Math.round((over / allowance) * 100)}% over budget)
          </strong>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Monthly Spending"
          value={fmt(spent)}
          sub={`vs ${fmt(allowance)} allowance`}
          bottom={over > 0 ? `+${fmt(over)} over` : 'Within budget'}
          bottomColor={over > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Transactions"
          value={String(transactions.length)}
          sub="this month"
          bottom={
            stats?.duplicate_count
              ? `${stats.duplicate_count} duplicate detected`
              : undefined
          }
          bottomColor="warning"
        />
        <StatCard
          label="Top Spend Area"
          value={sortedCats[0]?.[0] ?? '—'}
          sub={
            sortedCats[0]
              ? `${fmt(sortedCats[0][1])}${
                  sortedCats[0][0] === 'Education' ? ' — positive signal' : ''
                }`
              : 'No data'
          }
        />
        <StatCard label="Risk Level" value="Medium" sub="Based on spending patterns">
          <div className="h-1.5 bg-surface-elevated rounded-pill overflow-hidden mt-2">
            <div
              className="h-full bg-warning rounded-pill"
              style={{ width: over > 0 ? '75%' : '55%' }}
            />
          </div>
        </StatCard>
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-3">
        Spending Breakdown
      </h3>
      <Card className="p-0 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-text-muted text-xs uppercase">
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-right px-4 py-3">% of Spend</th>
                <th className="text-right px-4 py-3">vs Allowance</th>
              </tr>
            </thead>
            <tbody>
              {sortedCats.map(([k, v]) => {
                const pct = totalCatSpend > 0 ? (v / totalCatSpend) * 100 : 0;
                const positive = k === 'Education';
                const alert = pct > 10 && k === 'Entertainment';
                return (
                  <tr
                    key={k}
                    className={`border-b border-surface-border ${
                      positive
                        ? 'bg-success/5'
                        : alert
                          ? 'bg-warning/5'
                          : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-text-primary">{k}</td>
                    <td className="px-4 py-3 text-right">{fmt(v)}</td>
                    <td className="px-4 py-3 text-right text-text-muted">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted">
                      {allowance > 0
                        ? ((v / allowance) * 100).toFixed(0)
                        : '0'}
                      %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <h3 className="text-base font-semibold text-text-primary mb-3">
        Spending Alerts
      </h3>
      <div className="grid gap-3 mb-6">
        {uiInsights.length > 0 ? (
          uiInsights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
          ))
        ) : (
          <p className="text-text-muted text-sm">No spending alerts yet.</p>
        )}
      </div>
    </>
  );
}
