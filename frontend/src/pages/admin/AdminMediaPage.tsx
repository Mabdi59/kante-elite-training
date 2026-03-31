import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createMediaPost, deleteMediaPost, getMediaPosts } from '../../services/api'
import type { MediaPost, MediaType } from '../../types'
import ErrorBanner from '../../components/ErrorBanner'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import MediaPostCard from '../../components/MediaPostCard'

const MAX_MEDIA_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
const MAX_CAPTION_LENGTH = 500

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
  const [error, setError] = useState('')
  const [postPendingDelete, setPostPendingDelete] = useState<MediaPost | null>(null)

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
      createdAt: new Date().toISOString(),
    }
  }, [caption, previewUrl, selectedFile])

  const resetForm = () => {
    setSelectedFile(null)
    setCaption('')
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

    setUploading(true)
    setError('')
    try {
      const created = await createMediaPost(selectedFile, caption)
      setPosts((prev) => [created, ...prev])
      resetForm()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not upload this media post.'
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

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-8 mb-6 border-b border-gray-900 bg-gray-950/95 px-8 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Media</h1>
            <p className="mt-1 text-sm text-gray-400">
              Upload photos and videos to keep the public feed fresh with training highlights.
            </p>
          </div>
          <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
            {posts.length} post{posts.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
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

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
              >
                {uploading ? 'Posting...' : 'Post to Feed'}
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
              <MediaPostCard post={previewPost} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-700 bg-black px-4 py-14 text-center text-sm text-gray-500">
                Select a file to preview how your post will appear in the public feed.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Published Feed</h2>
                <p className="mt-1 text-sm text-gray-400">
                  The newest posts appear first on the public media page. Use Content to place them on the homepage and about page.
                </p>
              </div>
              <Link
                to="/admin/content"
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700"
              >
                Manage Placement
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading media posts..." />
          ) : posts.length === 0 ? (
            <EmptyState
              icon="Feed"
              title="No posts yet"
              description="Upload your first highlight to start building the public media feed."
              action={
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400"
                >
                  Upload your first post
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <div key={post.id} className="space-y-3">
                  <MediaPostCard post={post} />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={deletingId === post.id}
                      onClick={() => setPostPendingDelete(post)}
                      className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === post.id ? 'Deleting...' : 'Delete Post'}
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPostPendingDelete(null)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === postPendingDelete.id}
                onClick={() => handleDelete(postPendingDelete)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {deletingId === postPendingDelete.id ? 'Deleting...' : 'Delete post'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
