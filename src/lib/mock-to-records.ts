import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_USER } from '@/lib/auth';
import { TransactionRecord } from '@/lib/types';
import type { Category, Transaction } from '@/types';

export function mockToTransactionRecords(): TransactionRecord[] {
  return MOCK_TRANSACTIONS.map((t) => ({
    id: String(t.id),
    user_id: DEMO_USER.userId,
    merchant_name: t.merchant,
    amount_pkr: t.amount,
    direction: t.direction,
    payment_method: t.bank,
    txn_date: t.date,
    category: t.category,
    is_roman_urdu: false,
    confidence: 1.0,
    parsed_by: 'regex' as const,
    is_duplicate: t.isDuplicate ?? false,
    raw_text: '',
    created_at: t.date,
  }));
}

export function recordToLegacyTransaction(record: TransactionRecord): Transaction {
  const category = (record.category ?? 'Other') as Category;

  return {
    id: parseInt(record.id.replace(/\D/g, '').slice(-8) || '0', 10) || Math.random(),
    date: record.txn_date?.slice(0, 10) ?? record.created_at.slice(0, 10),
    merchant: record.merchant_name ?? 'Unknown',
    amount: record.amount_pkr ?? 0,
    direction: record.direction ?? 'debit',
    bank: record.payment_method ?? '—',
    method: 'App',
    category,
    isDuplicate: record.is_duplicate,
  };
}

export function recordsToLegacyTransactions(
  records: TransactionRecord[]
): Transaction[] {
  return records.map(recordToLegacyTransaction);
}
