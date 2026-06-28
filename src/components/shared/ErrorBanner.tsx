interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-danger/10 border border-danger/30 rounded-card px-4 py-3 mb-4 flex items-center justify-between">
      <span className="text-danger text-sm">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-danger text-sm hover:underline ml-4"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
