"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Star, Plane, Building2, Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface HotelOption {
  id: string;
  name: string;
  room_type?: string | null;
  amenities?: string[];
  rating?: number | null;
  price: number;
  currency: string;
  address?: string | null;
  description?: string;
}

interface FlightOption {
  id: string;
  airline: string;
  flight_code?: string | null;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  baggage_options?: string | null;
}

interface TripData {
  id: string;
  title: string;
  creator?: string;
  start_date: string;
  end_date: string;
  header_images: string[];
  notes?: string | null;
  wanderlog_url: string;
  hotels: HotelOption[];
  flights: FlightOption[];
  images: any[];
  activities: {
    id: string;
    name: string;
    description?: string;
    location?: string;
    rating?: number;
    images?: { url: string; alt?: string }[];
  }[];
  dailySchedule: {
    day_number: number;
    date: string;
    items: {
      type: string;
      name: string;
      time?: string;
      description?: string;
    }[];
  }[];
}

export default function TeaserPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [selectedFlight, setSelectedFlight] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotInterestedModal, setShowNotInterestedModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [editRequest, setEditRequest] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Track when component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/trips/${tripId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch trip data");
        }

        const data = await response.json();
        setTripData(data);

        // Auto-select first hotel and flight if available
        if (data.hotels && data.hotels.length > 0) {
          setSelectedHotel(data.hotels[0].id || 'hotel-0');
        }
        if (data.flights && data.flights.length > 0) {
          setSelectedFlight(data.flights[0].id || 'flight-0');
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError(err instanceof Error ? err.message : "Failed to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // Auto-rotate banner images every 6 seconds
  useEffect(() => {
    if (!tripData?.header_images || tripData.header_images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % tripData.header_images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tripData]);

  // Countdown timer to trip start date
  useEffect(() => {
    if (!mounted || !tripData?.start_date) return;

    const calculateTimeLeft = () => {
      // Parse date and set to noon to avoid timezone issues
      const tripDate = new Date(tripData.start_date + 'T12:00:00');
      const now = new Date();

      if (tripDate > now) {
        const totalDays = Math.floor((tripDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const months = Math.floor(totalDays / 30);
        const remainingDays = totalDays % 30;
        const difference = tripDate.getTime() - now.getTime();
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ months, days: remainingDays, hours, minutes, seconds });
      } else {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [mounted, tripData]);

  // Calculate pricing
  const selectedHotelData = tripData?.hotels.find((h) => h.id === selectedHotel);
  const selectedFlightData = tripData?.flights.find((f) => f.id === selectedFlight);

  const calculateNights = () => {
    if (!tripData) return 7;
    const start = new Date(tripData.start_date);
    const end = new Date(tripData.end_date);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 7;
  };

  const nights = calculateNights();
  const hotelCost = parseFloat(((selectedHotelData?.price || 0) * nights).toFixed(2));
  const flightCost = parseFloat((selectedFlightData?.price || 0).toFixed(2));
  const tripCost = parseFloat((hotelCost + flightCost).toFixed(2));
  const unlockFee = 299.0;
  const totalCost = parseFloat((tripCost + unlockFee).toFixed(2));

  // Format dates
  const formatDateRange = () => {
    if (!tripData) return "";
    const start = new Date(tripData.start_date);
    const end = new Date(tripData.end_date);
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  };

  // Generate catchy subtitle based on trip notes or destination
  const generateSubtitle = () => {
    if (!tripData) return "";

    // Try to use first sentence of notes if available
    if (tripData.notes) {
      const firstSentence = tripData.notes.split(/[.!]/)[0];
      if (firstSentence && firstSentence.length < 100) {
        return firstSentence;
      }
    }

    // Fallback: generate based on duration and destination
    const start = new Date(tripData.start_date);
    const end = new Date(tripData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const destination = tripData.title.replace(/Trip to |Visit to |Journey to /i, '').trim();

    return `${days} Days of Adventure, Discovery, and Unforgettable Memories in ${destination}`;
  };

  // Generate descriptive day title
  const generateDayTitle = (day: any) => {
    // Check if the date field contains a descriptive title (more than just date)
    const datePattern = /^[A-Za-z]{3}\s+\d{1,2}\/\d{1,2}$/; // Matches "Fri 6/27"

    if (!datePattern.test(day.date)) {
      // If it's not just a simple date, it might already contain a title
      // Extract any text after the date pattern
      const match = day.date.match(/^[A-Za-z]{3}\s+\d{1,2}\/\d{1,2}\s*-?\s*(.+)$/);
      if (match && match[1]) {
        return match[1];
      }
      // Otherwise use the whole thing
      return day.date;
    }

    // Generate a title based on activities for this day
    const activities = day.items?.filter((item: any) => item.type === 'activity') || [];

    if (activities.length === 0) {
      return 'Explore & Discover';
    }

    // Generate title based on first day, last day, or activity types
    if (day.day_number === 1) {
      return 'Arrival & Getting Started';
    } else if (tripData && day.day_number === tripData.dailySchedule.length) {
      return 'Final Explorations & Departure';
    } else if (activities.length >= 3) {
      return 'Full Day of Adventures';
    } else if (activities.length >= 2) {
      return 'Discovery & Exploration';
    } else {
      return 'Sightseeing & Relaxation';
    }
  };

  // Determine theme colors based on destination
  const getThemeColors = () => {
    // Default Mediterranean colors
    return {
      primary: "#1a5f7a",
      secondary: "#2a7c9e",
      accent: "#c1694f",
    };
  };

  // Classify flight based on price
  const getFlightClass = (price: number) => {
    if (price < 400) return "Economy Flight";
    if (price < 800) return "Standard Flight";
    return "Premium Flight";
  };

  // Generate descriptive hotel name based on amenities and rating
  const getHotelDescription = (hotel: HotelOption) => {
    const rating = hotel.rating || 3;
    const amenities = hotel.amenities || [];

    // Determine hotel tier
    let tier = "";
    if (rating >= 4.5) {
      tier = "Luxury";
    } else if (rating >= 4) {
      tier = "Premium";
    } else if (rating >= 3.5) {
      tier = "Comfort";
    } else {
      tier = "Budget-Friendly";
    }

    // Determine hotel type based on amenities
    let type = "Hotel";
    if (amenities.includes("Free breakfast") || amenities.includes("Paid breakfast")) {
      type = "Inn & Suites";
    }
    if (amenities.includes("Indoor pool") || amenities.includes("Hot tub")) {
      type = "Resort";
    }
    if (amenities.includes("Business center")) {
      type = "Business Hotel";
    }

    // Determine special features
    const features = [];
    if (amenities.includes("Free breakfast")) {
      features.push("with Breakfast");
    }
    if (amenities.includes("Indoor pool")) {
      features.push("Pool & Spa");
    }
    if (amenities.includes("Free parking")) {
      features.push("Free Parking");
    }

    const featureText = features.length > 0 ? ` - ${features[0]}` : "";

    return `${tier} ${type}${featureText}`;
  };

  const colors = getThemeColors();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-slate-600">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <p className="text-lg text-red-600 mb-4">{error || "Trip not found"}</p>
          <Link
            href="/import"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Import
          </Link>
        </div>
      </div>
    );
  }

  // Get banner images (header_images or fallback to activity images)
  const bannerImages = tripData.header_images && tripData.header_images.length > 0
    ? tripData.header_images
    : tripData.images
        .filter((img) => img.url)
        .slice(0, 6)
        .map((img) => img.url);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #faf9f7, #f5f3ef, #fdfcfa)' }}>
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/import"
          className="inline-flex items-center text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Import
        </Link>
      </div>

      {/* Hero Header with Rotating Banner */}
      <header className="relative overflow-hidden">
        <div className="relative h-[300px] md:h-[375px]">
          {bannerImages.length > 0 ? (
            bannerImages.map((imageUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  mounted && index === currentImageIndex ? "opacity-100" : index === 0 && !mounted ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("${imageUrl}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(1.15) saturate(1.3) contrast(1.05)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55"></div>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"></div>
          )}

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-wide text-center drop-shadow-2xl" style={{ fontFamily: 'var(--font-cormorant)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              {tripData.title}
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl mx-auto text-center drop-shadow-lg mb-4 italic" style={{ fontFamily: 'var(--font-inter)', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              {generateSubtitle()}
            </p>
            <p className="text-base md:text-lg font-semibold text-white/85 mx-auto text-center drop-shadow-lg mb-6" style={{ fontFamily: 'var(--font-inter)', textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              {formatDateRange()}
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
            {bannerImages.length > 1 && (
              <div className="absolute bottom-8 flex gap-2">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (mounted ? index === currentImageIndex : index === 0)
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Trip Description Section */}
      {tripData.notes && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden" style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
            boxShadow: '0 10px 40px rgba(26, 95, 122, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center leading-tight tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Experience This Amazing Journey
              </h2>
              <div className="w-24 h-0.5 bg-white/40 mx-auto mb-6"></div>

              <p className="text-base md:text-lg text-white/90 leading-relaxed text-center max-w-3xl mx-auto" style={{ fontFamily: 'var(--font-inter)' }}>
                {tripData.notes}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Hotels Section */}
      {tripData.hotels && tripData.hotels.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Select Your Accommodation
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Choose from our handpicked selection of properties
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tripData.hotels.map((hotel, hotelIdx) => {
              const hotelKey = hotel.id || `hotel-${hotelIdx}`;
              const isSelected = selectedHotel === hotelKey;
              // Use real images from scraped data, cycling through available images
              const availableImages = tripData.images.filter((img) => img.url);
              const hotelImage = availableImages.length > 0
                ? availableImages[hotelIdx % availableImages.length].url
                : `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800`;

              return (
                <div
                  key={hotelKey}
                  onClick={() => setSelectedHotel(hotelKey)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-3 ${
                    isSelected
                      ? "opacity-100 scale-105"
                      : "opacity-60 grayscale-[50%] hover:opacity-80"
                  }`}
                  style={{
                    boxShadow: isSelected
                      ? `0 8px 30px rgba(193, 105, 79, 0.4), 0 0 0 3px ${colors.accent}`
                      : '0 4px 15px rgba(0, 0, 0, 0.1)',
                    border: isSelected ? 'none' : '1px solid #e5e5e5'
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 text-white rounded-full p-1.5" style={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, #a0522d 100%)`,
                      boxShadow: '0 2px 8px rgba(193, 105, 79, 0.5)'
                    }}>
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <div className="relative h-32">
                    <img
                      src={hotelImage}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      style={{ filter: "blur(2px)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: hotel.rating ? Math.round(hotel.rating) : 4 }).map((_, i) => (
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
                        {getHotelDescription(hotel)}
                      </h3>
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {hotel.room_type || "Premium accommodation with modern amenities"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-[#1e3a8a]">
                          ${hotel.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-600"> /night</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {nights} nights
                        <div className="font-bold text-xs text-gray-900">
                          ${(hotel.price * nights).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Flights Section */}
      {tripData.flights && tripData.flights.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Select Your Flight
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Choose the flight option that best suits your schedule and budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tripData.flights.map((flight, flightIdx) => {
              const isSelected = selectedFlight === flight.id;
              // Use real images from scraped data, offset from hotel images
              const availableImages = tripData.images.filter((img) => img.url);
              const imageIndex = (tripData.hotels.length + flightIdx) % availableImages.length;
              const flightImage = availableImages.length > 0
                ? availableImages[imageIndex].url
                : `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800`;

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
                      ? `0 8px 30px rgba(193, 105, 79, 0.4), 0 0 0 3px ${colors.accent}`
                      : '0 4px 15px rgba(0, 0, 0, 0.1)',
                    border: isSelected ? 'none' : '1px solid #e5e5e5'
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 text-white rounded-full p-1.5" style={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, #a0522d 100%)`,
                      boxShadow: '0 2px 8px rgba(193, 105, 79, 0.5)'
                    }}>
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <div className="relative h-32">
                    <img
                      src={flightImage}
                      alt={flight.airline}
                      className="w-full h-full object-cover"
                      style={{ filter: "blur(2px)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  <div className="bg-white p-3">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-base font-bold text-gray-900 flex-1">
                        {getFlightClass(flight.price)}
                      </h3>
                      <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {flight.departure_airport} → {flight.arrival_airport}
                    </p>
                    <div className="space-y-0.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Departure:</span>
                        <span className="font-semibold">{flight.departure_time}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Arrival:</span>
                        <span className="font-semibold">{flight.arrival_time}</span>
                      </div>
                    </div>
                    {flight.baggage_options && (
                      <div className="mb-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        {flight.baggage_options}
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-center">
                        <span className="text-xl font-bold text-[#1e3a8a]">
                          ${flight.price.toFixed(2)}
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
      )}

      {/* Itinerary Section */}
      {tripData.dailySchedule && tripData.dailySchedule.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Your {tripData.dailySchedule.length}-Day Itinerary Preview
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              A glimpse of the unforgettable experiences awaiting you
            </p>
          </div>

          <div className="space-y-8">
            {tripData.dailySchedule.map((day) => (
              <div
                key={day.day_number}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-white text-xl font-bold px-4 py-2 rounded-full" style={{
                        fontFamily: 'var(--font-cormorant)',
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                        boxShadow: '0 2px 8px rgba(26, 95, 122, 0.3)'
                      }}>
                        Day {day.day_number}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
                        {generateDayTitle(day)}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 ml-2" style={{ fontFamily: 'var(--font-inter)' }}>
                      {day.date}
                    </p>
                  </div>
                </div>

                {/* Activities */}
                {day.items && day.items.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                        Activities
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {day.items.filter((item: any) => item.type === 'activity').map((item: any, idx: number) => {
                          // Find the full activity details
                          const activityDetails = tripData.activities.find(
                            (act) => act.name === item.name
                          );

                          // Get activity image
                          const activityImage = activityDetails?.images?.[0]?.url;

                          // Assign time of day based on index
                          const timeLabels = ['MORNING', 'AFTERNOON', 'EVENING'];
                          const timeLabel = timeLabels[idx % 3];

                          // Use the full description (NO ADDRESSES)
                          const activityDescription = item.description || activityDetails?.description || 'Local attraction worth exploring';

                          return (
                            <div
                              key={idx}
                              className="bg-blue-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow border border-blue-100"
                            >
                              {activityImage && (
                                <div className="relative h-32 w-full">
                                  <img
                                    src={activityImage}
                                    alt="Activity"
                                    className="w-full h-full object-cover"
                                    style={{ filter: "blur(2px)" }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>
                              )}
                              <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-xs font-bold text-blue-700 tracking-wider">
                                    {timeLabel}
                                  </div>
                                  {activityDetails?.rating && (
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: Math.round(activityDetails.rating) }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                                  {activityDescription}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dining Section */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                        Dining
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {day.items.filter((item: any) => item.type === 'activity').slice(0, 2).map((item: any, idx: number) => {
                          // Find the full activity details
                          const activityDetails = tripData.activities.find(
                            (act) => act.name === item.name
                          );

                          // Get activity image
                          const diningImage = activityDetails?.images?.[0]?.url;

                          // Assign meal time
                          const mealLabels = ['LUNCH', 'DINNER'];
                          const mealLabel = mealLabels[idx % 2];

                          // Generate price indicator based on rating
                          const priceLevel = activityDetails?.rating
                            ? Math.ceil(activityDetails.rating)
                            : 3;
                          const priceIndicator = '$'.repeat(Math.min(priceLevel, 4));

                          // Use the full description (NO ADDRESSES)
                          const diningDescription = item.description || activityDetails?.description || 'Local dining establishment serving quality cuisine';

                          return (
                            <div
                              key={idx}
                              className="bg-orange-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow border border-orange-100"
                            >
                              {diningImage && (
                                <div className="relative h-32 w-full">
                                  <img
                                    src={diningImage}
                                    alt="Restaurant"
                                    className="w-full h-full object-cover"
                                    style={{ filter: "blur(2px)" }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>
                              )}
                              <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="text-xs font-bold text-orange-700 tracking-wider">
                                    {mealLabel}
                                  </div>
                                  {activityDetails?.rating && (
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: Math.round(activityDetails.rating) }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                                  {diningDescription}
                                </div>
                                <div className="text-sm font-bold text-green-700">
                                  {priceIndicator}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Accommodations */}
                {day.items.filter((item: any) => item.type === 'accommodation').length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                      Accommodation
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {day.items.filter((item: any) => item.type === 'accommodation').map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100"
                        >
                          <div className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-600">{item.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Total Cost Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl p-6 text-white transition-all duration-300 ease-in-out" style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
          boxShadow: '0 10px 40px rgba(26, 95, 122, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Your Trip Summary
          </h2>
          <div className="max-w-md mx-auto space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {selectedHotelData && (
              <div className="flex justify-between items-center pb-3 border-b border-white/30">
                <div>
                  <div className="font-semibold text-base">
                    {getHotelDescription(selectedHotelData)}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {selectedHotelData.rating ? `${selectedHotelData.rating} stars` : ""} • {nights} nights
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${hotelCost.toFixed(2)}</div>
                </div>
              </div>
            )}

            {selectedFlightData && (
              <div className="flex justify-between items-center pb-3 border-b border-white/30">
                <div>
                  <div className="font-semibold text-base">
                    {getFlightClass(selectedFlightData.price)}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {selectedFlightData.departure_time} • {selectedFlightData.departure_airport} → {selectedFlightData.arrival_airport}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${flightCost.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div className="text-base font-semibold">Trip Subtotal</div>
              <div className="text-right">
                <div className="text-xl font-bold">${tripCost.toFixed(2)}</div>
                <div className="text-blue-100 text-sm">for 2 travelers</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <div className="text-lg font-bold">Total</div>
              <div className="text-right">
                <div className="text-2xl font-bold">${tripCost.toFixed(2)}</div>
              </div>
            </div>

            <div className="pt-5 space-y-2.5">
              <button
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #a0522d 100%)`,
                  boxShadow: '0 4px 15px rgba(193, 105, 79, 0.4)'
                }}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                I love it! Unlock Complete Itinerary - ${tripCost.toFixed(2)}
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #a0522d 100%)`,
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
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #a0522d 100%)`,
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
                {tripData.title}
              </div>
              <p className="text-blue-300 mb-4">
                Your gateway to unforgettable experiences
              </p>
              <Link
                href="/import"
                className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Import
              </Link>
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
              Have questions about this adventure? We're here to help make your dream vacation a reality.
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
