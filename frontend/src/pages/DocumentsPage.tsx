import { useEffect, useState } from 'react'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

interface Document {
  id: number
  fileName: string
  fileUrl: string
  docType: string
  uploadedAt: string
}

const DOC_TYPE_COLORS: Record<string, string> = {
  MEDICAL_FORM: 'bg-blue-500/20 text-blue-400',
  LIABILITY_WAIVER: 'bg-amber-500/20 text-amber-400',
  CONSENT_FORM: 'bg-purple-500/20 text-purple-400',
  CONTRACT: 'bg-green-500/20 text-green-400',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios
      .get('/api/documents/my', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setDocuments(r.data ?? []))
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <LoadingSpinner label="Loading documents…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Documents</h1>
        <p className="mt-1 text-sm text-gray-400">Your documents and forms.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {documents.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-gray-400">
          No documents found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-white/10 bg-zinc-900 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-2xl">📄</div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    DOC_TYPE_COLORS[doc.docType] ?? 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {doc.docType.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate">{doc.fileName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Download ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
