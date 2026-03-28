"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Program {
  id: string;
  label: string;
  price: string;
  description: string;
}

interface ConfirmedBooking {
  id: string;
  program: string;
  date: string;
  time: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  athleteName: string;
  athleteAge: string;
  experienceLevel: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRAMS: Program[] = [
  {
    id: "private",
    label: "Private Training",
    price: "$75/session",
    description: "1-on-1 sessions with Coach Kante, personalized to your game.",
  },
  {
    id: "group",
    label: "Small Group Training",
    price: "$40/player",
    description: "2–4 players per session. Competitive energy, personal attention.",
  },
  {
    id: "speed",
    label: "Speed & Agility",
    price: "$50/session",
    description: "Sports-science-based speed, acceleration, and agility training.",
  },
  {
    id: "technical",
    label: "Technical Development",
    price: "$45/session",
    description: "Ball mastery, passing, finishing, and 1v1 skills.",
  },
  {
    id: "camp",
    label: "Training Camp",
    price: "$200/week",
    description: "Full-day immersive training camp (8am–4pm) for serious players.",
  },
];

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

const STEP_LABELS = ["Program", "Date & Time", "Details", "Review", "Done"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvailableDates(): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start from tomorrow
  while (dates.length < 14) {
    if (d.getDay() !== 0) {
      // exclude Sundays
      dates.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDateShort(iso: string): { day: string; num: number; month: string } {
  const dt = new Date(iso + "T12:00:00");
  return {
    day: dt.toLocaleDateString("en-US", { weekday: "short" }),
    num: dt.getDate(),
    month: dt.toLocaleDateString("en-US", { month: "short" }),
  };
}

function formatDateLong(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  done
                    ? "bg-amber-500 text-black"
                    : active
                    ? "bg-amber-500 text-black ring-4 ring-amber-500/20"
                    : "bg-[#1a1a1a] border border-[#333333] text-gray-600"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-[10px] font-semibold hidden sm:block ${
                  active ? "text-amber-500" : done ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-px mx-1 mb-4 ${
                  n < step ? "bg-amber-500" : "bg-[#222222]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-amber-500 font-black text-xs uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-semibold mb-2">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-[#111111] border border-[#222222] text-white rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors placeholder-gray-600";

// ─── Primary / Secondary Buttons ─────────────────────────────────────────────

function PrimaryBtn({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-[#1a1a1a] disabled:text-gray-600 text-black font-black py-4 rounded-xl text-base transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function SecondaryBtn({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full border border-[#333333] text-white font-bold py-4 rounded-xl hover:bg-[#111111] transition-colors text-sm"
    >
      {children}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [availableDates] = useState(getAvailableDates);

  // Step 1 — Program
  const [program, setProgram] = useState("");

  // Step 2 — Date & Time
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3 — Details
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [iAmTheAthlete, setIAmTheAthlete] = useState(false);
  const [athleteName, setAthleteName] = useState("");
  const [athleteAge, setAthleteAge] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [notes, setNotes] = useState("");

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);

  // Fetch booked slots when date or program changes
  const fetchBookedSlots = useCallback(async (d: string, p: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/bookings?date=${encodeURIComponent(d)}&program=${encodeURIComponent(p)}`
      );
      const data = await res.json();
      setBookedSlots(data.bookedSlots ?? []);
    } catch {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (date && program) fetchBookedSlots(date, program);
  }, [date, program, fetchBookedSlots]);

  // "I am the athlete" — mirror contact name into athlete name
  useEffect(() => {
    if (iAmTheAthlete) setAthleteName(contactName);
  }, [iAmTheAthlete, contactName]);

  const selectedProgram = PROGRAMS.find((p) => p.id === program);

  const step3Valid =
    contactName.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) &&
    contactPhone.trim() !== "" &&
    athleteName.trim() !== "" &&
    athleteAge.trim() !== "" &&
    experienceLevel !== "";

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program,
          date,
          time,
          contactName,
          contactEmail,
          contactPhone,
          athleteName,
          athleteAge,
          experienceLevel,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSubmitError(
            "This slot was just taken by another booking. Please choose a different time."
          );
        } else {
          setSubmitError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      // Map API response back to display field names
      const b = data.booking;
      setConfirmed({
        id: b.id,
        program: b.program,
        date: b.date,
        time: b.time,
        contactName: b.parentName ?? contactName,
        contactEmail: b.email ?? contactEmail,
        contactPhone: b.phone ?? contactPhone,
        athleteName: b.playerName ?? athleteName,
        athleteAge: b.ageGroup ?? athleteAge,
        experienceLevel: b.experience ?? experienceLevel,
        notes: b.notes ?? notes,
      });
      setStep(5);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(1);
    setProgram("");
    setDate("");
    setTime("");
    setBookedSlots([]);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setIAmTheAthlete(false);
    setAthleteName("");
    setAthleteAge("");
    setExperienceLevel("");
    setNotes("");
    setSubmitError("");
    setConfirmed(null);
  }

  return (
    <div className="pt-24 min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 text-amber-500 uppercase tracking-[0.2em] text-xs font-black mb-4">
            <span className="w-8 h-px bg-amber-500/60" />
            Book a Session
            <span className="w-8 h-px bg-amber-500/60" />
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl">Reserve Your Spot</h1>
          <p className="text-gray-500 text-sm mt-3">
            Complete the steps below to book your training session.
          </p>
        </div>

        {/* Step indicator (hidden on success) */}
        {step < 5 && <StepIndicator step={step} />}

        {/* ── Step 1: Program ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <SectionLabel>Choose a program</SectionLabel>
            <div className="space-y-3 mb-6">
              {PROGRAMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProgram(p.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    program === p.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-[#222222] bg-[#111111] hover:border-[#333333]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold text-base">{p.label}</span>
                    <span className="text-amber-500 font-black text-sm">{p.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{p.description}</p>
                </button>
              ))}
            </div>
            <PrimaryBtn onClick={() => program && setStep(2)} disabled={!program}>
              Continue →
            </PrimaryBtn>
          </div>
        )}

        {/* ── Step 2: Date & Time ─────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <SectionLabel>Select a date</SectionLabel>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
              {availableDates.map((d) => {
                const { day, num, month } = formatDateShort(d);
                const selected = date === d;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setDate(d);
                      setTime("");
                    }}
                    className={`flex flex-col items-center py-3 px-1 rounded-xl border transition-all ${
                      selected
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#222222] bg-[#111111] hover:border-[#333333]"
                    }`}
                  >
                    <span className="text-gray-500 text-[10px] font-semibold">{day}</span>
                    <span
                      className={`font-black text-xl leading-tight ${
                        selected ? "text-amber-500" : "text-white"
                      }`}
                    >
                      {num}
                    </span>
                    <span className="text-gray-600 text-[10px]">{month}</span>
                  </button>
                );
              })}
            </div>

            {date ? (
              <>
                <SectionLabel>
                  Available times — {formatDateLong(date)}
                </SectionLabel>
                {loadingSlots ? (
                  <div className="flex items-center gap-3 py-8 text-gray-500 text-sm">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Checking availability…
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                    {TIME_SLOTS.map((t) => {
                      const booked = bookedSlots.includes(t);
                      const selected = time === t;
                      return (
                        <button
                          key={t}
                          disabled={booked}
                          onClick={() => !booked && setTime(t)}
                          className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                            booked
                              ? "border-[#1a1a1a] bg-[#0a0a0a] text-gray-700 cursor-not-allowed line-through"
                              : selected
                              ? "border-amber-500 bg-amber-500/10 text-amber-500"
                              : "border-[#222222] bg-[#111111] text-white hover:border-[#333333]"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-gray-600 text-sm border border-[#1a1a1a] rounded-xl mb-6">
                ← Select a date above to see available times
              </div>
            )}

            <div className="flex gap-3">
              <SecondaryBtn onClick={() => setStep(1)}>← Back</SecondaryBtn>
              <div className="flex-1">
                <PrimaryBtn
                  onClick={() => date && time && setStep(3)}
                  disabled={!date || !time}
                >
                  Continue →
                </PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Details ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            {/* Contact Info */}
            <SectionLabel>Contact info</SectionLabel>
            <div className="space-y-3 mb-8">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Phone" required>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(614) 555-0123"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Athlete Info */}
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Athlete info</SectionLabel>
              {/* "I am the athlete" toggle */}
              <button
                onClick={() => setIAmTheAthlete(!iAmTheAthlete)}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all mb-4 ${
                  iAmTheAthlete
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-[#1a1a1a] text-gray-400 border-[#333333] hover:border-[#444444]"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                    iAmTheAthlete ? "border-amber-500 bg-amber-500" : "border-gray-600"
                  }`}
                >
                  {iAmTheAthlete && (
                    <span className="text-[8px] text-black font-black leading-none">✓</span>
                  )}
                </div>
                I am the athlete
              </button>
            </div>

            <div className="space-y-3 mb-8">
              <Field label="Athlete Name" required>
                <input
                  type="text"
                  value={athleteName}
                  onChange={(e) => {
                    setAthleteName(e.target.value);
                    if (iAmTheAthlete) setIAmTheAthlete(false);
                  }}
                  placeholder="Athlete's full name"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age" required>
                  <input
                    type="number"
                    min="5"
                    max="25"
                    value={athleteAge}
                    onChange={(e) => setAthleteAge(e.target.value)}
                    placeholder="e.g. 14"
                    className={inputClass}
                  />
                </Field>
                <Field label="Experience Level" required>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select level
                    </option>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Notes (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Injuries, training goals, special requests…"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>

            <div className="flex gap-3">
              <SecondaryBtn onClick={() => setStep(2)}>← Back</SecondaryBtn>
              <div className="flex-1">
                <PrimaryBtn
                  onClick={() => step3Valid && setStep(4)}
                  disabled={!step3Valid}
                >
                  Review Booking →
                </PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Confirm ────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <SectionLabel>Booking summary</SectionLabel>
            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden divide-y divide-[#1a1a1a] mb-6">
              {[
                { label: "Program", value: selectedProgram?.label ?? program },
                { label: "Date", value: formatDateLong(date) },
                { label: "Time", value: time },
                { label: "Contact", value: contactName },
                { label: "Email", value: contactEmail },
                { label: "Phone", value: contactPhone },
                { label: "Athlete", value: athleteName },
                { label: "Age", value: athleteAge },
                { label: "Experience", value: experienceLevel },
                ...(notes ? [{ label: "Notes", value: notes }] : []),
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between px-5 py-3 text-sm"
                >
                  <span className="text-gray-500 font-semibold flex-shrink-0 w-24">
                    {row.label}
                  </span>
                  <span className="text-white text-right break-all">{row.value}</span>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <div>
                  {submitError}
                  {submitError.includes("slot was just taken") && (
                    <button
                      onClick={() => {
                        setSubmitError("");
                        setTime("");
                        setStep(2);
                      }}
                      className="block mt-2 text-amber-400 underline text-xs"
                    >
                      ← Choose a different time
                    </button>
                  )}
                </div>
              </div>
            )}

            <PrimaryBtn onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Confirming…
                </span>
              ) : (
                "Confirm Booking →"
              )}
            </PrimaryBtn>
            <div className="mt-3">
              <SecondaryBtn onClick={() => setStep(3)}>← Edit Details</SecondaryBtn>
            </div>
          </div>
        )}

        {/* ── Step 5: Success ─────────────────────────────────────────────── */}
        {step === 5 && confirmed && (
          <div className="text-center">
            {/* Check icon */}
            <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-white font-black text-3xl mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400 text-sm mb-4">Your session has been reserved.</p>

            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-2 mb-8">
              <span className="text-gray-400 text-sm">Reference:</span>
              <span className="text-amber-500 font-black text-sm tracking-wider">
                KE-{confirmed.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden divide-y divide-[#1a1a1a] text-left mb-8">
              {[
                { label: "Program", value: selectedProgram?.label ?? confirmed.program },
                { label: "Date", value: formatDateLong(confirmed.date) },
                { label: "Time", value: confirmed.time },
                { label: "Athlete", value: confirmed.athleteName },
                { label: "Age", value: confirmed.athleteAge },
                { label: "Experience", value: confirmed.experienceLevel },
                { label: "Contact", value: confirmed.contactName },
                { label: "Email", value: confirmed.contactEmail },
                { label: "Phone", value: confirmed.contactPhone },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-5 py-3 text-sm"
                >
                  <span className="text-gray-500">{row.label}</span>
                  <span className="text-white font-semibold text-right max-w-[60%] break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-gray-500 text-sm mb-8">
              Coach Kante will be in touch before your session. See you on the field! ⚽
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-4 rounded-xl transition-all text-center shadow-lg shadow-amber-500/20"
              >
                Back to Home
              </Link>
              <button
                onClick={resetForm}
                className="flex-1 border border-[#333333] text-white font-bold px-6 py-4 rounded-xl hover:bg-[#111111] transition-colors"
              >
                Book Another Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
