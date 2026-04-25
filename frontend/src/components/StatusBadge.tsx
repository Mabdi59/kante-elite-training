const presets: Record<string, string> = {
  // Booking statuses
  CONFIRMED: 'bg-green-500/10 text-green-400 border-green-500/20',
  RESERVED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
  COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  // Tournament & registration
  UPCOMING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  ONGOING: 'bg-green-500/10 text-green-400 border-green-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  WAITLISTED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  PAID: 'bg-green-500/10 text-green-400 border-green-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  NOT_REQUIRED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  // General
  OPEN: 'bg-green-500/10 text-green-400 border-green-500/20',
  CLOSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
  INACTIVE: 'bg-red-500/10 text-red-400 border-red-500/20',
  // Roles
  ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
  COACH: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  STAFF: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PARENT: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PLAYER: 'bg-green-500/10 text-green-400 border-green-500/20',
  TEAM_CAPTAIN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  USER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

interface Props {
  status: string
  className?: string
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function StatusBadge({ status, className = '' }: Props) {
  const cls = presets[status.toUpperCase()] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls} ${className}`}
    >
      {formatStatusLabel(status)}
    </span>
  )
}
