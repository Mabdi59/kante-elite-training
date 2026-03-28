"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import Link from "next/link";

const programTypes = [
  { id: "private", icon: "⚽", title: "Private Training", price: "$75/session", desc: "1-on-1 personalized coaching" },
  { id: "group", icon: "👥", title: "Small Group Training", price: "$40/player", desc: "2-4 players, team dynamics" },
  { id: "speed", icon: "⚡", title: "Speed & Agility", price: "$50/session", desc: "Athletic performance development" },
  { id: "technical", icon: "🎯", title: "Technical Development", price: "$45/session", desc: "Ball mastery and technical skills" },
  { id: "camp", icon: "🏕️", title: "Training Camp", price: "$200/week", desc: "Intensive week-long programs" },
];

const ageGroups = ["U8 (Ages 7-8)", "U10 (Ages 9-10)", "U12 (Ages 11-12)", "U14 (Ages 13-14)", "U16 (Ages 15-16)", "U18 (Ages 17-18)"];
const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Elite"];

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [experience, setExperience] = useState("");

  return (
    <div className="pt-16">
      <HeroSection
        title="Book Your Session"
        subtitle="Take the first step toward elite performance"
        badge="Get Started"
      />

      <section className="bg-black py-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step === s
                      ? "bg-amber-500 text-black"
                      : step > s
                      ? "bg-amber-500/30 text-amber-500 border border-amber-500"
                      : "bg-[#222222] text-gray-400"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s ? "text-white" : "text-gray-500"}`}>
                  {s === 1 ? "Training Type" : s === 2 ? "Player Info" : "Schedule"}
                </span>
                {s < 3 && <div className={`h-px w-8 ${step > s ? "bg-amber-500" : "bg-[#333333]"}`}></div>}
              </div>
            ))}
          </div>

          {/* Step 1: Select Training Type */}
          {step === 1 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-6 text-center">Select Training Type</h2>
              <div className="grid grid-cols-1 gap-4">
                {programTypes.map((program) => (
                  <label
                    key={program.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedProgram === program.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#222222] bg-[#111111] hover:border-[#444444]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="program"
                      value={program.id}
                      checked={selectedProgram === program.id}
                      onChange={() => setSelectedProgram(program.id)}
                      className="sr-only"
                    />
                    <span className="text-3xl">{program.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{program.title}</p>
                      <p className="text-gray-400 text-sm">{program.desc}</p>
                    </div>
                    <span className="text-amber-500 font-bold">{program.price}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => selectedProgram && setStep(2)}
                disabled={!selectedProgram}
                className="mt-8 w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded transition-colors"
              >
                Next Step
              </button>
            </div>
          )}

          {/* Step 2: Player Information */}
          {step === 2 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-6 text-center">Player Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Age Group</option>
                    {ageGroups.map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Experience Level</label>
                  <div className="grid grid-cols-2 gap-3">
                    {experienceLevels.map((level) => (
                      <label
                        key={level}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          experience === level
                            ? "border-amber-500 bg-amber-500/10 text-amber-500"
                            : "border-[#222222] bg-[#111111] text-gray-400 hover:border-[#444444]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="experience"
                          value={level}
                          checked={experience === level}
                          onChange={() => setExperience(level)}
                          className="sr-only"
                        />
                        <span className="font-semibold text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#333333] text-white font-bold py-4 rounded hover:bg-[#111111] transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => ageGroup && experience && setStep(3)}
                  disabled={!ageGroup || !experience}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-2 text-center">Schedule Your Session</h2>
              <p className="text-gray-400 text-center text-sm mb-8">Your selected program is ready — choose how to book.</p>

              {/* Summary */}
              <div className="bg-[#111111] border border-amber-500/30 rounded-xl p-5 mb-8">
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Your Selection</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Program: </span>
                    <span className="text-white font-semibold">{programTypes.find((p) => p.id === selectedProgram)?.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Age: </span>
                    <span className="text-white font-semibold">{ageGroup}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Level: </span>
                    <span className="text-white font-semibold">{experience}</span>
                  </div>
                </div>
              </div>

              {/* Booking options */}
              <div className="space-y-4 mb-8">
                {/* Option 1: Calendly */}
                <div className="bg-[#111111] border border-[#222222] hover:border-amber-500 rounded-xl p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl">📅</span>
                    <div>
                      <p className="text-white font-bold">Book Online — Calendly</p>
                      <p className="text-gray-400 text-sm">Pick a date and time that works for you</p>
                    </div>
                  </div>
                  <a
                    href="https://calendly.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded text-center text-sm transition-all"
                  >
                    Open Scheduling Calendar →
                  </a>
                  <p className="text-gray-500 text-xs mt-2 text-center">Integration live soon — use phone/DM for now</p>
                </div>

                {/* Option 2: Phone / Text */}
                <div className="bg-[#111111] border border-[#222222] hover:border-amber-500 rounded-xl p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl">📞</span>
                    <div>
                      <p className="text-white font-bold">Call or Text Coach Kante</p>
                      <p className="text-gray-400 text-sm">Fastest way to lock in your spot</p>
                    </div>
                  </div>
                  <a
                    href="tel:6145550123"
                    className="block w-full border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-black py-3 rounded text-center text-sm transition-all"
                  >
                    (614) 555-0123 — Call or Text
                  </a>
                </div>

                {/* Option 3: Instagram DM */}
                <div className="bg-[#111111] border border-[#222222] hover:border-amber-500 rounded-xl p-6 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl">📸</span>
                    <div>
                      <p className="text-white font-bold">DM on Instagram</p>
                      <p className="text-gray-400 text-sm">Message us and we&apos;ll get back to you fast</p>
                    </div>
                  </div>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full border-2 border-[#333333] text-white hover:border-amber-500 hover:text-amber-500 font-black py-3 rounded text-center text-sm transition-all"
                  >
                    @KanteEliteTraining →
                  </a>
                </div>
              </div>

              <p className="text-center text-amber-400 text-sm font-semibold mb-6">
                ⚡ Sessions book up fast — don&apos;t wait
              </p>

              <button
                onClick={() => setStep(2)}
                className="w-full border border-[#333333] text-white font-bold py-3 rounded hover:bg-[#111111] transition-colors text-sm"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
