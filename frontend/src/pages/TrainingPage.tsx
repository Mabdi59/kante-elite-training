import { useEffect, useState } from 'react'
import { getPrograms } from '../services/api'
import type { Program } from '../types'
import HeroSection from '../components/HeroSection'
import ProgramCard from '../components/ProgramCard'
import CTASection from '../components/CTASection'

export default function TrainingPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-20">
      <HeroSection
        badge="What We Offer"
        title="Training Programs"
        subtitle="Professional, structured soccer development programs for every skill level — from beginners to elite athletes preparing for college."
      />

      {/* Programs grid */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program, i) => (
                <ProgramCard key={program.id} program={program} featured={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#111111] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Simple Process</p>
            <h2 className="text-white font-black text-4xl">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Your Program', desc: 'Pick the training program that matches your goals and age group.' },
              { step: '02', title: 'Select a Date & Time', desc: 'Browse available slots and book the time that works for your schedule.' },
              { step: '03', title: 'Complete Payment', desc: 'Secure checkout through Stripe. Your spot is confirmed instantly.' },
              { step: '04', title: 'Show Up & Train', desc: 'Arrive ready to work. Coach Kante will take it from there.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-500 font-black text-lg">{item.step}</span>
                </div>
                <h3 className="text-white font-black text-base mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Start Training?"
        subtitle="Choose a program that fits your goals and book your first session today."
      />
    </div>
  )
}
