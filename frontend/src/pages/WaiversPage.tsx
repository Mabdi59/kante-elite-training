import { useEffect, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

interface WaiverTemplate {
  id: number
  title: string
  content: string
  active: boolean
}

interface SignStatus {
  [templateId: number]: boolean
}

export default function WaiversPage() {
  const [templates, setTemplates] = useState<WaiverTemplate[]>([])
  const [signStatus, setSignStatus] = useState<SignStatus>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [signature, setSignature] = useState('')
  const [signing, setSigning] = useState<number | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get<WaiverTemplate[]>('/waivers/templates')
        const tmpls: WaiverTemplate[] = res.data ?? []
        setTemplates(tmpls)

        const statuses: SignStatus = {}
        await Promise.all(
          tmpls.map(async (t) => {
            try {
              const r = await api.get<{ signed: boolean }>(`/waivers/check/${t.id}`)
              statuses[t.id] = r.data?.signed ?? false
            } catch {
              statuses[t.id] = false
            }
          }),
        )
        setSignStatus(statuses)
      } catch {
        setError('Failed to load waivers.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleSign = async (templateId: number) => {
    if (!signature.trim()) return
    setSigning(templateId)
    try {
      await api.post('/waivers/sign', { templateId, signature })
      setSignStatus((prev) => ({ ...prev, [templateId]: true }))
      setExpandedId(null)
      setSignature('')
    } catch {
      setError('Failed to sign waiver.')
    } finally {
      setSigning(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading waivers…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Waivers</h1>
        <p className="mt-1 text-sm text-gray-400">Review and sign required waivers.</p>
      </div>

        {error && <ErrorBanner message={error} />}

        {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0f0f0f] p-10 text-center text-gray-400">
          No waivers available.
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => {
            const signed = signStatus[t.id]
            const expanded = expandedId === t.id
            return (
              <div key={t.id} className="rounded-xl border border-[#222] bg-[#111] p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-white">{t.title}</h2>
                  {signed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      Signed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : t.id)}
                      className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
                    >
                      {expanded ? 'Cancel' : 'Sign Waiver'}
                    </button>
                  )}
                </div>

                {expanded && !signed && (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg border border-[#2a2a2a] bg-black p-4 max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{t.content}</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-400">
                        Full Name (Signature)
                      </label>
                      <input
                        type="text"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="Type your full name"
                        className="input-field-default"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSign(t.id)}
                      disabled={!signature.trim() || signing === t.id}
                      className="btn-primary disabled:opacity-50"
                    >
                      {signing === t.id ? 'Signing…' : 'I agree and sign'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
