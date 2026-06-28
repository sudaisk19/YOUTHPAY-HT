interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  bottom?: string;
  bottomColor?: 'danger' | 'success' | 'warning';
  large?: boolean;
  children?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  sub,
  bottom,
  bottomColor,
  large = false,
  children,
}: StatCardProps) {
  const bottomColors = {
    danger: 'text-danger',
    success: 'text-success',
    warning: 'text-warning',
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-card p-6 shadow-card flex flex-col gap-2">
      <div className="text-text-muted text-sm">{label}</div>
      <div
        className={`text-text-primary font-bold ${large ? 'text-5xl' : 'text-2xl'}`}
      >
        {value}
      </div>
      {sub && <div className="text-text-muted text-xs">{sub}</div>}
      {children}
      {bottom && (
        <div
          className={`text-sm font-medium mt-2 ${
            bottomColor ? bottomColors[bottomColor] : 'text-text-muted'
          }`}
        >
          {bottom}
        </div>
      )}
    </div>
  );
}
