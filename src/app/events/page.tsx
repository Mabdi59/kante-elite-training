"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import EventCard from "@/components/EventCard";

const allEvents = [
  {
    title: "Columbus Youth Cup 2025",
    date: "March 15, 2025",
    location: "Berliner Park, Columbus",
    ageGroup: "U12-U14",
    price: "$150/team",
    spotsLeft: 3,
    type: "Tournament",
  },
  {
    title: "Spring Training Camp",
    date: "April 7-11, 2025",
    location: "Kante Elite Training Facility",
    ageGroup: "U8-U18",
    price: "$200",
    spotsLeft: 8,
    type: "Camp",
  },
  {
    title: "Saturday Pickup Games",
    date: "Every Saturday",
    location: "Tuttle Park, Columbus",
    ageGroup: "U14-U18",
    price: "Free",
    spotsLeft: "Open" as const,
    type: "Pickup",
  },
  {
    title: "Ohio State Cup Qualifier",
    date: "May 3-4, 2025",
    location: "OFC Stadium, Columbus",
    ageGroup: "U16-U18",
    price: "$200/team",
    spotsLeft: 5,
    type: "Tournament",
  },
  {
    title: "Summer Intensive Camp",
    date: "June 23-27, 2025",
    location: "Kante Elite Training Facility",
    ageGroup: "U8-U18",
    price: "$200",
    spotsLeft: 12,
    type: "Camp",
  },
  {
    title: "Evening Pickup League",
    date: "Every Tuesday",
    location: "Wolfe Park, Columbus",
    ageGroup: "U12-U16",
    price: "$10",
    spotsLeft: "Open" as const,
    type: "Pickup",
  },
];

const filterTabs = ["All", "Tournament", "Camp", "Pickup"];

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredEvents =
    activeFilter === "All"
      ? allEvents
      : allEvents.filter((e) => e.type === activeFilter);

  return (
    <div className="pt-16">
      <HeroSection
        title="Upcoming Events"
        subtitle="Register for tournaments, camps, and pickup games"
        badge="Events Calendar"
      />

      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                  activeFilter === tab
                    ? "bg-amber-500 text-black"
                    : "bg-[#222222] text-white hover:bg-[#333333]"
                }`}
              >
                {tab === "All" ? "All Events" : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.title} {...event} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No events found for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111111] border-t border-[#222222] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white font-black text-3xl mb-4">Want to Host an Event?</h2>
          <p className="text-gray-400 mb-8">
            Interested in organizing a tournament or camp with Kante Elite Training? Get in touch with us.
          </p>
          <a
            href="/contact"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3 rounded transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
