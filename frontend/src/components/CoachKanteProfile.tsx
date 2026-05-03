import { Link } from 'react-router-dom'
import type { CoachProfile, MediaPost } from '../types'
import BrandMark from './BrandMark'
import MediaAsset from './MediaAsset'

function splitList(value?: string) {
  return value?.split(/[|,\n]/).map((item) => item.trim()).filter(Boolean) ?? []
}

const requiredCredentials = [
  'Ohio Dominican University (D2)',
  'All-Conference honors',
  'Team MVP',
  'Somali National Team',
  'USSF Licensed',
]

const COACH_KANTE_PROFILE_IMAGE = '/images/coach-kante-profile.png'

interface CoachKanteProfileProps {
  coach?: CoachProfile | null
  imagePost?: MediaPost | null
  loading?: boolean
  compact?: boolean
}

export default function CoachKanteProfile({
  coach,
  imagePost,
  loading = false,
  compact = false,
}: CoachKanteProfileProps) {
  if (loading) {
    return (
      <section className="relative overflow-hidden border-t border-[#1a1a1a] bg-black px-4 py-20 sm:py-24">
        <div className="page-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="skeleton min-h-[34rem] rounded-sm" />
          <div className="space-y-6">
            <div className="skeleton h-7 w-32" />
            <div className="skeleton h-20 w-5/6" />
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-64 w-full" />
          </div>
        </div>
      </section>
    )
  }

  const certifications = splitList(coach?.certifications)
  const extraCredentials = certifications
    .filter((item) => !requiredCredentials.some((credential) => item.toLowerCase().includes(credential.toLowerCase().replace(' university (d2)', '').replace(' licensed', ''))))
    .slice(0, 2)
  const credentials = [...requiredCredentials, ...extraCredentials]
  const specialties = splitList(coach?.specialties).slice(0, 4)
  const imageUrl = coach?.headshotUrl || imagePost?.mediaUrl || COACH_KANTE_PROFILE_IMAGE
  const imageType = coach?.headshotMediaType || imagePost?.mediaType || 'IMAGE'
  const title = coach?.roleTitle || 'Founder & Elite Trainer'
  const bio =
    coach?.bio ||
    'Coach Kante leads Kante Elite Training as a personal coaching brand for players who need focused attention and honest correction.'
  const bioParagraphs = [
    bio,
    'His sessions are shaped by the player in front of him: the habits that need fixing, the decisions that need speeding up, and the confidence that needs building.',
  ]

  return (
    <section className={`relative overflow-hidden border-t border-[#1a1a1a] bg-black px-4 ${compact ? 'py-18 sm:py-20' : 'py-20 sm:py-24'}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,_rgba(245,158,11,0.08),_transparent_38%,_transparent_62%,_rgba(255,255,255,0.03))]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="page-shell relative grid items-stretch gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)] lg:gap-16">
        <div className="relative min-h-[34rem] overflow-hidden border border-white/10 bg-[#080808] lg:min-h-[42rem]">
          <div className="absolute inset-0">
            {imageUrl ? (
              <MediaAsset
                src={imageUrl}
                type={imageType}
                alt="Coach Kante profile"
                loading="eager"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_55%)]">
                <BrandMark size="auth" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
          <div className="absolute left-5 top-5 rounded-full border border-amber-500/30 bg-black/70 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-amber-300 backdrop-blur">
            Founder
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-wide text-amber-400">Kante Elite Training</p>
            <p className="mt-2 text-4xl font-black leading-none text-white sm:text-5xl">Coach Kante</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="section-label">Meet Coach Kante</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase text-gray-300">
              Head Trainer
            </span>
          </div>

          <h2 className="text-balance text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Coach Kante
          </h2>
          <p className="mt-4 text-lg font-black uppercase tracking-wide text-amber-400">{title}</p>

          <div className="mt-7 max-w-2xl space-y-4 text-base leading-relaxed text-gray-300 sm:text-lg">
            {bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {specialties.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <span key={specialty} className="border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold uppercase text-gray-200">
                  {specialty}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-10 border-y border-white/10 py-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-wide text-white">Credentials / Experience</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
            </div>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {credentials.slice(0, compact ? 5 : 7).map((credential) => (
                <div key={credential} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold leading-relaxed text-gray-100">{credential}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/book" className="btn-primary justify-center px-8 py-3 text-sm">
              Book Training
            </Link>
            <Link to="/about" className="btn-secondary justify-center px-8 py-3 text-sm">
              About Coach Kante
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
