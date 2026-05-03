import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createMediaPost,
  deleteMediaPost,
  getMediaPosts,
  replaceMediaPostFile,
  updateMediaPost,
} from '../../services/api'
import type { MediaCategory, MediaPlacementKey, MediaPost, MediaPostUpdateFormData, MediaType } from '../../types'
import CategoryBadge, { CATEGORY_OPTIONS, getCategoryLabel } from '../../components/CategoryBadge'
import ErrorBanner from '../../components/ErrorBanner'
import EmptyState from '../../components/EmptyState'
import MediaPostCard from '../../components/MediaPostCard'
import PageSkeleton from '../../components/PageSkeleton'
import SocialSharePanel from '../../components/SocialSharePanel'
import { MEDIA_PLACEMENT_OPTIONS, sortMediaPosts } from '../../utils/media'

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

function ExistingMediaPreview({ post }: { post: MediaPost }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex h-52 w-full flex-col items-center justify-center gap-2 bg-gray-950 px-4 text-center">
        <p className="text-sm font-semibold text-white">Preview unavailable</p>
        <p className="max-w-xs text-xs leading-relaxed text-gray-500">
          This saved media URL could not be loaded. Choose a new file from your computer to replace it.
        </p>
      </div>
    )
  }

  if (post.mediaType === 'VIDEO') {
    return (
      <video
        src={post.mediaUrl}
        controls
        onError={() => setFailed(true)}
        className="h-52 w-full bg-black object-contain"
      />
    )
  }

  return (
    <img
      src={post.mediaUrl}
      alt={post.altText || post.caption || 'Current media preview'}
      onError={() => setFailed(true)}
      className="h-52 w-full object-contain"
    />
  )
}

