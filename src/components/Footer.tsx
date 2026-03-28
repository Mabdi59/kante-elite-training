import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#222222]">
      {/* Footer CTA strip */}
      <div className="bg-black border-b border-[#222222] py-10 px-4 text-center">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Ready to Start?</p>
        <h2 className="text-white font-black text-2xl md:text-3xl mb-4">
          How fast can your child improve? <span className="text-amber-500">Find out.</span>
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/book"
            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded transition-all shadow-md shadow-amber-500/20 text-sm"
          >
            Book Training →
          </Link>
          <Link
            href="/contact"
            className="border border-white/30 text-white hover:border-white hover:bg-white/10 px-8 py-3 rounded transition-all font-bold text-sm"
          >
            Contact Us
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <div className="mb-4">
              <span className="text-white font-black text-xl">KANTE</span>
              <span className="text-amber-500 font-black text-xl"> ELITE</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Elevating Columbus Youth Soccer
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Developing the next generation of elite soccer players through professional coaching and data-driven training.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-xl" aria-label="Instagram">📸</a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-xl" aria-label="Twitter">🐦</a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-xl" aria-label="YouTube">▶️</a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-xl" aria-label="Facebook">👤</a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/training", label: "Training" },
                { href: "/events", label: "Events" },
                { href: "/results", label: "Results" },
                { href: "/about", label: "About" },
                { href: "/book", label: "Book" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-amber-500 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Training */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Training</h3>
            <ul className="space-y-2">
              {[
                "Private Training",
                "Small Group",
                "Speed & Agility",
                "Technical Development",
                "Camps",
              ].map((item) => (
                <li key={item}>
                  <Link href="/training" className="text-gray-400 hover:text-amber-500 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Columbus, Ohio</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📞</span>
                <a href="tel:6145550123" className="hover:text-amber-500 transition-colors">(614) 555-0123</a>
              </li>
              <li className="flex items-start gap-2">
                <span>✉️</span>
                <a href="mailto:info@kanteelitetraining.com" className="hover:text-amber-500 transition-colors">info@kanteelitetraining.com</a>
              </li>
              <li className="flex items-start gap-2">
                <span>⏰</span>
                <span>Mon–Sat · 7am–8pm</span>
              </li>
            </ul>
            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4 border border-[#222222]">
              <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">Trust Signals</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>✓ Indoor facility · Columbus, OH</li>
                <li>✓ Ages 6–18 welcome</li>
                <li>✓ Small group sizes (max 4)</li>
                <li>✓ Focused development environment</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#222222] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Kante Elite Training. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">Columbus, Ohio&apos;s Premier Youth Soccer Academy</p>
        </div>
      </div>
    </footer>
  );
}
