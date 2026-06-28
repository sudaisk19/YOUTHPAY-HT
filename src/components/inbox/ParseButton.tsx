'use client';

import { ParseResponse } from '@/lib/types';

interface ParseButtonProps {
  onParse: () => Promise<void>;
  loading: boolean;
  parsed: boolean;
}

export default function ParseButton({ onParse, loading, parsed }: ParseButtonProps) {
  if (parsed) {
    return (
      <span className="text-success text-sm font-medium flex items-center gap-1">
        ✓ Parsed
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onParse}
      disabled={loading}
      className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-btn hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {loading ? 'Parsing...' : 'Parse'}
    </button>
  );
}

interface ParseResultCardProps {
  result: ParseResponse & { is_duplicate: boolean };
}

export function ParseResultCard({ result }: ParseResultCardProps) {
  const confidencePct = Math.round((result.confidence ?? 0) * 100);

  return (
    <div className="mt-3 bg-surface-elevated rounded-input p-3 text-sm space-y-1.5">
      <div className="flex justify-between">
        <span className="text-text-muted">Merchant</span>
        <span className="text-text-primary font-medium">
          {result.merchant_name ?? '—'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">Amount</span>
        <span
          className={
            result.direction === 'debit' ? 'text-danger font-semibold' : 'text-success font-semibold'
          }
        >
          PKR {result.amount_pkr?.toLocaleString('en-PK') ?? '—'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-text-muted">Category</span>
        <span className="text-text-primary">{result.category ?? '—'}</span>
      </div>
      {result.is_duplicate && (
        <div className="text-danger text-xs font-medium">Duplicate detected</div>
      )}
      <div>
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Confidence</span>
          <span>{confidencePct}%</span>
        </div>
        <div className="h-1.5 bg-surface-card rounded-pill overflow-hidden">
          <div
            className="h-full bg-primary rounded-pill transition-all"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
