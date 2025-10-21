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
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    description: "Budget-friendly option with one layover",
  },
];

// Mediterranean destination images - AI-generated luxury scenes
const bannerMedia = [
  {
    type: "image",
    url: "/images/header-1.png",
    title: "Mediterranean Cuisine",
  },
  {
    type: "image",
    url: "/images/header-2.png",
    title: "Coastal Paradise",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=1920&q=80",
    title: "Couple Enjoying the Coast",
  },
  {
    type: "image",
    url: "/images/header-3.png",
    title: "Luxury Dining",
  },
  {
    type: "image",
    url: "/images/header-4.png",
    title: "Cliffside Village",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    title: "Solo Traveler Adventure",
  },
  {
    type: "image",
    url: "/images/header-5.png",
    title: "Azure Waters",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1920&q=80",
    title: "Santorini Sunset",
  },
  {
    type: "image",
    url: "/images/header-7.png",
    title: "Farmers Market",
  },
  {
    type: "image",
    url: "/images/header-8.png",
    title: "Mediterranean Experience",
  },
];

// Mock itinerary data
const mockItinerary = [
  {
    day: 1,
    title: "Arrival & Coastal Exploration",
    activities: [
      { time: "Morning", name: "Private Beach Yoga Session", location: "Beachfront Resort" },
      { time: "Afternoon", name: "Guided Old Town Walking Tour", location: "Historic District" },
      { time: "Evening", name: "Sunset Boat Cruise", location: "Marina Bay" },
    ],
    restaurants: [
      { meal: "Lunch", name: "Waterfront Seafood Taverna", cuisine: "Fresh Seafood", stars: 4, price: 3, location: "Waterfront" },
      { meal: "Dinner", name: "Upscale Mediterranean Fusion", cuisine: "Mediterranean Fusion", stars: 5, price: 4, location: "Old Town" },
    ],
  },
  {
    day: 2,
    title: "Island Adventure & Wine Tasting",
    activities: [
      { time: "Morning", name: "Private Catamaran to Hidden Coves", location: "Aegean Sea" },
      { time: "Afternoon", name: "Vineyard Tour & Wine Tasting", location: "Hillside Winery" },
      { time: "Evening", name: "Cooking Class with Local Chef", location: "Villa Terrace" },
    ],
    restaurants: [
      { meal: "Lunch", name: "Traditional Greek Tavern", cuisine: "Traditional Greek", stars: 4, price: 2, location: "Coastal Village" },
      { meal: "Dinner", name: "Farm-to-Table Restaurant", cuisine: "Farm-to-Table", stars: 5, price: 4, location: "Countryside" },
    ],
  },
  {
    day: 3,
    title: "Cultural Immersion & Relaxation",
    activities: [
      { time: "Morning", name: "Ancient Ruins Private Tour", location: "Archaeological Site" },
      { time: "Afternoon", name: "Luxury Spa Experience", location: "Resort Wellness Center" },
      { time: "Evening", name: "Rooftop Sunset Cocktails", location: "Boutique Hotel" },
    ],
    restaurants: [
      { meal: "Lunch", name: "Authentic Mezze Cafe", cuisine: "Small Plates", stars: 4, price: 2, location: "Village Square" },
      { meal: "Dinner", name: "Modern Mediterranean Fine Dining", cuisine: "Modern Mediterranean", stars: 5, price: 4, location: "Harbor View" },
    ],
  },
];

