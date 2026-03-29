import { useEffect, useState } from 'react'
import { getAuditLogs } from '../../services/api'
import type { AuditLog } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'

const actionColor: Record<string, string> = {
  CREATE: 'text-green-400 bg-green-500/10 border-green-500/20',
  UPDATE: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  UPDATE_STATUS: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
  CANCEL: 'text-red-400 bg-red-500/10 border-red-500/20',
  RESCHEDULE: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(() => setError('Failed to load audit logs.'))
      .finally(() => setLoading(false))
  }, [])

  const entities = [...new Set(logs.map((l) => l.entity))].sort()
  const actions = [...new Set(logs.map((l) => l.action))].sort()

  const filtered = logs.filter((l) => {
    if (filterEntity && l.entity !== filterEntity) return false
    if (filterAction && l.action !== filterAction) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !(l.details ?? '').toLowerCase().includes(q) &&
        !(l.userEmail ?? '').toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  if (loading) return <LoadingSpinner label="Loading audit logs…" />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-white text-3xl font-black">Audit Logs</h1>
        <p className="text-gray-500 text-sm">Last 100 actions · {filtered.length} shown</p>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search details or user…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-green-500"
        />
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All entities</option>
          {entities.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        {(filterEntity || filterAction || search) && (
          <button
            onClick={() => { setFilterEntity(''); setFilterAction(''); setSearch('') }}
            className="text-sm text-gray-500 hover:text-gray-300 px-2"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No audit log entries found" />
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const cls = actionColor[log.action] ?? 'text-gray-400 bg-gray-800 border-gray-700'
            return (
              <div
                key={log.id}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cls}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-600">{log.entity}</span>
                  {log.entityId && (
                    <span className="text-xs text-gray-600">#{log.entityId}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {log.details && (
                    <p className="text-gray-300 text-sm">{log.details}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-0.5">
                    {log.userEmail && <span>{log.userEmail} · </span>}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
