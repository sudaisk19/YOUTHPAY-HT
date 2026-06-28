import { TransactionRecord, TransactionStats } from '@/lib/types';

export function buildStats(transactions: TransactionRecord[]): TransactionStats {
  const categoryTotals: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};
  const merchantMap: Record<string, { total: number; count: number }> = {};

  let totalSpent = 0;
  let totalReceived = 0;
  let duplicateCount = 0;
  let weekendDebits = 0;
  let totalDebits = 0;

  for (const txn of transactions) {
    if (txn.is_duplicate) duplicateCount++;

    const amount = txn.amount_pkr ?? 0;

    if (txn.direction === 'debit') {
      totalSpent += amount;
      totalDebits++;

      const category = txn.category ?? 'Other';
      categoryTotals[category] = (categoryTotals[category] ?? 0) + amount;

      if (txn.txn_date) {
        const day = txn.txn_date.slice(0, 10);
        dailyTotals[day] = (dailyTotals[day] ?? 0) + amount;

        const dow = new Date(txn.txn_date).getDay();
        if (dow === 0 || dow === 6) weekendDebits++;
      }

      const merchant = txn.merchant_name ?? 'Unknown';
      if (!merchantMap[merchant]) {
        merchantMap[merchant] = { total: 0, count: 0 };
      }
      merchantMap[merchant].total += amount;
      merchantMap[merchant].count++;
    } else if (txn.direction === 'credit') {
      totalReceived += amount;
    }
  }

  const topMerchants = Object.entries(merchantMap)
    .map(([name, { total, count }]) => ({ name, total, count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const weekendRatio = totalDebits > 0 ? weekendDebits / totalDebits : 0;

  return {
    category_totals: categoryTotals,
    daily_totals: dailyTotals,
    top_merchants: topMerchants,
    weekend_ratio: weekendRatio,
    total_spent: totalSpent,
    total_received: totalReceived,
    duplicate_count: duplicateCount,
  };
}
