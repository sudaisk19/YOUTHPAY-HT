interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'category' | 'bank' | 'method' | 'direction' | 'duplicate';
  direction?: 'debit' | 'credit';
}

export default function Badge({
  children,
  color,
  variant = 'category',
  direction,
}: BadgeProps) {
  if (variant === 'bank') {
    return <span className="text-text-muted text-xs">{children}</span>;
  }

  if (variant === 'method') {
    return (
      <span className="bg-surface-elevated text-text-secondary rounded-pill px-2 py-0.5 text-xs">
        {children}
      </span>
    );
  }

  if (variant === 'direction') {
    const isCredit = direction === 'credit';
    return (
      <span
        className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${
          isCredit
            ? 'bg-success/15 text-success'
            : 'bg-danger/15 text-danger'
        }`}
      >
        {children}
      </span>
    );
  }

  if (variant === 'duplicate') {
    return (
      <span className="bg-danger/10 text-danger rounded-pill px-2 py-0.5 text-xs border border-danger/20">
        {children}
      </span>
    );
  }

  return (
    <span
      className="rounded-pill px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {children}
    </span>
  );
}
