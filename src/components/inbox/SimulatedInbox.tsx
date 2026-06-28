'use client';

import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/fetcher';
import { SIMULATED_EMAILS } from '@/lib/simulated-emails';
import { ParseResponse, SimulatedEmail } from '@/lib/types';
import ErrorBanner from '@/components/shared/ErrorBanner';
import EmailCard from './EmailCard';

interface ParseApiResponse extends ParseResponse {
  transaction_id: string | null;
  is_duplicate: boolean;
  warning?: string;
}

export default function SimulatedInbox() {
  const [emails, setEmails] = useState<SimulatedEmail[]>(SIMULATED_EMAILS);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [parsingAll, setParsingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseEmail = useCallback(async (id: string) => {
    const email = emails.find((e) => e.id === id);
    if (!email || email.parsed) return;

    setParsingId(id);
    setError(null);

    try {
      const result = await fetcher<ParseApiResponse>('/api/parse', {
        method: 'POST',
        body: JSON.stringify({
          raw_text: email.body,
          source: email.sender,
          input_type: 'email_body',
        }),
      });

      setEmails((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                parsed: true,
                parseResult: {
                  merchant_name: result.merchant_name,
                  amount_pkr: result.amount_pkr,
                  direction: result.direction,
                  payment_method: result.payment_method,
                  txn_date: result.txn_date,
                  category: result.category,
                  is_roman_urdu: result.is_roman_urdu,
                  confidence: result.confidence,
                  parsed_by: result.parsed_by,
                  is_duplicate: result.is_duplicate,
                  transaction_id: result.transaction_id,
                },
              }
            : e
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
    } finally {
      setParsingId(null);
    }
  }, [emails]);

  const parseAll = async () => {
    setParsingAll(true);
    setError(null);
    const unparsed = emails.filter((e) => !e.parsed);
    for (const email of unparsed) {
      await parseEmail(email.id);
    }
    setParsingAll(false);
  };

  const unprocessed = emails.filter((e) => !e.parsed);
  const processed = emails.filter((e) => e.parsed);

  return (
    <div>
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Simulated Inbox</h2>
          <p className="text-text-muted text-sm mt-1">
            {unprocessed.length} unparsed · {processed.length} processed
          </p>
        </div>
        {unprocessed.length > 0 && (
          <button
            type="button"
            onClick={parseAll}
            disabled={parsingAll || parsingId !== null}
            className="bg-accent text-surface-bg text-sm font-semibold px-5 py-2.5 rounded-btn disabled:opacity-50 flex items-center gap-2"
          >
            {parsingAll && (
              <span className="w-3.5 h-3.5 border-2 border-surface-bg/30 border-t-surface-bg rounded-full animate-spin" />
            )}
            Parse All
          </button>
        )}
      </div>

      {unprocessed.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Unprocessed
          </h3>
          <div className="space-y-3">
            {unprocessed.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onParse={parseEmail}
                parsing={parsingId === email.id}
              />
            ))}
          </div>
        </section>
      )}

      {processed.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Processed
          </h3>
          <div className="space-y-3">
            {processed.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onParse={parseEmail}
                parsing={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
