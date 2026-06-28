export interface CsvTransactionRow {
  merchant_name: string;
  amount_pkr: number;
  direction: 'debit' | 'credit';
  payment_method: string;
  txn_date: string;
  category: string;
}

const HEADER_ALIASES: Record<string, keyof CsvTransactionRow | 'skip'> = {
  date: 'txn_date',
  txn_date: 'txn_date',
  transaction_date: 'txn_date',
  merchant: 'merchant_name',
  merchant_name: 'merchant_name',
  description: 'merchant_name',
  amount: 'amount_pkr',
  amount_pkr: 'amount_pkr',
  pkr: 'amount_pkr',
  direction: 'direction',
  type: 'direction',
  bank: 'payment_method',
  payment_method: 'payment_method',
  method: 'payment_method',
  category: 'category',
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseDirection(raw: string): 'debit' | 'credit' | null {
  const v = raw.trim().toLowerCase();
  if (['debit', 'dr', 'd', 'spent', 'payment', 'out'].includes(v)) return 'debit';
  if (['credit', 'cr', 'c', 'received', 'in'].includes(v)) return 'credit';
  return null;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.abs(n) : null;
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCsvTransactions(csvText: string): {
  rows: CsvTransactionRow[];
  errors: string[];
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must have a header row and at least one data row'] };
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const columnMap: (keyof CsvTransactionRow | null)[] = headers.map((h) => {
    const alias = HEADER_ALIASES[h];
    return alias && alias !== 'skip' ? alias : null;
  });

  const hasMerchant = columnMap.includes('merchant_name');
  const hasAmount = columnMap.includes('amount_pkr');
  if (!hasMerchant || !hasAmount) {
    return {
      rows: [],
      errors: ['CSV must include Merchant and Amount columns'],
    };
  }

  const rows: CsvTransactionRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const record: Partial<CsvTransactionRow> = {};

    columnMap.forEach((field, idx) => {
      if (field && values[idx] !== undefined) {
        (record as Record<string, string>)[field] = values[idx];
      }
    });

    const merchant = record.merchant_name?.trim();
    const amount = record.amount_pkr ? parseAmount(String(record.amount_pkr)) : null;
    const direction = record.direction
      ? parseDirection(String(record.direction))
      : 'debit';
    const txnDate = record.txn_date
      ? parseDate(String(record.txn_date))
      : new Date().toISOString();

    if (!merchant) {
      errors.push(`Row ${i + 1}: missing merchant`);
      continue;
    }
    if (amount === null) {
      errors.push(`Row ${i + 1}: invalid amount`);
      continue;
    }
    if (!direction) {
      errors.push(`Row ${i + 1}: invalid direction (use debit/credit)`);
      continue;
    }
    if (!txnDate) {
      errors.push(`Row ${i + 1}: invalid date`);
      continue;
    }

    rows.push({
      merchant_name: merchant,
      amount_pkr: amount,
      direction,
      payment_method: record.payment_method?.trim() || 'App',
      txn_date: txnDate,
      category: record.category?.trim() || 'Other',
    });
  }

  return { rows, errors };
}
