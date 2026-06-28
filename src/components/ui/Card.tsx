interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-card border border-surface-border rounded-card p-6 shadow-card ${
        onClick ? 'cursor-pointer hover:border-primary/30 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
