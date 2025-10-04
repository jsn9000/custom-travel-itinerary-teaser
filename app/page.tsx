"use client";

import { useState, useEffect } from "react";
import { Lock, Star, Plane, Building2, Check } from "lucide-react";

interface HotelOption {
  id: string;
  type: string;
  stars: number;
  price: number;
  image: string;
  description: string;
}

interface FlightOption {
  id: string;
  type: string;
  price: number;
  duration: string;
  stops: string;
  image: string;
  description: string;
}

const hotelOptions: HotelOption[] = [
  {
    id: "h1",
    type: "Luxury Beachfront Resort",
    stars: 5,
    price: 450,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    description: "5-star oceanfront property with private beach access",
  },
  {
    id: "h2",
    type: "Boutique Mediterranean Villa",
    stars: 4,
    price: 320,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    description: "Charming 4-star villa in the heart of the coastal village",
  },
  {
    id: "h3",
    type: "Modern Harbor View Hotel",
    stars: 4,
    price: 280,
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    description: "Contemporary 4-star hotel overlooking the marina",
  },
];

const flightOptions: FlightOption[] = [
  {
    id: "f1",
    type: "Premium Direct Flight",
    price: 850,
    duration: "8h 45m",
    stops: "Nonstop",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
    description: "Direct premium service with extra legroom",
  },
  {
    id: "f2",
    type: "Standard Direct Flight",
    price: 620,
    duration: "8h 55m",
    stops: "Nonstop",
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800",
    description: "Comfortable direct flight with standard amenities",
  },
  {
    id: "f3",
    type: "Economy Connection Flight",
    price: 480,
    duration: "12h 20m",
    stops: "1 stop",
    image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800",
    description: "Budget-friendly option with one layover",
  },
];

// Mediterranean activity images - high-quality destination photos
const bannerImages = [
  {
    url: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1920&q=80",
    title: "Seaside Dining",
  },
  {
    url: "https://images.unsplash.com/photo-1503152394-c571994fd383?w=1920&q=80",
    title: "Santorini Views",
  },
  {
    url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&q=80",
    title: "Beach Paradise",
  },
  {
    url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1920&q=80",
    title: "Ancient Villages",
  },
  {
    url: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1920&q=80",
    title: "Coastal Cliffs",
  },
  {
    url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1920&q=80",
    title: "Island Hopping",
  },
  {
    url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
    title: "Vineyard Sunset",
  },
  {
    url: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1920&q=80",
    title: "Crystal Waters",
  },
  {
    url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&q=80",
    title: "Coastal Paradise",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80",
    title: "Luxury Accommodations",
  },
];

