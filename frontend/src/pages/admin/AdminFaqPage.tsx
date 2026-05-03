import { useEffect, useState } from 'react'
import { createFaq, deleteFaq, getAdminFaqs, updateFaq } from '../../services/api'
import type { FaqItem, FaqItemFormData } from '../../types'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm: FaqItemFormData = {
  question: '',
  answer: '',
  category: '',
  active: true,
  featured: false,
  displayOrder: 0,
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FaqItemFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'FAQs | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    getAdminFaqs()
      .then(setFaqs)
      .catch(() => setError('Could not load FAQs. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (faq: FaqItem) => {
    setEditingId(faq.id)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? '',
      active: faq.active,
      featured: faq.featured,
      displayOrder: faq.displayOrder,
    })
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  const updateField = <K extends keyof FaqItemFormData>(field: K, value: FaqItemFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const payload = {
        ...form,
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category?.trim() || undefined,
        displayOrder: Math.max(0, Number(form.displayOrder) || 0),
      }
      if (editingId) {
        const updated = await updateFaq(editingId, payload)
        setFaqs((current) => current.map((faq) => (faq.id === editingId ? updated : faq)))
      } else {
        const created = await createFaq(payload)
        setFaqs((current) => [...current, created].sort((a, b) => a.displayOrder - b.displayOrder))
      }
      cancelForm()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not save this FAQ.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (faq: FaqItem) => {
    if (!window.confirm(`Delete "${faq.question}"?`)) return
    try {
      await deleteFaq(faq.id)
      setFaqs((current) => current.filter((item) => item.id !== faq.id))
    } catch {
      setError('Could not delete that FAQ.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading FAQs..." />

  return (
    <div>
      <div className="panel-header">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">FAQs</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage public questions for the FAQ page and featured training-page answers.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-black hover:bg-amber-400 sm:w-auto"
          >
            Add FAQ
          </button>
        </div>
      </div>

      {error ? <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div> : null}

      {showForm ? (
        <form onSubmit={handleSave} className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit FAQ' : 'Create FAQ'}</h2>
            <p className="mt-1 text-sm text-gray-400">Featured FAQs appear in compact public page sections.</p>
          </div>

          {saveError ? <div className="mb-4"><ErrorBanner message={saveError} onDismiss={() => setSaveError('')} /></div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm text-gray-400">Question</span>
              <input
                required
                maxLength={220}
                value={form.question}
                onChange={(event) => updateField('question', event.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm text-gray-400">Answer</span>
              <textarea
                required
                rows={5}
                maxLength={1200}
                value={form.answer}
                onChange={(event) => updateField('answer', event.target.value)}
                className="w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-gray-400">Category</span>
              <input
                maxLength={80}
                value={form.category ?? ''}
                onChange={(event) => updateField('category', event.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-gray-400">Display order</span>
              <input
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(event) => updateField('displayOrder', Math.max(0, Number(event.target.value) || 0))}
                className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => updateField('active', event.target.checked)}
                className="h-4 w-4 rounded border-gray-700 accent-amber-500"
              />
              Public
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField('featured', event.target.checked)}
                className="h-4 w-4 rounded border-gray-700 accent-amber-500"
              />
              Featured
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={cancelForm} className="rounded-lg bg-gray-800 px-5 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save FAQ'}
            </button>
          </div>
        </form>
      ) : null}

      {faqs.length === 0 ? (
        <EmptyState
          title="No FAQs yet"
          description="Create the first public FAQ for the help center."
          action={<button type="button" onClick={openCreate} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400">Add FAQ</button>}
        />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{faq.question}</h3>
                    {faq.category ? <span className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">{faq.category}</span> : null}
                    {!faq.active ? <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">Hidden</span> : null}
                    {faq.featured ? <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-300">Featured</span> : null}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-400">{faq.answer}</p>
                  <p className="mt-3 text-xs text-gray-500">Order #{faq.displayOrder}</p>
                </div>
                <div className="flex gap-2 lg:shrink-0">
                  <button type="button" onClick={() => openEdit(faq)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 lg:flex-none">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(faq)} className="flex-1 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 lg:flex-none">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
