"use client";

import { useEffect, useState } from "react";
import { Lock, MapPin, Calendar, Clock, Sparkles, Star } from "lucide-react";
import { TeaserPayload, TeaserStop } from "./api/teaser/route";

export default function TeaserPage() {
  const [teaserData, setTeaserData] = useState<TeaserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    async function fetchTeaser() {
      try {
        const response = await fetch("/api/teaser");
        const data = await response.json();
        setTeaserData(data);
      } catch (error) {
        console.error("Failed to load teaser:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeaser();
  }, []);

  const handleUnlock = async (priceId: string) => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itineraryId: "teaser-001",
          email,
          priceId,
        }),
      });

      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!teaserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load itinerary preview</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navy Blue Top Navigation */}
      <nav className="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold tracking-tight">
                ✈️ Mediterranean Adventure
              </div>
            </div>
            <button
              onClick={() => {
                setShowPricing(true);
                setTimeout(() => {
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="bg-white text-[#1e3a8a] px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Unlock Trip
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-blue-700 to-cyan-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-7 h-7 animate-pulse" />
              <span className="text-lg font-semibold uppercase tracking-wider bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                Exclusive Preview
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">
              {teaserData.tripTitle}
            </h1>
            <p className="text-2xl md:text-3xl font-light mb-8 text-blue-100">
              An Unforgettable Journey Through Paradise
            </p>
            <div className="flex items-center justify-center gap-6 text-xl mb-10">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
                <span>{teaserData.tripDates}</span>
              </div>
              <span className="text-white/60">•</span>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <MapPin className="w-6 h-6" />
                <span>{teaserData.days.length} Days</span>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setShowPricing(true);
                  setTimeout(() => {
                    document
                      .getElementById("pricing")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="bg-white text-[#1e3a8a] px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                <Lock className="w-6 h-6 inline mr-3" />
                Unlock Full Itinerary
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Timeline Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-transparent to-blue-50/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
            Day-by-Day Preview
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Each stop has been carefully selected and perfectly timed to create an unforgettable Mediterranean experience
          </p>
        </div>

        <div className="space-y-10">
          {teaserData.days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-100 hover:shadow-3xl transition-shadow"
            >
              <div className="bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-cyan-600 text-white p-8">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-2xl font-bold">{day.label}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">{day.summary}</h3>
                <p className="text-blue-100 text-sm">
                  {day.stops.length} carefully curated experiences
                </p>
              </div>

              <div className="p-8 bg-gradient-to-br from-blue-50/50 to-white">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {day.stops.map((stop, stopIndex) => (
                    <StopCard key={stop.id} stop={stop} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-blue-50/30 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
            Experience Highlights
          </h2>
          <p className="text-gray-700 text-lg">
            Stunning preview images from your curated Mediterranean destinations
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div
              key={index}
              className="aspect-square rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:scale-105 transform border-2 border-blue-100"
            >
              <img
                src={`/api/og/teaser?stop=${index}`}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-12 border-2 border-blue-100">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">
            Why Our Mediterranean Itineraries?
          </h3>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-10 h-10 text-[#1e3a8a]" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1e3a8a]">Expert Curated</h4>
              <p className="text-gray-700">
                Hand-picked by Mediterranean travel experts with decades of local knowledge and insider connections
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-10 h-10 text-[#1e3a8a]" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1e3a8a]">Time-Optimized</h4>
              <p className="text-gray-700">
                Perfectly timed itineraries that maximize your experience while avoiding crowds and peak times
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MapPin className="w-10 h-10 text-[#1e3a8a]" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#1e3a8a]">Insider Access</h4>
              <p className="text-gray-700">
                Exclusive reservations, hidden gems, and local spots that only insiders know about
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {showPricing && (
        <section
          id="pricing"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Unlock Your Complete Itinerary
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get instant access to all locations, bookings, and insider tips
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-[#1e3a8a]">
              <div className="bg-gradient-to-br from-[#1e3a8a] via-blue-700 to-cyan-600 text-white p-8 text-center">
                <h3 className="text-3xl font-bold mb-3">Complete Access</h3>
                <div className="text-5xl font-bold mb-2">$49</div>
                <p className="text-blue-100 text-lg">One-time payment • Instant access</p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Complete venue names and addresses
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Exact times and booking confirmations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Interactive map with GPS coordinates
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Contact info and insider tips
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Printable PDF & mobile access
                    </span>
                  </li>
                </ul>

                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleUnlock("price_full_access")}
                    className="w-full bg-gradient-to-r from-[#1e3a8a] via-blue-700 to-cyan-600 text-white px-6 py-5 rounded-xl font-bold text-xl hover:from-[#1a2f6e] hover:via-blue-800 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    🔓 Unlock Full Access Now
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6 font-medium">
                  🔒 Secure payment • ⚡ Instant access • ✅ 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-blue-700 to-cyan-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Mediterranean Adventure?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10">
            Unlock the complete itinerary and get instant access to all details, reservations, and insider tips
          </p>
          <button
            onClick={() => {
              setShowPricing(true);
              setTimeout(() => {
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="bg-white text-[#1e3a8a] px-12 py-5 rounded-full font-bold text-xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-110 transform"
          >
            <Lock className="w-6 h-6 inline mr-3" />
            Unlock Now for $49
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a8a] text-blue-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                ✈️ Mediterranean Adventure
              </div>
              <p className="text-blue-300">
                Your gateway to unforgettable Mediterranean experiences
              </p>
            </div>
            <div className="border-t border-blue-700 pt-6 mt-6">
              <p className="text-sm mb-4">
                © 2025 Custom Itinerary Travel. All rights reserved.
              </p>
              <div className="space-x-6 text-sm">
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <span className="text-blue-400">•</span>
                <a href="/about" className="hover:text-white transition-colors">
                  About Us
                </a>
                <span className="text-blue-400">•</span>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StopCard({ stop }: { stop: TeaserStop }) {
  const getTypeIcon = (type: TeaserStop["type"]) => {
    switch (type) {
      case "hotel":
        return "🏨";
      case "food":
        return "🍽️";
      case "attraction":
        return "🎭";
      case "transport":
        return "🚗";
      default:
        return "📍";
    }
  };

  const getTypeColor = (type: TeaserStop["type"]) => {
    switch (type) {
      case "hotel":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-800";
      case "food":
        return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 text-orange-800";
      case "attraction":
        return "bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-300 text-cyan-800";
      case "transport":
        return "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-800";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div
      className={`relative border-2 rounded-2xl p-5 hover:shadow-2xl transition-all hover:scale-105 transform ${getTypeColor(
        stop.type
      )}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl drop-shadow-sm">{getTypeIcon(stop.type)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-xl">{stop.displayName}</h4>
            <Lock className="w-5 h-5 opacity-70" />
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 font-medium">
            <MapPin className="w-4 h-4" />
            <span>{stop.displayArea}</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90 font-medium">
            <Clock className="w-4 h-4" />
            <span>{stop.timeWindow}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-white/50">
        <img
          src={stop.thumbUrl}
          alt={stop.displayName}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
  );
}
