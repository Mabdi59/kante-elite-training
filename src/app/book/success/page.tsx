"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  program: string;
  date: string;
  time: string;
  playerName: string;
  parentName: string;
  phone: string;
  email: string;
  ageGroup: string;
  experience: string;
  notes: string;
  stripeSessionId: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROGRAM_TITLES: Record<string, string> = {
  private:   "Private Training",
  group:     "Small Group Training",
  speed:     "Speed & Agility",
  technical: "Technical Development",
  camp:      "Training Camp",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ─── Success Page ─────────────────────────────────────────────────────────────

export default function BookSuccessPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-lg">Loading…</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("session_id");

  const [status,  setStatus]  = useState<"loading" | "success" | "error">(
    sessionId ? "loading" : "error"
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error,   setError]   = useState(
    sessionId ? "" : "No payment session found."
  );

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function confirm() {
      try {
        const res  = await fetch(`/api/bookings/confirm?session_id=${encodeURIComponent(sessionId!)}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please contact us.");
          setStatus("error");
        } else {
          setBooking(data.booking);
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setError("Network error. Please check your connection and try again.");
          setStatus("error");
        }
      }
    }

    confirm();
    return () => { cancelled = true; };
  }, [sessionId]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="pt-16 min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-lg">Confirming your booking…</p>
          <p className="text-gray-400 text-sm mt-2">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="pt-16 min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-white font-black text-3xl mb-4">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book"
              className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded transition-all"
            >
              Back to Booking
            </Link>
            <Link
              href="/contact"
              className="border border-[#333333] text-white hover:bg-[#111111] font-bold px-8 py-3 rounded transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  const b         = booking!;
  const bookingId = "KE-" + b.id.slice(0, 8).toUpperCase();
  const details   = [
    { label: "Program",            value: PROGRAM_TITLES[b.program] ?? b.program },
    { label: "Date",               value: formatDate(b.date) },
    { label: "Time",               value: b.time },
    { label: "Player",             value: b.playerName },
    ...(b.parentName ? [{ label: "Parent / Guardian", value: b.parentName }] : []),
    { label: "Phone",              value: b.phone },
    { label: "Email",              value: b.email },
    ...(b.ageGroup   ? [{ label: "Age Group",   value: b.ageGroup   }] : []),
    ...(b.experience ? [{ label: "Experience",  value: b.experience }] : []),
  ];

  return (
    <div className="pt-16 min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-amber-500">✓</span>
        </div>

        {/* Heading */}
        <h1 className="text-white font-black text-3xl md:text-4xl mb-2">Payment Received!</h1>
        <p className="text-gray-400 text-sm mb-3">Your session is confirmed.</p>
        <p className="text-amber-500 font-black text-xl mb-8">Reference #{bookingId}</p>

        {/* Booking details */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl divide-y divide-[#222222] text-left mb-8">
          {details.map((row) => (
            <div key={row.label} className="flex justify-between items-center px-5 py-3 text-sm">
              <span className="text-gray-400">{row.label}</span>
              <span className="text-white font-semibold text-right max-w-[60%]">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-gray-400 text-sm mb-8">
          A confirmation has been sent to{" "}
          <span className="text-amber-500">{b.email}</span>.{" "}
          Coach Kante will be in touch before your session.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/training"
            className="border border-[#333333] text-white hover:bg-[#111111] font-bold px-8 py-3 rounded transition-all"
          >
            View All Programs
          </Link>
        </div>
      </div>
    </div>
  );
}
