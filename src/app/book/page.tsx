"use client";

import { useState, useEffect, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRAMS = [
  { id: "private",   icon: "⚽", title: "Private Training",        price: "$75/session",  desc: "1-on-1 personalized coaching" },
  { id: "group",     icon: "👥", title: "Small Group Training",     price: "$40/player",   desc: "2–4 players, team dynamics" },
  { id: "speed",     icon: "⚡", title: "Speed & Agility",          price: "$50/session",  desc: "Athletic performance development" },
  { id: "technical", icon: "🎯", title: "Technical Development",    price: "$45/session",  desc: "Ball mastery and technical skills" },
  { id: "camp",      icon: "🏕️", title: "Training Camp",            price: "$200/week",    desc: "Intensive week-long programs" },
];

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM",  "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
];

const AGE_GROUPS = [
  "U8 (Ages 7-8)", "U10 (Ages 9-10)", "U12 (Ages 11-12)",
  "U14 (Ages 13-14)", "U16 (Ages 15-16)", "U18 (Ages 17-18)",
];

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

const STEP_LABELS = ["Program", "Date & Time", "Your Details", "Confirm"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Next 14 Mon–Sat days starting tomorrow */
function getAvailableDates() {
  const dates: { value: string; label: string; day: string }[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 14) {
    if (d.getDay() !== 0) {
      dates.push({
        value: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day:   d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDate(isoDate: string) {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-start justify-center mb-12">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone   = step > num;
        return (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isDone   ? "bg-amber-500/20 text-amber-500 border border-amber-500"
                  : isActive ? "bg-amber-500 text-black"
                  : "bg-[#222222] text-gray-500"
                }`}
              >
                {isDone ? "✓" : num}
              </div>
              <span className={`text-xs font-medium hidden sm:block whitespace-nowrap ${step >= num ? "text-white" : "text-gray-600"}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-10 md:w-16 mt-[18px] mx-1 shrink-0 ${step > num ? "bg-amber-500" : "bg-[#333333]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookPage() {
  const AVAILABLE_DATES = getAvailableDates();

  const [step, setStep]           = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  // Step 1 – Program
  const [program, setProgram] = useState("");

  // Step 2 – Date & Time
  const [date, setDate]               = useState("");
  const [time, setTime]               = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3 – Details
  const [playerName, setPlayerName] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [ageGroup, setAgeGroup]     = useState("");
  const [experience, setExperience] = useState("");
  const [notes, setNotes]           = useState("");

  // Submission
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookingId, setBookingId]     = useState("");

  // Fetch booked slots when date or program changes
  const fetchBookedSlots = useCallback(async (d: string, p: string) => {
    if (!d || !p) return;
    setLoadingSlots(true);
    try {
      const res  = await fetch(`/api/bookings?date=${d}&program=${p}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots ?? []);
    } catch {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (date && program) {
      fetchBookedSlots(date, program);
    }
  }, [date, program, fetchBookedSlots]);

  // Reset date/time if program changes (availability differs per program)
  useEffect(() => {
    setDate("");
    setTime("");
    setBookedSlots([]);
  }, [program]);

  const selectedProgramData = PROGRAMS.find((p) => p.id === program);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res  = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, date, time, playerName, parentName, phone, email, ageGroup, experience, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        if (res.status === 409) {
          // Slot was just taken; refresh availability
          fetchBookedSlots(date, program);
        }
      } else {
        setBookingId("KE-" + data.booking.id.slice(0, 8).toUpperCase());
        setConfirmed(true);
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation Screen ───────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="pt-16">
        <section className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-amber-500">✓</span>
            </div>
            <h1 className="text-white font-black text-3xl md:text-4xl mb-2">Booking Confirmed!</h1>
            <p className="text-amber-500 font-bold text-lg mb-8">Reference #{bookingId}</p>

            <div className="bg-[#111111] border border-[#222222] rounded-xl divide-y divide-[#222222] text-left mb-8">
              {[
                { label: "Program",  value: selectedProgramData?.title },
                { label: "Date",     value: formatDate(date) },
                { label: "Time",     value: time },
                { label: "Player",   value: playerName },
                parentName ? { label: "Parent / Guardian", value: parentName } : null,
                { label: "Phone",    value: phone },
                { label: "Email",    value: email },
              ].filter(Boolean).map((row) => (
                <div key={row!.label} className="flex justify-between items-center px-5 py-3 text-sm">
                  <span className="text-gray-400">{row!.label}</span>
                  <span className="text-white font-semibold text-right max-w-[60%]">{row!.value}</span>
                </div>
              ))}
            </div>

            <p className="text-gray-400 text-sm mb-8">
              Coach Kante will reach out to confirm your session.{" "}
              Check <span className="text-amber-500">{email}</span> for details.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded transition-all">
                Back to Home
              </Link>
              <Link href="/training" className="border border-[#333333] text-white hover:bg-[#111111] font-bold px-8 py-3 rounded transition-all">
                View All Programs
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Booking Form ─────────────────────────────────────────────────────────
  return (
    <div className="pt-16">
      <HeroSection
        title="Book Your Session"
        subtitle="Reserve your spot in 4 easy steps — no account needed"
        badge="Get Started"
      />

      <section className="bg-black py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <StepIndicator step={step} />

          {/* ── Step 1: Program ─────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-6 text-center">Select Training Type</h2>
              <div className="grid grid-cols-1 gap-3">
                {PROGRAMS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      program === p.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#222222] bg-[#111111] hover:border-[#444444]"
                    }`}
                  >
                    <input type="radio" name="program" value={p.id} checked={program === p.id} onChange={() => setProgram(p.id)} className="sr-only" />
                    <span className="text-3xl">{p.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{p.title}</p>
                      <p className="text-gray-400 text-sm">{p.desc}</p>
                    </div>
                    <span className="text-amber-500 font-bold whitespace-nowrap">{p.price}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => program && setStep(2)}
                disabled={!program}
                className="mt-8 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded transition-all"
              >
                Next: Pick a Date →
              </button>
            </div>
          )}

          {/* ── Step 2: Date & Time ──────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-6 text-center">Choose Date &amp; Time</h2>

              {/* Date grid */}
              <p className="text-gray-400 text-sm font-medium mb-3">Select a date</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
                {AVAILABLE_DATES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => { setDate(d.value); setTime(""); }}
                    className={`flex flex-col items-center py-2.5 px-1 rounded-lg border text-center transition-colors ${
                      date === d.value
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#222222] bg-[#111111] hover:border-[#444444]"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${date === d.value ? "text-amber-500" : "text-gray-500"}`}>{d.day}</span>
                    <span className={`text-sm font-bold mt-0.5 ${date === d.value ? "text-white" : "text-gray-300"}`}>{d.label}</span>
                  </button>
                ))}
              </div>

              {/* Time slots */}
              {!date && (
                <p className="text-gray-500 text-sm text-center py-6">← Select a date to see available times</p>
              )}

              {date && (
                <>
                  <p className="text-gray-400 text-sm font-medium mb-3">Select a time</p>
                  {loadingSlots ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Checking availability…</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {TIME_SLOTS.map((slot) => {
                        const isBooked   = bookedSlots.includes(slot);
                        const isSelected = time === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => !isBooked && setTime(slot)}
                            disabled={isBooked}
                            className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-sm font-bold transition-all ${
                              isBooked
                                ? "border-[#1a1a1a] bg-[#0d0d0d] text-gray-600 cursor-not-allowed"
                                : isSelected
                                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                                : "border-[#222222] bg-[#111111] text-gray-300 hover:border-[#444444]"
                            }`}
                          >
                            <span className={isBooked ? "line-through decoration-gray-600" : ""}>{slot}</span>
                            {isBooked && <span className="text-xs font-normal text-gray-600 mt-0.5">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#333333] text-white font-bold py-4 rounded hover:bg-[#111111] transition-colors text-sm">
                  ← Back
                </button>
                <button
                  onClick={() => date && time && setStep(3)}
                  disabled={!date || !time}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded transition-all"
                >
                  Next: Your Details →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Details ──────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-6 text-center">Your Details</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">Player Name *</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="First & Last Name"
                      className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="First & Last Name"
                      className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(614) 555-0000"
                      className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Age Group</option>
                      {AGE_GROUPS.map((ag) => <option key={ag} value={ag}>{ag}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold text-sm mb-2">Experience Level</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Level</option>
                      {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold text-sm mb-2">Notes / Goals <span className="text-gray-500 font-normal">(optional)</span></label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell Coach Kante what you want to work on…"
                    rows={3}
                    className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="flex-1 border border-[#333333] text-white font-bold py-4 rounded hover:bg-[#111111] transition-colors text-sm">
                  ← Back
                </button>
                <button
                  onClick={() => playerName.trim() && phone.trim() && email.trim() && setStep(4)}
                  disabled={!playerName.trim() || !phone.trim() || !email.trim()}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded transition-all"
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Confirm ─────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h2 className="text-white font-black text-2xl mb-2 text-center">Review &amp; Confirm</h2>
              <p className="text-gray-400 text-sm text-center mb-8">Double-check everything before confirming your spot.</p>

              <div className="bg-[#111111] border border-[#222222] rounded-xl divide-y divide-[#222222] mb-6">
                {([
                  { label: "Program",  value: selectedProgramData?.title },
                  { label: "Price",    value: selectedProgramData?.price },
                  { label: "Date",     value: formatDate(date) },
                  { label: "Time",     value: time },
                  { label: "Player",   value: playerName },
                  parentName ? { label: "Parent / Guardian", value: parentName } : null,
                  { label: "Phone",    value: phone },
                  { label: "Email",    value: email },
                  ageGroup   ? { label: "Age Group",   value: ageGroup }   : null,
                  experience ? { label: "Experience",  value: experience } : null,
                  notes      ? { label: "Notes",       value: notes }      : null,
                ] as Array<{ label: string; value: string } | null>)
                  .filter(Boolean)
                  .map((row) => (
                    <div key={row!.label} className="flex justify-between items-start px-5 py-3 text-sm gap-4">
                      <span className="text-gray-400 shrink-0">{row!.label}</span>
                      <span className="text-white font-semibold text-right">{row!.value}</span>
                    </div>
                  ))}
              </div>

              {submitError && (
                <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-4 mb-6 text-red-400 text-sm">
                  ⚠️ {submitError}
                  {submitError.includes("already booked") && (
                    <button
                      onClick={() => { setSubmitError(""); setStep(2); }}
                      className="block mt-2 text-amber-500 font-bold underline text-xs"
                    >
                      Pick a different time →
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-black py-5 rounded-xl text-lg transition-all shadow-xl shadow-amber-500/20 mb-4"
              >
                {submitting ? "Booking Your Spot…" : "Confirm Booking →"}
              </button>

              <p className="text-gray-500 text-xs text-center mb-6">
                Coach Kante will confirm your session within 24 hours.
              </p>

              <button
                onClick={() => setStep(3)}
                className="w-full border border-[#333333] text-white font-bold py-3 rounded hover:bg-[#111111] transition-colors text-sm"
              >
                ← Edit Details
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
