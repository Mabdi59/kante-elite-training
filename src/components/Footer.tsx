import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-[#222222]">
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
            </ul>
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
