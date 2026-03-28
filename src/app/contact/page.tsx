"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pt-24">
      <HeroSection
        title="Contact Us"
        subtitle="Get in touch to start your elite training journey"
        badge="Reach Out"
      />

      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-white font-black text-3xl mb-8">Send Us a Message</h2>
            {submitted ? (
              <div className="bg-[#111111] border border-amber-500 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-white font-black text-2xl mb-2">Message Sent!</h3>
                <p className="text-gray-400">
                  Thank you for reaching out. Coach Kante will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white font-semibold mb-2">
                    Full Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white font-semibold mb-2">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-white font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="(614) 555-0000"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-white font-semibold mb-2">
                    Message <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="Tell us about your player, goals, and any questions you have..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded transition-colors text-lg"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-white font-black text-3xl mb-8">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {[
                { icon: "📞", title: "Phone", value: "(614) 555-0123", href: "tel:6145550123" },
                { icon: "✉️", title: "Email", value: "info@kanteelitetraining.com", href: "mailto:info@kanteelitetraining.com" },
                { icon: "📍", title: "Location", value: "Columbus, Ohio (Near Berliner Park)", href: null },
                { icon: "🕐", title: "Training Hours", value: "Mon-Fri 4pm-8pm | Sat-Sun 8am-6pm", href: null },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#111111] border border-[#222222] rounded-xl p-6 flex items-start gap-4"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-amber-500 text-sm font-semibold mb-1">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white hover:text-amber-500 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-[#1a1a1a] rounded-xl h-64 flex items-center justify-center border border-[#222222]">
              <div className="text-center">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-white font-semibold">Training Location</p>
                <p className="text-gray-400 text-sm">Columbus, Ohio</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
