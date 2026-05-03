import { useEffect, useMemo, useState } from 'react'
import { createCoachProfile, deleteCoachProfile, getAdminCoaches, getMediaPosts, updateCoachProfile } from '../../services/api'
import type { CoachProfile, CoachProfileFormData, MediaPost } from '../../types'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'
import MediaAsset from '../../components/MediaAsset'
import { getMediaAlt } from '../../utils/media'

const emptyForm: CoachProfileFormData = {
  displayName: '',
  roleTitle: '',
  bio: '',
  headshotMediaPostId: undefined,
  specialties: '',
  certifications: '',
  instagramUrl: '',
  websiteUrl: '',
  bookingUrl: '',
  featured: false,
  displayOrder: 0,
  active: true,
}

function toForm(coach: CoachProfile): CoachProfileFormData {
  return {
    displayName: coach.displayName,
    roleTitle: coach.roleTitle ?? '',
    bio: coach.bio ?? '',
    headshotMediaPostId: coach.headshotMediaPostId,
    specialties: coach.specialties ?? '',
    certifications: coach.certifications ?? '',
    instagramUrl: coach.instagramUrl ?? '',
    websiteUrl: coach.websiteUrl ?? '',
    bookingUrl: coach.bookingUrl ?? '',
    featured: coach.featured,
    displayOrder: coach.displayOrder,
    active: coach.active,
  }
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CoachProfileFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Coach Profiles | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    Promise.allSettled([getAdminCoaches(), getMediaPosts()])
      .then(([coachResult, mediaResult]) => {
        if (coachResult.status === 'fulfilled') setCoaches(coachResult.value)
        else setError('Could not load coaches.')
        if (mediaResult.status === 'fulfilled') setMediaPosts(mediaResult.value)
      })
      .finally(() => setLoading(false))
  }, [])

  const imageMediaPosts = useMemo(
    () => mediaPosts.filter((post) => post.mediaType === 'IMAGE'),
    [mediaPosts],
  )

  const selectedHeadshot = imageMediaPosts.find((post) => post.id === form.headshotMediaPostId)

  const updateField = <K extends keyof CoachProfileFormData>(field: K, value: CoachProfileFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (coach: CoachProfile) => {
    setEditingId(coach.id)
    setForm(toForm(coach))
    setSaveError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setSaveError('')
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setSaveError('')
    const payload: CoachProfileFormData = {
      ...form,
      displayName: form.displayName.trim(),
      roleTitle: form.roleTitle?.trim() || undefined,
      bio: form.bio?.trim() || undefined,
      specialties: form.specialties?.trim() || undefined,
      certifications: form.certifications?.trim() || undefined,
      instagramUrl: form.instagramUrl?.trim() || undefined,
      websiteUrl: form.websiteUrl?.trim() || undefined,
      bookingUrl: form.bookingUrl?.trim() || undefined,
      headshotMediaPostId: form.headshotMediaPostId || undefined,
      displayOrder: Math.max(0, Number(form.displayOrder) || 0),
    }

    try {
      if (editingId) {
        const updated = await updateCoachProfile(editingId, payload)
        setCoaches((current) => current.map((coach) => (coach.id === editingId ? updated : coach)))
      } else {
        const created = await createCoachProfile(payload)
        setCoaches((current) => [...current, created].sort((a, b) => a.displayOrder - b.displayOrder))
      }
      cancelForm()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not save this coach profile.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (coach: CoachProfile) => {
    if (!window.confirm(`Delete ${coach.displayName}?`)) return
    try {
      await deleteCoachProfile(coach.id)
      setCoaches((current) => current.filter((item) => item.id !== coach.id))
    } catch {
      setError('Could not delete that coach profile.')
    }
  }

  if (loading) return <LoadingSpinner label="Loading coaches..." />

  return (
    <div>
      <div className="panel-header">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Coach Profiles</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage public coach and staff profiles used across the homepage and about page.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-black hover:bg-amber-400 sm:w-auto">
            Add Coach
          </button>
        </div>
      </div>

      {error ? <div className="mb-6"><ErrorBanner message={error} onDismiss={() => setError('')} /></div> : null}

      {showForm ? (
        <form onSubmit={handleSave} className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Coach' : 'Create Coach'}</h2>
            <p className="mt-1 text-sm text-gray-400">Use uploaded image media as headshots for consistent site-wide visuals.</p>
          </div>

          {saveError ? <div className="mb-4"><ErrorBanner message={saveError} onDismiss={() => setSaveError('')} /></div> : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm text-gray-400">Name</span>
                <input required maxLength={120} value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Role/title</span>
                <input maxLength={120} value={form.roleTitle ?? ''} onChange={(event) => updateField('roleTitle', event.target.value)} className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-gray-400">Bio</span>
                <textarea rows={5} maxLength={1600} value={form.bio ?? ''} onChange={(event) => updateField('bio', event.target.value)} className="w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Specialties</span>
                <textarea rows={4} maxLength={500} value={form.specialties ?? ''} onChange={(event) => updateField('specialties', event.target.value)} className="w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" placeholder="One per line or comma separated" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Credentials/certifications</span>
                <textarea rows={4} maxLength={500} value={form.certifications ?? ''} onChange={(event) => updateField('certifications', event.target.value)} className="w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" placeholder="One per line or comma separated" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Instagram URL</span>
                <input maxLength={500} value={form.instagramUrl ?? ''} onChange={(event) => updateField('instagramUrl', event.target.value)} className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Website URL</span>
                <input maxLength={500} value={form.websiteUrl ?? ''} onChange={(event) => updateField('websiteUrl', event.target.value)} className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Booking URL</span>
                <input maxLength={500} value={form.bookingUrl ?? ''} onChange={(event) => updateField('bookingUrl', event.target.value)} className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" placeholder="/book" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-400">Display order</span>
                <input type="number" min={0} value={form.displayOrder} onChange={(event) => updateField('displayOrder', Math.max(0, Number(event.target.value) || 0))} className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white" />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300">
                <input type="checkbox" checked={form.active} onChange={(event) => updateField('active', event.target.checked)} className="h-4 w-4 rounded border-gray-700 accent-amber-500" />
                Active/public
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300">
                <input type="checkbox" checked={form.featured} onChange={(event) => updateField('featured', event.target.checked)} className="h-4 w-4 rounded border-gray-700 accent-amber-500" />
                Featured
              </label>
            </div>

            <div className="rounded-xl border border-gray-800 bg-black p-4">
              <label>
                <span className="mb-2 block text-sm text-gray-400">Headshot media</span>
                <select
                  value={form.headshotMediaPostId ?? ''}
                  onChange={(event) => updateField('headshotMediaPostId', event.target.value ? Number(event.target.value) : undefined)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white"
                >
                  <option value="">No headshot</option>
                  {imageMediaPosts.map((post) => (
                    <option key={post.id} value={post.id}>
                      #{post.id} {post.caption || post.altText || 'Untitled image'}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-4 aspect-[4/5] overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
                {selectedHeadshot ? (
                  <MediaAsset
                    src={selectedHeadshot.mediaUrl}
                    type={selectedHeadshot.mediaType}
                    alt={getMediaAlt(selectedHeadshot)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
                    Select an image from the media library.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={cancelForm} className="rounded-lg bg-gray-800 px-5 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Coach'}
            </button>
          </div>
        </form>
      ) : null}

      {coaches.length === 0 ? (
        <EmptyState title="No coach profiles yet" description="Create the first coach profile to power the public coach sections." action={<button type="button" onClick={openCreate} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400">Add Coach</button>} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {coaches.map((coach) => (
            <div key={coach.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex gap-4">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-800 bg-black">
                  {coach.headshotUrl ? (
                    <MediaAsset src={coach.headshotUrl} type={coach.headshotMediaType ?? 'IMAGE'} alt={`${coach.displayName} headshot`} className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg font-black text-amber-300">{coach.displayName.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{coach.displayName}</h3>
                    {coach.roleTitle ? <span className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">{coach.roleTitle}</span> : null}
                    {!coach.active ? <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">Hidden</span> : null}
                    {coach.featured ? <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-300">Featured</span> : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">{coach.bio || 'No bio yet.'}</p>
                  <p className="mt-3 text-xs text-gray-500">Order #{coach.displayOrder}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => openEdit(coach)} className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">Edit</button>
                <button type="button" onClick={() => handleDelete(coach)} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