export default function TravelSelection() {
  const [selectedHotel, setSelectedHotel] = useState<string>("h1");
  const [selectedFlight, setSelectedFlight] = useState<string>("f1");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Auto-rotate banner images every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer to trip date (December 10, 2025)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const tripDate = new Date("2025-12-10T00:00:00");
      const now = new Date();

      if (tripDate > now) {
        // Calculate total days
        const totalDays = Math.floor((tripDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate months (approximate, 30 days per month for display)
        const months = Math.floor(totalDays / 30);
        const remainingDays = totalDays % 30;

        // Calculate hours, minutes, seconds
        const difference = tripDate.getTime() - now.getTime();
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          months,
          days: remainingDays,
          hours,
          minutes,
          seconds
        });
      } else {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedHotelData = hotelOptions.find((h) => h.id === selectedHotel);
  const selectedFlightData = flightOptions.find((f) => f.id === selectedFlight);

  const hotelCost = (selectedHotelData?.price || 0) * 7;
  const flightCost = selectedFlightData?.price || 0;
  const tripCost = hotelCost + flightCost;
  const unlockFee = 299.0;
  const totalCost = tripCost + unlockFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      {/* Hero Header with Rotating Banner */}
      <header className="relative overflow-hidden">
        {/* Rotating Background Images */}
        <div className="relative h-[300px] md:h-[375px]">
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url("${image.url}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            </div>
          ))}

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wide text-center drop-shadow-2xl" style={{ fontFamily: 'var(--font-playfair)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              Your Mediterranean Escape Awaits
            </h1>
            <p className="text-2xl md:text-3xl font-medium mb-4 text-white text-center drop-shadow-lg" style={{ fontFamily: 'var(--font-lora)', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              7 Days of Sun, Sea, and Unforgettable Memories
            </p>
            <p className="text-xl md:text-2xl font-semibold text-white/95 max-w-3xl mx-auto text-center drop-shadow-lg mb-6" style={{ fontFamily: 'var(--font-lora)', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              December 10-17, 2025
            </p>

            {/* Countdown Timer */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20 shadow-2xl">
              <div className="flex gap-4 md:gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {timeLeft.months}
                  </div>
                  <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-lora)' }}>
                    Months
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {timeLeft.days}
                  </div>
                  <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-lora)' }}>
                    Days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {timeLeft.hours}
                  </div>
                  <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-lora)' }}>
                    Hours
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {timeLeft.minutes}
                  </div>
                  <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-lora)' }}>
                    Minutes
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Indicator */}
            <div className="absolute bottom-8 flex gap-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Trip Description Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-[#0f4c81] via-[#1e3a8a] to-[#155e75] rounded-3xl shadow-2xl p-12 md:p-16 border-2 border-cyan-300/30 hover:shadow-3xl hover:-translate-y-1 transition-all duration-500 ease-in-out overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Experience the Magic of the Mediterranean
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-300 to-teal-300 mx-auto mb-8 rounded-full shadow-lg"></div>

            <p className="text-lg md:text-xl text-blue-50 leading-relaxed mb-6 text-center max-w-4xl mx-auto" style={{ fontFamily: 'var(--font-lora)' }}>
              Embark on an extraordinary 7-day journey through the sun-drenched
              shores of the Mediterranean. Discover pristine beaches with
              crystal-clear azure waters, explore ancient villages perched on
              cliffsides, and indulge in world-class cuisine at seaside tavernas.
            </p>
            <p className="text-base md:text-lg text-blue-100 leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-lora)' }}>
              From private boat excursions to hidden grottos, wine tastings at
              family vineyards, and sunset dinners overlooking the sea, every
              moment has been carefully curated to create memories that will last
              a lifetime.
            </p>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a8a] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            Select Your Accommodation
          </h2>
          <p className="text-lg text-gray-700" style={{ fontFamily: 'var(--font-lora)' }}>
            Choose from our handpicked selection of Mediterranean properties
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {hotelOptions.map((hotel) => {
            const isSelected = selectedHotel === hotel.id;
            return (
              <div
                key={hotel.id}
                onClick={() => setSelectedHotel(hotel.id)}
                className={`relative cursor-pointer rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-3 hover:shadow-3xl border-4 ${
                  isSelected
                    ? "border-orange-500 opacity-100 scale-105"
                    : "border-gray-200 opacity-60 grayscale-[50%] hover:opacity-80"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white rounded-full p-3 shadow-lg">
                    <Check className="w-6 h-6" />
                  </div>
                )}

                <div className="relative h-64">
                  <img
                    src={hotel.image}
                    alt={hotel.type}
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(2px)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {hotel.type}
                    </h3>
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-4">{hotel.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-[#1e3a8a]">
                        ${hotel.price}
                      </span>
                      <span className="text-gray-600"> /night</span>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      7 nights
                      <div className="font-bold text-gray-900">
                        ${hotel.price * 7}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a8a] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            Select Your Flight
          </h2>
          <p className="text-lg text-gray-700" style={{ fontFamily: 'var(--font-lora)' }}>
            Choose the flight option that best suits your schedule and budget
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {flightOptions.map((flight) => {
            const isSelected = selectedFlight === flight.id;
            return (
              <div
                key={flight.id}
                onClick={() => setSelectedFlight(flight.id)}
                className={`relative cursor-pointer rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-3 hover:shadow-3xl border-4 ${
                  isSelected
                    ? "border-orange-500 opacity-100 scale-105"
                    : "border-gray-200 opacity-60 grayscale-[50%] hover:opacity-80"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white rounded-full p-3 shadow-lg">
                    <Check className="w-6 h-6" />
                  </div>
                )}

                <div className="relative h-64">
                  <img
                    src={flight.image}
                    alt={flight.type}
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(2px)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="bg-white p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {flight.type}
                    </h3>
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-4">{flight.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{flight.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stops:</span>
                      <span className="font-semibold">{flight.stops}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-[#1e3a8a]">
                        ${flight.price}
                      </span>
                      <span className="text-gray-600"> roundtrip</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Total Cost Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-[#1e3a8a] via-blue-700 to-cyan-600 rounded-3xl shadow-2xl p-10 text-white hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 ease-in-out">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
            Your Trip Summary
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/30">
              <div>
                <div className="font-semibold text-lg">
                  {selectedHotelData?.type}
                </div>
                <div className="text-blue-200 text-sm">
                  {selectedHotelData?.stars} stars • 7 nights
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${hotelCost}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-white/30">
              <div>
                <div className="font-semibold text-lg">
                  {selectedFlightData?.type}
                </div>
                <div className="text-blue-200 text-sm">
                  {selectedFlightData?.duration} • {selectedFlightData?.stops}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${flightCost}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-white/30">
              <div className="text-xl font-semibold">Trip Subtotal</div>
              <div className="text-right">
                <div className="text-2xl font-bold">${tripCost}</div>
                <div className="text-blue-200 text-sm">for 2 travelers</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-white/30">
              <div>
                <div className="text-xl font-semibold">Unlock Fee</div>
                <div className="text-blue-200 text-sm">
                  Access full itinerary details
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${unlockFee.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-2xl font-bold">Total with Unlock Fee</div>
              <div className="text-right">
                <div className="text-4xl font-bold">${totalCost.toFixed(2)}</div>
              </div>
            </div>

            <div className="pt-6">
              <button className="w-full bg-orange-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-orange-600 transition-all duration-300 ease-in-out shadow-2xl hover:shadow-3xl hover:-translate-y-2 transform">
                <Lock className="w-6 h-6 inline mr-3" />
                Unlock Complete Itinerary - ${totalCost.toFixed(2)}
              </button>
              <p className="text-center text-sm text-blue-200 mt-4">
                Secure payment • Instant access • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a8a] text-blue-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                Mediterranean Adventure
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
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
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
