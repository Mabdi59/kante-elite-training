import { useEffect, useState } from 'react'
import api from '../services/api'
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
  MEDICAL_FORM: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  LIABILITY_WAIVER: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  CONSENT_FORM: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  CONTRACT: 'bg-green-500/15 text-green-400 border-green-500/20',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Document[]>('/documents/my')
      .then((r) => setDocuments(r.data ?? []))
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Loading documents…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Documents</h1>
        <p className="mt-1 text-sm text-gray-400">Your documents and forms.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] p-10 text-center text-gray-400">
          No documents found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-[#222] bg-[#111] p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${
                    DOC_TYPE_COLORS[doc.docType] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/20'
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
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-[#222] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
