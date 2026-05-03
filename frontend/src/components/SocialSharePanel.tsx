import { useMemo, useState } from 'react'

interface SocialSharePanelProps {
  title: string
  text?: string
  url: string
  imageUrl?: string
  imageType?: 'IMAGE' | 'VIDEO'
  variant?: 'card' | 'compact' | 'hero'
  className?: string
}

function getAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url
  return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`
}

function buildCaption(title: string, text: string | undefined, url: string) {
  return [
    title,
    text,
    'Book online with Kante Elite Training.',
    url,
  ].filter(Boolean).join('\n\n')
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const imageRatio = image.naturalWidth / image.naturalHeight
  const canvasRatio = width / height
  const drawHeight = imageRatio > canvasRatio ? height : width / imageRatio
  const drawWidth = imageRatio > canvasRatio ? height * imageRatio : width
  const x = (width - drawWidth) / 2
  const y = (height - drawHeight) / 2
  context.drawImage(image, x, y, drawWidth, drawHeight)
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })

  if (line) lines.push(line)

  lines.slice(0, maxLines).forEach((currentLine, index) => {
    const value = index === maxLines - 1 && lines.length > maxLines ? `${currentLine}...` : currentLine
    context.fillText(value, x, y + index * lineHeight)
  })
}

async function downloadStoryImage(title: string, text: string | undefined, shareUrl: string, imageUrl?: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas unavailable')

  context.fillStyle = '#050505'
  context.fillRect(0, 0, canvas.width, canvas.height)

  if (imageUrl) {
    const image = await loadImage(getAbsoluteUrl(imageUrl))
    drawCoverImage(context, image, canvas.width, canvas.height)
  }

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(0,0,0,0.38)')
  gradient.addColorStop(0.44, 'rgba(0,0,0,0.12)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.92)')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#f59e0b'
  context.font = '700 34px Arial, sans-serif'
  context.fillText('KANTE ELITE TRAINING', 72, 140)

  context.fillStyle = '#ffffff'
  context.font = '900 96px Arial, sans-serif'
  wrapText(context, title, 72, 1450, 920, 104, 3)

  if (text) {
    context.fillStyle = '#d1d5db'
    context.font = '500 42px Arial, sans-serif'
    wrapText(context, text, 72, 1680, 920, 56, 3)
  }

  context.fillStyle = '#f59e0b'
  context.fillRect(72, 1788, 936, 76)
  context.fillStyle = '#050505'
  context.font = '900 34px Arial, sans-serif'
  context.fillText('BOOK NOW - ADD LINK STICKER', 112, 1838)

  context.fillStyle = '#ffffff'
  context.font = '600 26px Arial, sans-serif'
  context.fillText(shareUrl.replace(/^https?:\/\//, ''), 72, 1898)

  const anchor = document.createElement('a')
  anchor.href = canvas.toDataURL('image/png')
  anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kante-elite'}-story.png`
  anchor.click()
}

export default function SocialSharePanel({
  title,
  text,
  url,
  imageUrl,
  imageType,
  variant = 'card',
  className = '',
}: SocialSharePanelProps) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const absoluteUrl = useMemo(() => getAbsoluteUrl(url), [url])
  const caption = useMemo(() => buildCaption(title, text, absoluteUrl), [absoluteUrl, text, title])
  const canDownloadStoryImage = Boolean(imageUrl && imageType !== 'VIDEO')
  const panelClass =
    variant === 'hero'
      ? 'rounded-2xl border border-amber-500/25 bg-black/62 p-5 shadow-2xl shadow-black/40 backdrop-blur'
      : variant === 'compact'
        ? 'rounded-xl border border-[#242424] bg-black/70 p-4'
        : 'rounded-2xl border border-[#242424] bg-[#101010] p-5'

  const handleNativeShare = async () => {
    setMessage('')
    if (!navigator.share) {
      await copyText(caption)
      setMessage('Caption copied. Paste it into Instagram, Snapchat, or Facebook.')
      return
    }

    try {
      await navigator.share({ title, text, url: absoluteUrl })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setMessage('Share did not open. Link is still ready to copy.')
      }
    }
  }

  const handleStoryDownload = async () => {
    setBusy(true)
    setMessage('')
    try {
      await downloadStoryImage(title, text, absoluteUrl, imageUrl)
      setMessage('Story image downloaded. Add it to your Story and use the copied link as the sticker.')
    } catch {
      setMessage('Could not build the story image from this media. Try downloading the original image instead.')
    } finally {
      setBusy(false)
    }
  }

  const buttonClass = 'rounded-lg bg-[#1a1a1a] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#242424]'

  return (
    <div className={`${panelClass} ${className}`}>
      <div className="mb-3">
        <p className="text-xs font-black uppercase text-amber-500">Share Kit</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-400">
          Built for Stories: copy the caption, download the visual, then add the booking link sticker.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button type="button" onClick={handleNativeShare} className={buttonClass}>
          Share
        </button>
        <button
          type="button"
          onClick={async () => {
            await copyText(absoluteUrl)
            setMessage('Booking link copied.')
          }}
          className={buttonClass}
        >
          Copy Link
        </button>
        <button
          type="button"
          onClick={async () => {
            await copyText(caption)
            setMessage('Story caption copied.')
          }}
          className={buttonClass}
        >
          Copy Caption
        </button>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`}
          target="_blank"
          rel="noreferrer"
          className={`${buttonClass} text-center`}
        >
          Facebook
        </a>
        {canDownloadStoryImage ? (
          <button type="button" onClick={handleStoryDownload} disabled={busy} className={`${buttonClass} col-span-2 disabled:opacity-50`}>
            {busy ? 'Building...' : 'Story Image'}
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200">
          {message}
        </p>
      ) : null}
    </div>
  )
}
