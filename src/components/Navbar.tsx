"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/training", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/results", label: "Results" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement bar */}
      <div className="bg-amber-500 text-black text-xs font-black text-center py-2 px-4 tracking-wide">
        ⚡ Spring sessions filling fast —{" "}
        <Link href="/book" className="underline underline-offset-2 hover:no-underline">
          reserve your spot now
        </Link>
      </div>

      {/* Main nav */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-lg border-b border-white/8 shadow-2xl shadow-black/60"
            : "bg-black border-b border-[#1a1a1a]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-amber-400 transition-colors">
                <span className="text-black font-black text-sm leading-none">K</span>
              </div>
              <div className="leading-tight">
                <span className="text-white font-black text-xl">KANTE</span>
                <span className="text-amber-500 font-black text-xl"> ELITE</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    pathname === link.href
                      ? "text-amber-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center">
              <Link
                href="/book"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 px-5 rounded-lg text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-white p-2 rounded-md hover:bg-white/5 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1.5">
                <span
                  className={`block h-0.5 bg-white transition-all duration-300 ${
                    isOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-white transition-all duration-300 ${
                    isOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-white transition-all duration-300 ${
                    isOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black/98 border-t border-[#1a1a1a] px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 px-2 text-sm font-semibold rounded-md transition-colors ${
                  pathname === link.href
                    ? "text-amber-500"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <Link
                href="/book"
                className="block bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-lg text-sm text-center transition-all shadow-lg shadow-amber-500/20"
                onClick={() => setIsOpen(false)}
              >
                Book Now →
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
