interface InsightCardProps {
  type: 'warning' | 'success' | 'danger' | 'info';
  icon: string;
  title: string;
  body: string;
}

const typeStyles = {
  warning: 'border-l-warning bg-warning/5',
  success: 'border-l-success bg-success/5',
  danger: 'border-l-danger bg-danger/5',
  info: 'border-l-primary bg-primary/5',
};

const badgeStyles = {
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
  danger: 'bg-danger/20 text-danger',
  info: 'bg-primary/20 text-primary',
};

export default function InsightCard({
  type,
  icon,
  title,
  body,
}: InsightCardProps) {
  return (
    <div
      className={`rounded-card p-4 border border-surface-border border-l-4 min-w-[200px] flex-shrink-0 ${typeStyles[type]}`}
    >
      <span
        className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-pill mb-2 ${badgeStyles[type]}`}
      >
        {icon}
      </span>
      <h4 className="text-sm font-semibold text-text-primary mb-1">{title}</h4>
      <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}