export default function AdminMediaPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [posts, setPosts] = useState<MediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [heroUpdatingId, setHeroUpdatingId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [altText, setAltText] = useState('')
  const [category, setCategory] = useState<MediaCategory | ''>('')
  const [createPlacements, setCreatePlacements] = useState<MediaPlacementKey[]>([])
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [error, setError] = useState('')
  const [postPendingDelete, setPostPendingDelete] = useState<MediaPost | null>(null)

  // Edit state
  const [editingPost, setEditingPost] = useState<MediaPost | null>(null)
  const [editForm, setEditForm] = useState<MediaPostUpdateFormData>({})
  const [editReplacementFile, setEditReplacementFile] = useState<File | null>(null)
  const [editReplacementPreviewUrl, setEditReplacementPreviewUrl] = useState('')
  const [editFileInputKey, setEditFileInputKey] = useState(0)
  const [replacingFile, setReplacingFile] = useState(false)
  const [saving, setSaving] = useState(false)


  useEffect(() => {
    document.title = 'Media | Kante Elite Training'
    return () => { document.title = 'Kante Elite Training' }
  }, [])

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

  useEffect(() => {
    if (!editReplacementFile) {
      setEditReplacementPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(editReplacementFile)
    setEditReplacementPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [editReplacementFile])

  const previewPost = useMemo<MediaPost | null>(() => {
    if (!selectedFile || !previewUrl) return null
    return {
      id: 0,
      mediaUrl: previewUrl,
      mediaType: getPreviewType(selectedFile),
      caption: caption.trim() || 'Preview',
      altText: altText.trim() || undefined,
      mediaCategory: category || undefined,
      placements: createPlacements.map((key) => ({ key, displayOrder: key === 'MEDIA_LIBRARY' ? 0 : 1 })),
      createdAt: new Date().toISOString(),
    }
  }, [altText, caption, category, createPlacements, previewUrl, selectedFile])

  const filteredPosts = useMemo(() => {
    const orderedPosts = sortMediaPosts(posts, 'feed')
    if (filterCategory === 'ALL') return orderedPosts
    return orderedPosts.filter((post) => post.mediaCategory === filterCategory)
  }, [posts, filterCategory])
  const homepageHeroPost = useMemo(
    () => sortMediaPosts(
      posts.filter((post) => post.mediaType === 'IMAGE' && post.placements?.some((placement) => placement.key === 'HOME_HERO')),
      'HOME_HERO',
    )[0] ?? null,
    [posts],
  )

  const resetForm = () => {
    setSelectedFile(null)
    setCaption('')
    setAltText('')
    setCategory('')
    setCreatePlacements([])
    setFileInputKey((prev) => prev + 1)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setFileInputKey((prev) => prev + 1)
  }

  const toggleCreatePlacement = (key: MediaPlacementKey, enabled: boolean) => {
    setCreatePlacements((current) => {
      if (!enabled) return current.filter((item) => item !== key)
      if (current.includes(key)) return current
      return [...current, key]
    })
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

  const handleEditReplacementFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setEditReplacementFile(null)
      return
    }

    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setEditReplacementFile(null)
      setEditFileInputKey((prev) => prev + 1)
      setError('Only JPG, PNG, WEBP, and MP4 uploads are supported.')
      return
    }

    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setEditReplacementFile(null)
      setEditFileInputKey((prev) => prev + 1)
      setError('Media files must be 20 MB or smaller.')
      return
    }

    setEditReplacementFile(file)
  }

  const clearEditReplacementFile = () => {
    setEditReplacementFile(null)
    setEditFileInputKey((prev) => prev + 1)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    setError('')
    try {
      const created = await createMediaPost(selectedFile, caption, category || undefined, altText)
      const placementPayload = Array.from(
        new Set<MediaPlacementKey>(['MEDIA_LIBRARY', ...createPlacements]),
      ).map((key) => ({
        key,
        displayOrder: key === 'MEDIA_LIBRARY' ? 0 : 1,
      }))
      const placed = await updateMediaPost(created.id, { placements: placementPayload })
      setPosts((prev) => [placed, ...prev])
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
    setEditReplacementFile(null)
    setEditReplacementPreviewUrl('')
    setEditFileInputKey((prev) => prev + 1)
    setEditForm({
      caption: post.caption ?? '',
      altText: post.altText ?? '',
      mediaCategory: post.mediaCategory,
      placements: post.placements?.length ? post.placements : [{ key: 'MEDIA_LIBRARY', displayOrder: 0 }],
      clearMediaCategory: false,
    })
  }

  const handleSetHomepageHero = async (post: MediaPost) => {
    if (post.mediaType !== 'IMAGE') {
      setError('Homepage hero must be an image, not a video.')
      return
    }

    setHeroUpdatingId(post.id)
    setError('')
    try {
      const updated = await updateMediaPost(post.id, {
        placements: [
          ...(post.placements ?? []).filter((placement) => placement.key !== 'HOME_HERO'),
          { key: 'HOME_HERO', displayOrder: 1 },
        ],
      })

      const otherHeroPosts = posts.filter(
        (item) => item.id !== post.id && item.placements?.some((placement) => placement.key === 'HOME_HERO'),
      )

      await Promise.all(
        otherHeroPosts.map((item) =>
          updateMediaPost(item.id, {
            placements: (item.placements ?? []).filter((placement) => placement.key !== 'HOME_HERO'),
          }),
        ),
      )

      setPosts((prev) =>
        prev.map((item) => {
          if (item.id === post.id) return updated
          if (otherHeroPosts.some((other) => other.id === item.id)) {
            return {
              ...item,
              placements: (item.placements ?? []).filter((placement) => placement.key !== 'HOME_HERO'),
            }
          }
          return item
        }),
      )
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not set this image as the homepage hero.'
      setError(message)
    } finally {
      setHeroUpdatingId(null)
    }
  }

  const toggleEditPlacement = (key: MediaPlacementKey, enabled: boolean) => {
    setEditForm((current) => {
      const placements = current.placements ?? []
      if (!enabled) {
        return {
          ...current,
          placements: placements.filter((placement) => placement.key !== key),
        }
      }

      if (placements.some((placement) => placement.key === key)) return current

      return {
        ...current,
        placements: [...placements, { key, displayOrder: 0 }],
      }
    })
  }

  const updateEditPlacementOrder = (key: MediaPlacementKey, displayOrder: number) => {
    setEditForm((current) => ({
      ...current,
      placements: (current.placements ?? []).map((placement) =>
        placement.key === key ? { ...placement, displayOrder } : placement,
      ),
    }))
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

  const handleReplaceEditFile = async () => {
    if (!editingPost || !editReplacementFile) return

    setReplacingFile(true)
    setError('')
    try {
      const updated = await replaceMediaPostFile(editingPost.id, editReplacementFile)
      setPosts((prev) => prev.map((item) => (item.id === editingPost.id ? updated : item)))
      setEditingPost(updated)
      clearEditReplacementFile()
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { error?: string } } })?.response
      const message =
        response?.status === 413
          ? 'This file is too large to upload. Please keep media files at 20 MB or smaller.'
          : response?.data?.error ?? 'Could not replace this media file.'
      setError(message)
    } finally {
      setReplacingFile(false)
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

      {/* How it works banner */}
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-amber-400 font-bold text-sm mb-2">How media works</p>
        <ul className="space-y-1 text-xs text-gray-400">
          <li><span className="text-white font-semibold">Media page</span> controls the public gallery only when selected.</li>
          <li><span className="text-white font-semibold">Homepage hero/highlights</span> control the first impression and proof section.</li>
          <li><span className="text-white font-semibold">About hero/profile/gallery</span> control Coach Kante story visuals.</li>
          <li><span className="text-white font-semibold">Display order</span> lets you pin the most important media first.</li>
        </ul>
      </div>

      <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-cyan-300">Homepage hero image</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              {homepageHeroPost
                ? `Current hero: ${homepageHeroPost.caption?.trim() || homepageHeroPost.altText?.trim() || 'Selected media post'}`
                : 'No homepage hero image selected yet. Upload an image below or use “Set Hero” on an existing image.'}
            </p>
          </div>
          {homepageHeroPost ? (
            <img
              src={homepageHeroPost.mediaUrl}
              alt={homepageHeroPost.altText || homepageHeroPost.caption || 'Current homepage hero'}
              className="h-20 w-32 rounded-lg border border-gray-800 bg-black object-cover"
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Create Post</h2>
              <p className="mt-1 text-sm text-gray-400">
                JPG, PNG, WEBP, and MP4 are supported. Max file size is 20 MB. Pick only the public page sections where this media should appear.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Category <span className="text-gray-600">(optional)</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MediaCategory | '')}
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
                        {getPreviewType(selectedFile)} - {formatFileSize(selectedFile.size)}
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

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm text-gray-400">Alt text</label>
                  <span className="text-xs text-gray-500">{altText.length} / 255</span>
                </div>
                <input
                  type="text"
                  maxLength={255}
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  placeholder="Describe what is visible for screen readers and accessibility."
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
                />
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Keep it concrete and visual. Example: Player dribbling between cones during a private session.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Use this upload on</p>
                <p className="mt-1 text-xs text-gray-500">
                  Choose where this image should appear after posting. For the homepage picture, select Homepage hero. For the public gallery, select Media page.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {MEDIA_PLACEMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={createPlacements.includes(option.value)}
                        onChange={(event) => toggleCreatePlacement(option.value, event.target.checked)}
                        className="h-4 w-4 rounded border-gray-700 accent-amber-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
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
                disabled={!selectedFile || uploading}
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
                  The newest posts appear first unless you assign a custom feed order. Use Content to manage placement and ordering on the homepage and about page.
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
                    imageLoading="eager"
                    imageFetchPriority={index < 2 ? 'high' : 'auto'}
                  />
                  <div className="flex gap-2 justify-end">
                    {post.mediaType === 'IMAGE' ? (
                      <button
                        type="button"
                        disabled={heroUpdatingId === post.id}
                        onClick={() => handleSetHomepageHero(post)}
                        className="flex-1 rounded-lg bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:opacity-50 sm:flex-none"
                      >
                        {heroUpdatingId === post.id ? 'Setting...' : 'Set Hero'}
                      </button>
                    ) : null}
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
                  <SocialSharePanel
                    title={post.caption?.trim() || 'Kante Elite Training'}
                    text="Book a session with Coach Kante."
                    url="/book"
                    imageUrl={post.mediaType === 'IMAGE' ? post.mediaUrl : undefined}
                    imageType={post.mediaType}
                    variant="compact"
                  />
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
              <p className="text-xs font-semibold uppercase text-red-400">
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
              <p className="text-xs font-semibold uppercase text-amber-500">Edit Post</p>
              <h3 className="mt-2 text-xl font-bold text-white">Update this media post</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-black p-4">
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase text-gray-500">Replace image or video</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a new file from your computer. Captions and page placements will stay attached to this post.
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
                  {editReplacementPreviewUrl ? (
                    getPreviewType(editReplacementFile as File) === 'VIDEO' ? (
                      <video
                        src={editReplacementPreviewUrl}
                        controls
                        className="h-52 w-full bg-black object-contain"
                      />
                    ) : (
                      <img
                        src={editReplacementPreviewUrl}
                        alt="Replacement media preview"
                        className="h-52 w-full object-contain"
                      />
                    )
                  ) : (
                    <ExistingMediaPreview post={editingPost} />
                  )}
                </div>

                <div className="mt-3">
                  <label className="inline-flex cursor-pointer rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-black hover:bg-amber-400">
                    Choose new file
                    <input
                      key={editFileInputKey}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,video/mp4"
                      onChange={handleEditReplacementFileChange}
                      className="hidden"
                    />
                  </label>
                  {editReplacementFile ? (
                    <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm text-gray-300">
                      <p className="font-semibold text-white">{editReplacementFile.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {getPreviewType(editReplacementFile)} - {formatFileSize(editReplacementFile.size)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleReplaceEditFile}
                          disabled={replacingFile}
                          className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
                        >
                          {replacingFile ? 'Replacing...' : 'Replace media file'}
                        </button>
                        <button
                          type="button"
                          onClick={clearEditReplacementFile}
                          disabled={replacingFile}
                          className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                        >
                          Cancel file
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

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
                <label className="mb-2 block text-sm text-gray-400">Alt text</label>
                <input
                  type="text"
                  maxLength={255}
                  value={editForm.altText ?? ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, altText: e.target.value }))}
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white"
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
                <p className="text-xs font-semibold uppercase text-gray-500">Site placement</p>
                {MEDIA_PLACEMENT_OPTIONS.map((option) => {
                  const placement = editForm.placements?.find((item) => item.key === option.value)
                  return (
                    <div key={option.value} className="rounded-xl border border-gray-800 bg-gray-950/80 p-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(placement)}
                          onChange={(e) => toggleEditPlacement(option.value, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-700 accent-amber-500"
                        />
                        <span className="text-sm font-semibold text-gray-200">{option.label}</span>
                      </label>
                      {placement ? (
                        <label className="mt-3 block">
                          <span className="mb-1 block text-[11px] font-semibold uppercase text-gray-500">
                            Display order
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={placement.displayOrder}
                            onChange={(event) =>
                              updateEditPlacementOrder(
                                option.value,
                                Math.max(0, Number.parseInt(event.target.value || '0', 10)),
                              )
                            }
                            className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white"
                          />
                        </label>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <div className="rounded-xl border border-gray-800 bg-black p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">Share this post</p>
                <p className="mt-1 text-xs text-gray-500">
                  Copy the caption and booking link, or download a Story image for Instagram and Snapchat.
                </p>
                <SocialSharePanel
                  title={editForm.caption?.trim() || editingPost.caption?.trim() || 'Kante Elite Training'}
                  text="Book a session with Coach Kante."
                  url="/book"
                  imageUrl={editingPost.mediaType === 'IMAGE' ? editingPost.mediaUrl : undefined}
                  imageType={editingPost.mediaType}
                  variant="compact"
                  className="mt-4"
                />
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
