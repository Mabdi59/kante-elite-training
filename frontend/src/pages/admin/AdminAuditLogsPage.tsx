import { useEffect, useState } from 'react'
import { getAuditLogs } from '../../services/api'
import type { AuditLog } from '../../types'

const actionColor: Record<string, string> = {
  CREATE: 'text-green-400 bg-green-500/10',
  UPDATE: 'text-blue-400 bg-blue-500/10',
  UPDATE_STATUS: 'text-yellow-400 bg-yellow-500/10',
  DELETE: 'text-red-400 bg-red-500/10',
  CANCEL: 'text-red-400 bg-red-500/10',
  RESCHEDULE: 'text-purple-400 bg-purple-500/10',
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEntity, setFilterEntity] = useState('')

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const entities = [...new Set(logs.map((l) => l.entity))].sort()

  const filtered = logs.filter(
    (l) => !filterEntity || l.entity === filterEntity,
  )

  if (loading) return <div className="text-gray-400">Loading audit logs…</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-white text-3xl font-black">Audit Logs</h1>
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All entities</option>
          {entities.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Last 100 actions · {filtered.length} shown
      </p>

      {filtered.length === 0 ? (
        <p className="text-gray-400">No audit log entries yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const cls = actionColor[log.action] ?? 'text-gray-400 bg-gray-800'
            return (
              <div
                key={log.id}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>
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