export default function TravelSelection() {
  const [selectedHotel, setSelectedHotel] = useState<string>("h1");
  const [selectedFlight, setSelectedFlight] = useState<string>("f1");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotInterestedModal, setShowNotInterestedModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [editRequest, setEditRequest] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Track when component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate banner media every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerMedia.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer to trip date (December 10, 2025)
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  const selectedHotelData = hotelOptions.find((h) => h.id === selectedHotel);
  const selectedFlightData = flightOptions.find((f) => f.id === selectedFlight);

  const hotelCost = (selectedHotelData?.price || 0) * 7;
  const flightCost = selectedFlightData?.price || 0;
  const tripCost = hotelCost + flightCost;
  const unlockFee = 299.0;
  const totalCost = tripCost + unlockFee;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #faf9f7, #f5f3ef, #fdfcfa)' }}>
      {/* Hero Header with Rotating Banner */}
      <header className="relative overflow-hidden">
        {/* Rotating Background Media (Images and Videos) */}
        <div className="relative h-[300px] md:h-[375px]">
          {bannerMedia.map((media, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                mounted && index === currentImageIndex ? "opacity-100" : index === 0 && !mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${media.url}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "brightness(1.15) saturate(1.3) contrast(1.05)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55"></div>
            </div>
          ))}

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wide text-center drop-shadow-2xl" style={{ fontFamily: 'var(--font-cormorant)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              Your Mediterranean Escape Awaits
            </h1>
            <p className="text-2xl md:text-3xl font-medium mb-4 text-white text-center drop-shadow-lg" style={{ fontFamily: 'var(--font-inter)', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              7 Days of Sun, Sea, and Unforgettable Memories
            </p>
            <p className="text-xl md:text-2xl font-semibold text-white/95 max-w-3xl mx-auto text-center drop-shadow-lg mb-6" style={{ fontFamily: 'var(--font-inter)', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              December 10-17, 2025
            </p>

            {/* Countdown Timer */}
            {mounted && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 md:px-8 py-4 border border-white/20 shadow-2xl">
                <div className="flex gap-2 md:gap-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {timeLeft.months}
                    </div>
                    <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      Months
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {timeLeft.days}
                    </div>
                    <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      Days
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {timeLeft.hours}
                    </div>
                    <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      Hours
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {timeLeft.minutes}
                    </div>
                    <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      Minutes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {timeLeft.seconds}
                    </div>
                    <div className="text-xs md:text-sm uppercase tracking-wider font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
                      Seconds
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Indicator */}
            <div className="absolute bottom-8 flex gap-2">
              {bannerMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (mounted ? index === currentImageIndex : index === 0)
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`View media ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Trip Description Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1a5f7a 0%, #2a7c9e 50%, #1a5f7a 100%)',
          boxShadow: '0 10px 40px rgba(26, 95, 122, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center leading-tight tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Experience the Magic of the Mediterranean
            </h2>
            <div className="w-24 h-0.5 bg-white/40 mx-auto mb-6"></div>

            <p className="text-base md:text-lg text-white/90 leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-inter)' }}>
              Embark on an extraordinary 7-day journey through the sun-drenched
              shores of the Mediterranean. Discover pristine beaches, explore ancient villages,
              and indulge in world-class cuisine at seaside tavernas.
            </p>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a5f7a' }}>
            Select Your Accommodation
          </h2>
          <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
            Choose from our handpicked selection of Mediterranean properties
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {hotelOptions.map((hotel) => {
            const isSelected = selectedHotel === hotel.id;
            return (
              <div
                key={hotel.id}
                onClick={() => setSelectedHotel(hotel.id)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-3 ${
                  isSelected
                    ? "opacity-100 scale-105"
                    : "opacity-60 grayscale-[50%] hover:opacity-80"
                }`}
                style={{
                  boxShadow: isSelected
                    ? '0 8px 30px rgba(193, 105, 79, 0.4), 0 0 0 3px #c1694f'
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  border: isSelected ? 'none' : '1px solid #e5e5e5'
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 text-white rounded-full p-1.5" style={{
                    background: 'linear-gradient(135deg, #c1694f 0%, #a0522d 100%)',
                    boxShadow: '0 2px 8px rgba(193, 105, 79, 0.5)'
                  }}>
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="relative h-32">
                  <img
                    src={hotel.image}
                    alt={hotel.type}
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(2px)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-base font-bold text-gray-900 flex-1">
                      {hotel.type}
                    </h3>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{hotel.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-[#1e3a8a]">
                        ${hotel.price}
                      </span>
                      <span className="text-xs text-gray-600"> /night</span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      7 nights
                      <div className="font-bold text-xs text-gray-900">
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a5f7a' }}>
            Select Your Flight
          </h2>
          <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
            Choose the flight option that best suits your schedule and budget
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {flightOptions.map((flight) => {
            const isSelected = selectedFlight === flight.id;
            return (
              <div
                key={flight.id}
                onClick={() => setSelectedFlight(flight.id)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-3 ${
                  isSelected
                    ? "opacity-100 scale-105"
                    : "opacity-60 grayscale-[50%] hover:opacity-80"
                }`}
                style={{
                  boxShadow: isSelected
                    ? '0 8px 30px rgba(193, 105, 79, 0.4), 0 0 0 3px #c1694f'
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  border: isSelected ? 'none' : '1px solid #e5e5e5'
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 text-white rounded-full p-1.5" style={{
                    background: 'linear-gradient(135deg, #c1694f 0%, #a0522d 100%)',
                    boxShadow: '0 2px 8px rgba(193, 105, 79, 0.5)'
                  }}>
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="relative h-32">
                  <img
                    src={flight.image}
                    alt={flight.type}
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(2px)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="bg-white p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-base font-bold text-gray-900 flex-1">
                      {flight.type}
                    </h3>
                    <Plane className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{flight.description}</p>
                  <div className="space-y-0.5 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{flight.duration}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Stops:</span>
                      <span className="font-semibold">{flight.stops}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-center">
                      <span className="text-xl font-bold text-[#1e3a8a]">
                        ${flight.price}
                      </span>
                      <span className="text-xs text-gray-600"> roundtrip</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Itinerary Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a5f7a' }}>
            Your 3-Day Itinerary Preview
          </h2>
          <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
            A glimpse of the unforgettable experiences awaiting you
          </p>
        </div>

        <div className="space-y-8">
          {mockItinerary.map((day) => (
            <div
              key={day.day}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-white text-xl font-bold px-4 py-2 rounded-full" style={{
                    fontFamily: 'var(--font-cormorant)',
                    background: 'linear-gradient(135deg, #1a5f7a 0%, #2a7c9e 100%)',
                    boxShadow: '0 2px 8px rgba(26, 95, 122, 0.3)'
                  }}>
                    Day {day.day}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a5f7a' }}>
                    {day.title}
                  </h3>
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                  Activities
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {day.activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100"
                    >
                      <div className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-1">
                        {activity.time}
                      </div>
                      <div className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                        {activity.name}
                      </div>
                      <div className="text-sm text-gray-600">{activity.location}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurants */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                  Dining
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {day.restaurants.map((restaurant, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">
                            {restaurant.meal}
                          </div>
                          <div className="font-bold text-gray-900 text-lg mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</div>
                          <div className="text-xs text-gray-500">{restaurant.location}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-yellow-500">
                            {"★".repeat(restaurant.stars)}
                          </div>
                          <div className="text-green-600 font-semibold">
                            {"$".repeat(restaurant.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Total Cost Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl p-6 text-white transition-all duration-300 ease-in-out" style={{
          background: 'linear-gradient(135deg, #1a5f7a 0%, #2a7c9e 50%, #1a5f7a 100%)',
          boxShadow: '0 10px 40px rgba(26, 95, 122, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Your Trip Summary
          </h2>
          <div className="max-w-md mx-auto space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div>
                <div className="font-semibold text-base">
                  {selectedHotelData?.type}
                </div>
                <div className="text-blue-100 text-sm">
                  {selectedHotelData?.stars} stars • 7 nights
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">${hotelCost}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div>
                <div className="font-semibold text-base">
                  {selectedFlightData?.type}
                </div>
                <div className="text-blue-100 text-sm">
                  {selectedFlightData?.duration} • {selectedFlightData?.stops}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">${flightCost}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div className="text-base font-semibold">Trip Subtotal</div>
              <div className="text-right">
                <div className="text-xl font-bold">${tripCost}</div>
                <div className="text-blue-100 text-sm">for 2 travelers</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <div className="text-lg font-bold">Total</div>
              <div className="text-right">
                <div className="text-2xl font-bold">${tripCost}</div>
              </div>
            </div>

            <div className="pt-5 space-y-2.5">
              <button
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: 'linear-gradient(135deg, #c1694f 0%, #a0522d 100%)',
                  boxShadow: '0 4px 15px rgba(193, 105, 79, 0.4)'
                }}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                I love it! Unlock Complete Itinerary - ${tripCost}
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: 'linear-gradient(135deg, #c1694f 0%, #a0522d 100%)',
                  boxShadow: '0 4px 15px rgba(193, 105, 79, 0.4)'
                }}
              >
                I like it but I want to make edits
              </button>

              <button
                onClick={() => setShowNotInterestedModal(true)}
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: 'linear-gradient(135deg, #c1694f 0%, #a0522d 100%)',
                  boxShadow: '0 4px 15px rgba(193, 105, 79, 0.4)'
                }}
              >
                Not Interested
              </button>

              <p className="text-center text-sm text-blue-100 mt-3">
                Secure payment • Instant access • All sales are final
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
              <p className="text-blue-300 mb-4">
                Your gateway to unforgettable Mediterranean experiences
              </p>
              <a
                href="/wanderlog-import"
                className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Import
              </a>
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

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => {
                setShowQuestionModal(false);
                setQuestion("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-3xl font-bold text-[#1e3a8a] mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
              How Can We Help?
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
              Have questions about this Mediterranean adventure? We're here to help make your dream vacation a reality.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                  Your Question or Comment
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask us anything about the itinerary, accommodations, activities, or pricing..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowQuestionModal(false);
                    setQuestion("");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle question submission
                    console.log("Question submitted:", question);
                    alert("Thank you! We'll get back to you shortly.");
                    setShowQuestionModal(false);
                    setQuestion("");
                  }}
                  disabled={!question.trim()}
                  className="flex-1 px-6 py-3 bg-[#1e3a8a] text-white rounded-full font-bold hover:bg-[#152f6e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Submit Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditRequest("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-3xl font-bold text-[#1e3a8a] mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
              What Would You Like to Change?
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
              Tell us what edits you'd like to make to this itinerary, and we'll customize it to your preferences.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                  Requested Changes
                </label>
                <textarea
                  value={editRequest}
                  onChange={(e) => setEditRequest(e.target.value)}
                  placeholder="Describe the changes you'd like (e.g., different hotel, more activities, dietary preferences, etc.)..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRequest("");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle edit request submission
                    console.log("Edit request submitted:", editRequest);
                    alert("Thank you! We'll update your itinerary and send you a revised version.");
                    setShowEditModal(false);
                    setEditRequest("");
                  }}
                  disabled={!editRequest.trim()}
                  className="flex-1 px-6 py-3 bg-[#1e3a8a] text-white rounded-full font-bold hover:bg-[#152f6e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not Interested Modal */}
      {showNotInterestedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => {
                setShowNotInterestedModal(false);
                setNotInterestedReason("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-3xl font-bold text-[#1e3a8a] mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
              We'd Love Your Feedback
            </h3>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
              Help us improve! Please let us know why this itinerary isn't the right fit for you.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                  Reason for Not Being Interested <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notInterestedReason}
                  onChange={(e) => setNotInterestedReason(e.target.value)}
                  placeholder="Please share your feedback (e.g., wrong destination, budget concerns, timing issues, etc.)..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowNotInterestedModal(false);
                    setNotInterestedReason("");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle not interested submission
                    console.log("Not interested reason:", notInterestedReason);
                    alert("Thank you for your feedback. We appreciate your time!");
                    setShowNotInterestedModal(false);
                    setNotInterestedReason("");
                  }}
                  disabled={!notInterestedReason.trim()}
                  className="flex-1 px-6 py-3 bg-[#1e3a8a] text-white rounded-full font-bold hover:bg-[#152f6e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
