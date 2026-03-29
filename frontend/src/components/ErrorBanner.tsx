interface Props {
  message: string
  onDismiss?: () => void
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
      <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
      <p className="text-red-400 text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 text-sm flex-shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}
