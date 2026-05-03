import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getTestimonials } from '../services/api'
import type { Program, Testimonial } from '../types'
import CTASection from '../components/CTASection'
import EmptyState from '../components/EmptyState'
import HeroSection from '../components/HeroSection'
import { Section, SectionHeader } from '../components/Section'
import TestimonialCard from '../components/TestimonialCard'

export default function ResultsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getTestimonials(), getPrograms()])
      .then(([testimonialResult, programResult]) => {
        if (testimonialResult.status === 'fulfilled') {
          setTestimonials(testimonialResult.value)
        }
        if (programResult.status === 'fulfilled') {
          setPrograms(programResult.value)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const averageRating =
    testimonials.length > 0
      ? (testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0) / testimonials.length).toFixed(1)
      : null

  const achievements = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      stat: loading ? '...' : testimonials.length.toString(),
      label: 'Published Reviews',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.48 3.499-1.43 2.936-3.24.477 2.345 2.318-.554 3.269 2.879-1.534 2.879 1.534-.554-3.27 2.345-2.317-3.24-.477-1.43-2.936Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 14.25-.75 1.5-1.5.22 1.08 1.06-.255 1.47 1.335-.72 1.34.72-.255-1.47 1.08-1.06-1.5-.22-.825-1.5Zm13.5 0-.75 1.5-1.5.22 1.08 1.06-.255 1.47 1.335-.72 1.34.72-.255-1.47 1.08-1.06-1.5-.22-.825-1.5Z" />
        </svg>
      ),
      stat: loading ? '...' : averageRating ? `${averageRating}/5` : 'New',
      label: 'Average Rating',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      ),
      stat: loading ? '...' : testimonials.filter((testimonial) => testimonial.featured).length.toString(),
      label: 'Featured Stories',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25h6M9 8.25h6m-8.25 3h10.5m-10.5 3h10.5m-12 4.5h13.5A2.25 2.25 0 0 0 21 16.5v-9A2.25 2.25 0 0 0 18.75 5.25H5.25A2.25 2.25 0 0 0 3 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
      stat: loading ? '...' : programs.length.toString(),
      label: 'Training Programs',
    },
  ]

  return (
    <div className="min-h-screen bg-black pt-20">
      <HeroSection
        badge="Real Results"
        title="Real Progress. Real Results."
        subtitle="We measure success by player growth, confidence, and the opportunities earned through consistent training."
        mediaPlacement="RESULTS_HERO"
      />

      <Section tone="raised">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.label}
                className="card p-5 text-center transition-colors hover:border-amber-500/30 sm:p-8"
              >
                <div className="flex justify-center mb-3">{achievement.icon}</div>
                <p className="mb-1 text-3xl font-black text-amber-500 sm:text-4xl">{achievement.stat}</p>
                <p className="text-gray-400 text-sm">{achievement.label}</p>
              </div>
            ))}
          </div>
      </Section>

      <Section>
          <SectionHeader
            eyebrow="What Families Say"
            title="Honest Reviews from Real Families"
            description="Parents and players share their experience training with Coach Kante."
          />

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-48 animate-pulse" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <EmptyState
              title="Reviews are on the way"
              description="Family reviews and player stories will appear here as soon as they are published."
              action={
                <Link
                  to="/book"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                >
                  Book a Session
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
      </Section>

      <CTASection
        eyebrow="Your Turn"
        title="Ready to Start Your Player's Story?"
        subtitle="Every result starts with a first session. Book now and begin with a clear plan."
        primaryLabel="Book a Session"
        primaryHref="/book"
        secondaryLabel="View Programs"
        secondaryHref="/training"
        proofPoints={[
          'Published family reviews',
          'Current programs listed online',
          'Direct online booking',
        ]}
      />
    </div>
  )
}
