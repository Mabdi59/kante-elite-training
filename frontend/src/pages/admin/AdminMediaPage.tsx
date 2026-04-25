import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createMediaPost, deleteMediaPost, getMediaPosts, updateMediaPost } from '../../services/api'
import type { MediaCategory, MediaPost, MediaPostUpdateFormData, MediaType } from '../../types'
import CategoryBadge, { CATEGORY_OPTIONS, getCategoryLabel } from '../../components/CategoryBadge'
import ErrorBanner from '../../components/ErrorBanner'
import EmptyState from '../../components/EmptyState'
import MediaPostCard from '../../components/MediaPostCard'
import PageSkeleton from '../../components/PageSkeleton'

const MAX_MEDIA_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
const MAX_CAPTION_LENGTH = 500

type FilterCategory = MediaCategory | 'ALL'

function getPreviewType(file: File): MediaType {
  return file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
}

function formatFileSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMediaPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [posts, setPosts] = useState<MediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState<MediaCategory | ''>('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [error, setError] = useState('')
  const [postPendingDelete, setPostPendingDelete] = useState<MediaPost | null>(null)

  // Edit state
  const [editingPost, setEditingPost] = useState<MediaPost | null>(null)
  const [editForm, setEditForm] = useState<MediaPostUpdateFormData>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMediaPosts()
      .then(setPosts)
      .catch(() => setError('Could not load the media library.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const previewPost = useMemo<MediaPost | null>(() => {
    if (!selectedFile || !previewUrl) return null
    return {
      id: 0,
      mediaUrl: previewUrl,
      mediaType: getPreviewType(selectedFile),
      caption: caption.trim() || 'Preview',
      featured: false,
      showOnHome: false,
      showOnAbout: false,
      mediaCategory: category || undefined,
      createdAt: new Date().toISOString(),
    }
  }, [caption, category, previewUrl, selectedFile])

  const filteredPosts = useMemo(() => {
    if (filterCategory === 'ALL') return posts
    return posts.filter((p) => p.mediaCategory === filterCategory)
  }, [posts, filterCategory])

  const resetForm = () => {
    setSelectedFile(null)
    setCaption('')
    setCategory('')
    setFileInputKey((prev) => prev + 1)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setFileInputKey((prev) => prev + 1)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setSelectedFile(null)
      setFileInputKey((prev) => prev + 1)
      setError('Only JPG, PNG, WEBP, and MP4 uploads are supported.')
      return
    }

    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setSelectedFile(null)
      setFileInputKey((prev) => prev + 1)
      setError('Media files must be 20 MB or smaller.')
      return
    }

    setSelectedFile(file)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedFile) return
    if (!category) {
      setError('Please select a category before posting.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const created = await createMediaPost(selectedFile, caption, category)
      setPosts((prev) => [created, ...prev])
      resetForm()
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { error?: string } } })?.response
      const message =
        response?.status === 413
          ? 'This file is too large to upload. Please keep media files at 20 MB or smaller.'
          : response?.data?.error ?? 'Could not upload this media post.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (post: MediaPost) => {
    setDeletingId(post.id)
    setError('')
    try {
      await deleteMediaPost(post.id)
      setPosts((prev) => prev.filter((item) => item.id !== post.id))
      setPostPendingDelete(null)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not delete this media post.'
      setError(message)
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (post: MediaPost) => {
    setEditingPost(post)
    setEditForm({
      caption: post.caption ?? '',
      featured: post.featured,
      showOnHome: post.showOnHome,
      showOnAbout: post.showOnAbout,
      mediaCategory: post.mediaCategory,
      clearMediaCategory: false,
    })
  }

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingPost) return
    setSaving(true)
    setError('')
    try {
      const updated = await updateMediaPost(editingPost.id, editForm)
      setPosts((prev) => prev.map((item) => (item.id === editingPost.id ? updated : item)))
      setEditingPost(null)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not save changes to this post.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageSkeleton titleWidthClassName="w-48" count={6} />
  }

  return (
    <div>
      <div className="panel-header">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Media</h1>
            <p className="mt-1 text-sm text-gray-400">
              Upload photos and videos to keep the public feed fresh with training highlights.
            </p>
          </div>
          <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
            {posts.length} post{posts.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Create Post</h2>
              <p className="mt-1 text-sm text-gray-400">
                JPG, PNG, WEBP, and MP4 are supported. Max file size is 20 MB.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MediaCategory | '')}
                  required
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
                >
                  <option value="">Select a category…</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Media File</label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-700 bg-black px-6 py-8 text-center transition-colors hover:border-cyan-400/40">
                  <span className="text-sm font-semibold text-white">
                    {selectedFile ? selectedFile.name : 'Choose an image or MP4 file'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Click to browse your computer and preview before posting.
                  </span>
                  <span className="text-xs text-gray-500">
                    Accepted formats: JPG, PNG, WEBP, MP4. Up to 20 MB.
                  </span>
                  <input
                    ref={fileInputRef}
                    key={fileInputKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFile ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-black px-4 py-3">
                    <div className="text-sm text-gray-300">
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {getPreviewType(selectedFile)} · {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : null}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm text-gray-400">Caption</label>
                  <span className="text-xs text-gray-500">{caption.length} / {MAX_CAPTION_LENGTH}</span>
                </div>
                <textarea
                  rows={5}
                  maxLength={MAX_CAPTION_LENGTH}
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Describe the moment, the session focus, or the event highlight."
                  className="w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 sm:w-auto"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!selectedFile || !category || uploading}
                className="w-full rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" /> : null}
                  {uploading ? 'Posting...' : 'Post to Feed'}
                </span>
              </button>
            </div>
          </form>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Preview</h2>
              <p className="mt-1 text-sm text-gray-400">
                Review how the post will look before you publish it.
              </p>
            </div>

            {previewPost ? (
              <MediaPostCard
                post={previewPost}
                imageLoading="eager"
                imageFetchPriority="high"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-700 bg-black px-4 py-14 text-center text-sm text-gray-500">
                Select a file to preview how your post will appear in the public feed.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Published Feed</h2>
                <p className="mt-1 text-sm text-gray-400">
                  The newest posts appear first. Use Content to place them on the homepage and about page.
                </p>
              </div>
              <Link
                to="/admin/content"
                className="w-full rounded-lg bg-gray-800 px-4 py-3 text-center text-sm font-semibold text-gray-200 hover:bg-gray-700 sm:w-auto"
              >
                Manage Placement
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(['ALL', ...CATEGORY_OPTIONS.map((o) => o.value)] as FilterCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterCategory === cat
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat === 'ALL' ? `All (${posts.length})` : `${getCategoryLabel(cat)} (${posts.filter((p) => p.mediaCategory === cat).length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState
              icon="Feed"
              title={filterCategory === 'ALL' ? 'No posts yet' : `No ${getCategoryLabel(filterCategory as MediaCategory)} posts`}
              description={
                filterCategory === 'ALL'
                  ? 'Upload your first training clip or event moment to start building the public highlight feed.'
                  : 'No posts in this category yet. Upload a new post and assign it to this category.'
              }
              action={
                filterCategory === 'ALL' ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                  >
                    Upload your first post
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFilterCategory('ALL')}
                    className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                  >
                    View all posts
                  </button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <div key={post.id} className="space-y-3">
                  <MediaPostCard
                    post={post}
                    imageLoading={index < 4 ? 'eager' : 'lazy'}
                    imageFetchPriority={index < 2 ? 'high' : 'auto'}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="flex-1 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 sm:flex-none"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === post.id}
                      onClick={() => setPostPendingDelete(post)}
                      className="flex-1 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 sm:flex-none"
                    >
                      {deletingId === post.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {postPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                Confirm Delete
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">Delete this media post?</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                This will remove the post from the public feed and delete the uploaded file. This action cannot be undone.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-gray-300">
              {postPendingDelete.caption?.trim() || 'Untitled media post'}
              {postPendingDelete.mediaCategory ? (
                <div className="mt-2">
                  <CategoryBadge category={postPendingDelete.mediaCategory} />
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPostPendingDelete(null)}
                className="w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === postPendingDelete.id}
                onClick={() => handleDelete(postPendingDelete)}
                className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-50 sm:w-auto"
              >
                {deletingId === postPendingDelete.id ? 'Deleting...' : 'Delete post'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingPost ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Edit Post</p>
              <h3 className="mt-2 text-xl font-bold text-white">Update this media post</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Caption</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={editForm.caption ?? ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, caption: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Category</label>
                <select
                  value={editForm.mediaCategory ?? ''}
                  onChange={(e) => {
                    const val = e.target.value as MediaCategory | ''
                    if (val) {
                      setEditForm((prev) => ({ ...prev, mediaCategory: val, clearMediaCategory: false }))
                    } else {
                      setEditForm((prev) => ({ ...prev, mediaCategory: undefined, clearMediaCategory: true }))
                    }
                  }}
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
                >
                  <option value="">No category</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-800 bg-black p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Placement</p>
                {([
                  { key: 'featured', label: 'Featured (hero image on About page)' },
                  { key: 'showOnHome', label: 'Show on Homepage highlights' },
                  { key: 'showOnAbout', label: 'Show in About gallery' },
                ] as { key: keyof MediaPostUpdateFormData; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(editForm[key])}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-700 accent-cyan-500"
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
