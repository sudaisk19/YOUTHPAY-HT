'use client';

import { SimulatedEmail } from '@/lib/types';
import ParseButton, { ParseResultCard } from './ParseButton';

interface EmailCardProps {
  email: SimulatedEmail;
  onParse: (id: string) => Promise<void>;
  parsing: boolean;
}

export default function EmailCard({ email, onParse, parsing }: EmailCardProps) {
  const preview =
    email.body.length > 60 ? `${email.body.slice(0, 60)}…` : email.body;

  return (
    <div
      className={`bg-surface-card border rounded-card p-4 transition-colors ${
        email.parsed ? 'border-success/30' : 'border-surface-border'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-text-muted text-xs truncate">{email.sender}</div>
          <div className="text-text-primary font-semibold text-sm mt-0.5">
            {email.subject}
          </div>
          <div className="text-text-muted text-xs mt-1">
            {new Date(email.timestamp).toLocaleString('en-PK', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <p className="text-text-secondary text-xs mt-2 leading-relaxed">
            {preview}
          </p>
        </div>
        <ParseButton
          onParse={() => onParse(email.id)}
          loading={parsing}
          parsed={email.parsed}
        />
      </div>
      {email.parseResult && <ParseResultCard result={email.parseResult} />}
    </div>
  );
}
