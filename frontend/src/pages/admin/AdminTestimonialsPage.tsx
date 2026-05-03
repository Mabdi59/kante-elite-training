import { useEffect, useMemo, useState } from 'react'
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getMediaPosts,
  getAdminPrograms,
  getAdminCoaches,
} from '../../services/api'
import type { CoachProfile, MediaPost, Program, Testimonial, TestimonialFormData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ErrorBanner from '../../components/ErrorBanner'
import MediaAsset from '../../components/MediaAsset'

const emptyForm: TestimonialFormData = {
  name: '',
  roleOrContext: '',
  storyTitle: '',
  quote: '',
  mediaPostId: undefined,
  playerMetadata: '',
  teamMetadata: '',
  programId: undefined,
  coachProfileId: undefined,
  rating: 5,
  featured: false,
  active: true,
  displayOrder: 0,
}

function toFormState(testimonial: Testimonial): TestimonialFormData {
  return {
    name: testimonial.name ?? '',
    roleOrContext: testimonial.roleOrContext ?? '',
    storyTitle: testimonial.storyTitle ?? '',
    quote: testimonial.quote ?? '',
    mediaPostId: testimonial.mediaPostId,
    playerMetadata: testimonial.playerMetadata ?? '',
    teamMetadata: testimonial.teamMetadata ?? '',
    programId: testimonial.programId,
    coachProfileId: testimonial.coachProfileId,
    rating: testimonial.rating ?? 5,
    featured: testimonial.featured ?? false,
    active: testimonial.active ?? true,
    displayOrder: testimonial.displayOrder ?? 0,
  }
}

function cleanPayload(form: TestimonialFormData): TestimonialFormData {
  return {
    ...form,
    name: form.name.trim(),
    roleOrContext: form.roleOrContext?.trim() || undefined,
    storyTitle: form.storyTitle?.trim() || undefined,
    quote: form.quote.trim(),
    playerMetadata: form.playerMetadata?.trim() || undefined,
    teamMetadata: form.teamMetadata?.trim() || undefined,
    mediaPostId: form.mediaPostId || undefined,
    programId: form.programId || undefined,
    coachProfileId: form.coachProfileId || undefined,
    rating: Math.max(1, Math.min(5, Number(form.rating) || 5)),
    displayOrder: Number(form.displayOrder) || 0,
  }
}

function selectedNumber(value: string) {
  return value ? Number(value) : undefined
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TestimonialFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    document.title = 'Testimonials | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

  useEffect(() => {
    Promise.allSettled([getAdminTestimonials(), getMediaPosts(), getAdminPrograms(), getAdminCoaches()])
      .then(([testimonialResult, mediaResult, programResult, coachResult]) => {
        if (testimonialResult.status === 'fulfilled') setTestimonials(testimonialResult.value)
        else setError('Could not load testimonials. Please refresh.')
        if (mediaResult.status === 'fulfilled') setMediaPosts(mediaResult.value)
        if (programResult.status === 'fulfilled') setPrograms(programResult.value)
        if (coachResult.status === 'fulfilled') setCoaches(coachResult.value)
      })
      .finally(() => setLoading(false))
  }, [])

  const imageMediaPosts = useMemo(
    () => mediaPosts.filter((post) => post.mediaType === 'IMAGE'),
    [mediaPosts],
  )

  const activeCount = testimonials.filter((testimonial) => testimonial.active).length
  const featuredCount = testimonials.filter((testimonial) => testimonial.featured && testimonial.active).length
  const averageRating = testimonials.length
    ? (testimonials.reduce((sum, testimonial) => sum + (testimonial.rating ?? 0), 0) / testimonials.length).toFixed(1)
    : 'New'

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setForm(toFormState(testimonial))
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

    try {
      const payload = cleanPayload(form)
      if (editingId) {
        const updated = await updateTestimonial(editingId, payload)
        setTestimonials((prev) => prev.map((testimonial) => (testimonial.id === editingId ? updated : testimonial)))
      } else {
        const created = await createTestimonial(payload)
        setTestimonials((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder))
      }
      cancelForm()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Save failed.'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this testimonial?')) return
    try {
      await deleteTestimonial(id)
      setTestimonials((prev) => prev.filter((testimonial) => testimonial.id !== id))
    } catch {
      setError('Could not remove that testimonial.')
    }
  }

  const set = <K extends keyof TestimonialFormData>(field: K, value: TestimonialFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) return <LoadingSpinner label="Loading testimonials..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-amber-400">Success Stories</p>
          <h1 className="mt-2 text-3xl font-black text-white">Testimonials</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
            Manage published family feedback, player outcomes, and proof points used across the public site.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
        >
          Add Story
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          ['Published', activeCount],
          ['Featured', featuredCount],
          ['Average Rating', averageRating],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className={`rounded-xl border bg-gray-900 p-6 ${editingId ? 'border-blue-500/40' : 'border-amber-500/30'}`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">
                {editingId ? 'Edit Success Story' : 'Add Success Story'}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Connect stories to media, services, and coaches so the public site can show richer proof.
              </p>
            </div>
            <button type="button" onClick={cancelForm} className="text-sm font-semibold text-gray-400 hover:text-white">
              Close
            </button>
          </div>

          {saveError && <div className="mb-5"><ErrorBanner message={saveError} onDismiss={() => setSaveError('')} /></div>}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Author Name *</label>
              <input
                required
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="e.g. Marcus T."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Role / Relationship</label>
              <input
                value={form.roleOrContext ?? ''}
                onChange={(event) => set('roleOrContext', event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="e.g. Parent of U14 player"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Story Title</label>
              <input
                value={form.storyTitle ?? ''}
                onChange={(event) => set('storyTitle', event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="e.g. More confidence in 6 weeks"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Author Image</label>
              <select
                value={form.mediaPostId ?? ''}
                onChange={(event) => set('mediaPostId', selectedNumber(event.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              >
                <option value="">No image</option>
                {imageMediaPosts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.caption || post.altText || `Image #${post.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm text-gray-400">Quote *</label>
              <textarea
                required
                rows={4}
                value={form.quote}
                onChange={(event) => set('quote', event.target.value)}
                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="What did they say about their experience?"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Player Metadata</label>
              <input
                value={form.playerMetadata ?? ''}
                onChange={(event) => set('playerMetadata', event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="e.g. U16 midfielder"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Team Metadata</label>
              <input
                value={form.teamMetadata ?? ''}
                onChange={(event) => set('teamMetadata', event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                placeholder="e.g. Club player / team captain"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Linked Program</label>
              <select
                value={form.programId ?? ''}
                onChange={(event) => set('programId', selectedNumber(event.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              >
                <option value="">No program link</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Linked Coach</label>
              <select
                value={form.coachProfileId ?? ''}
                onChange={(event) => set('coachProfileId', selectedNumber(event.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              >
                <option value="">No coach link</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>{coach.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Rating</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(event) => set('rating', Number(event.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Display Order</label>
              <input
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(event) => set('displayOrder', Number(event.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex flex-wrap gap-4 lg:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => set('featured', event.target.checked)}
                  className="h-4 w-4 accent-amber-500"
                />
                Featured on public sections
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => set('active', event.target.checked)}
                  className="h-4 w-4 accent-amber-500"
                />
                Active / published
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Story'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg bg-gray-700 px-6 py-2.5 text-sm text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {testimonials.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Add your first success story to power social proof across the public site."
          action={
            <button onClick={openCreate} className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black">
              Add Story
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
                  {testimonial.mediaUrl ? (
                    <MediaAsset
                      src={testimonial.mediaUrl}
                      type={testimonial.mediaType ?? 'IMAGE'}
                      alt={`${testimonial.name} testimonial`}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-black text-amber-400">
                      {testimonial.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{testimonial.name}</h3>
                    <span className="text-xs text-amber-400">{'*'.repeat(testimonial.rating ?? 5)}</span>
                    {testimonial.featured && (
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                        Featured
                      </span>
                    )}
                    {!testimonial.active && (
                      <span className="rounded-full border border-gray-600 bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{testimonial.roleOrContext || 'No relationship set'}</p>
                  {testimonial.storyTitle && (
                    <p className="mt-2 text-sm font-semibold text-white">{testimonial.storyTitle}</p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm italic text-gray-500">"{testimonial.quote}"</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                    {testimonial.programName && <span>Program: {testimonial.programName}</span>}
                    {testimonial.coachName && <span>Coach: {testimonial.coachName}</span>}
                    {testimonial.playerMetadata && <span>{testimonial.playerMetadata}</span>}
                    {testimonial.teamMetadata && <span>{testimonial.teamMetadata}</span>}
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col gap-2">
                  <button
                    onClick={() => openEdit(testimonial)}
                    className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                  >
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
