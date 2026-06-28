import type { Transaction } from '@/types';
import { CATEGORY_CONFIG, fmt, merchantInitial } from '@/lib/mockData';
import Badge from './Badge';

interface TransactionRowProps {
  transaction: Transaction;
  view?: 'table' | 'list';
}

export default function TransactionRow({
  transaction,
  view = 'table',
}: TransactionRowProps) {
  const cfg = CATEGORY_CONFIG[transaction.category];
  const color = cfg?.color ?? '#5B4CF5';

  if (view === 'list') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {merchantInitial(transaction.merchant)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-text-primary flex items-center gap-2">
            {transaction.merchant}
            {transaction.isDuplicate && (
              <Badge variant="duplicate">duplicate</Badge>
            )}
          </div>
          <div className="text-text-muted text-xs mt-0.5">
            Jun {transaction.date.slice(-2)} · {transaction.bank}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-semibold text-sm ${
              transaction.direction === 'debit' ? 'text-danger' : 'text-success'
            }`}
          >
            {transaction.direction === 'credit' ? '+' : '-'} {fmt(transaction.amount)}
          </div>
          <Badge color={color} variant="category">
            {transaction.category}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-6 items-center px-4 py-3 hover:bg-surface-elevated/50 border-b border-surface-border transition-colors ${
        transaction.isDuplicate ? 'bg-danger/5' : ''
      }`}
    >
      <span className="text-text-muted text-sm">
        Jun {transaction.date.slice(-2)}
      </span>
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {merchantInitial(transaction.merchant)}
        </div>
        <span className="text-sm font-medium text-text-primary flex items-center gap-2">
          {transaction.merchant}
          {transaction.isDuplicate && (
            <Badge variant="duplicate">duplicate</Badge>
          )}
        </span>
      </div>
      <Badge color={color} variant="category">
        {transaction.category}
      </Badge>
      <Badge variant="bank">{transaction.bank}</Badge>
      <Badge
        variant="direction"
        direction={transaction.direction}
      >
        {transaction.direction === 'credit' ? 'Credit' : 'Debit'}
      </Badge>
      <span
        className={`font-semibold text-sm text-right ${
          transaction.direction === 'debit' ? 'text-danger' : 'text-success'
        }`}
      >
        {transaction.direction === 'credit' ? '+ ' : '- '}
        {fmt(transaction.amount)}
      </span>
    </div>
  );
}
