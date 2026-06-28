'use client';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'accent';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 rounded-btn px-6 py-3.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary:
      'bg-primary text-white shadow-glow hover:-translate-y-0.5',
    ghost:
      'bg-transparent border border-surface-border text-text-primary hover:bg-surface-elevated',
    accent: 'bg-accent text-surface-bg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
