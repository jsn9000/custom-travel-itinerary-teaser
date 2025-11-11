"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Star, Plane, Building2, Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface HotelOption {
  id: string;
  name: string;
  roomType?: string | null;
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
  flightCode?: string | null;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  baggageOptions?: string | null;
}

interface CarRentalOption {
  id: string;
  company: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  basePrice: number;
  withCDW: number;
  currency: string;
  insuranceIncluded: string;
  securityDeposit: number;
  notes?: string;
}

interface TripData {
  id: string;
  title: string;
  creator?: string;
  startDate: string;
  endDate: string;
  headerImages: string[];
  notes?: string | null;
  wanderlogUrl: string;
  hotels: HotelOption[];
  hotelsOaxaca?: HotelOption[];
  hotelsMexicoCity?: HotelOption[];
  flights: FlightOption[];
  carRentals?: CarRentalOption[];
  activities: {
    id: string;
    name: string;
    description?: string;
    location?: string;
    rating?: number;
    hours?: string;
    address?: string;
    contact?: string;
    images?: { url: string; alt?: string; caption?: string }[];
  }[];
  dailySchedule: {
    dayNumber: number;
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
  const [selectedHotelOaxaca, setSelectedHotelOaxaca] = useState<string>("");
  const [selectedHotelMexicoCity, setSelectedHotelMexicoCity] = useState<string>("");
  const [selectedFlight, setSelectedFlight] = useState<string>("");
  const [selectedCarRental, setSelectedCarRental] = useState<string>("");
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

        // Override dates and hotels for Oaxaca trip
        if (tripId === 'bab29d55-7e10-46ed-b702-e0f2a342fcd7') {
          data.startDate = '2026-02-17';
          data.endDate = '2026-02-25';

          // Split hotels into Oaxaca (Feb 17-22) and Mexico City (Feb 22-25)
          data.hotelsOaxaca = [
            {
              id: "hotel-azucenas",
              name: "C. Azucenas 113",
              address: "C. Azucenas 113, Oaxaca",
              roomType: "Private Airbnb Apartment",
              amenities: ["Hosted by 9-year Superhost", "High ratings", "10min to city center"],
              rating: 4.5,
              price: 497,
              currency: "USD"
            },
            {
              id: "hotel-vasconcelos",
              name: "Lic. José Vasconcelos 307",
              address: "Lic. José Vasconcelos 307, Oaxaca",
              roomType: "Private Airbnb Apartment",
              amenities: ["5min drive to city center", "18min walk to center", "Modern amenities"],
              rating: 4.5,
              price: 565,
              currency: "USD"
            },
            {
              id: "hotel-corazon",
              name: "Hotel con Corazón Oaxaca",
              address: "Oaxaca City Center",
              roomType: "Queen Room including breakfast",
              amenities: ["Free breakfast", "City center location", "Premium service"],
              rating: 4.7,
              price: 705,
              currency: "USD"
            }
          ];

          data.hotelsMexicoCity = [
            {
              id: "hotel-garibaldi",
              name: "Hotel Plaza Garibaldi",
              address: "Plaza Garibaldi, Mexico City",
              roomType: "1 King Bed, Standard Room, Non Smoking",
              amenities: ["Free breakfast", "Wyndham Rewards", "Central location"],
              rating: 4.0,
              price: 193,
              currency: "USD"
            },
            {
              id: "hotel-zocalo",
              name: "Hotel MX zócalo",
              address: "El Zócalo, Mexico City",
              roomType: "1 Queen Bed Non Smoking",
              amenities: ["Free breakfast", "Wyndham Rewards", "Historic district"],
              rating: 4.2,
              price: 227,
              currency: "USD"
            },
            {
              id: "hotel-canada",
              name: "Hotel Canada Central & Rooftop",
              address: "Central Mexico City",
              roomType: "Standard Double Room",
              amenities: ["Free breakfast", "Rooftop terrace", "Central location"],
              rating: 4.3,
              price: 249,
              currency: "USD"
            },
            {
              id: "hotel-mas-centro",
              name: "Hotel MX más centro",
              address: "Centro, Mexico City",
              roomType: "Suite with 2 Queen Beds Non Smoking",
              amenities: ["Free breakfast", "Wyndham Rewards", "Suite accommodation"],
              rating: 4.1,
              price: 240,
              currency: "USD"
            }
          ];

          // Keep hotels array empty for Oaxaca trip (using separate arrays)
          data.hotels = [];

          // Add car rental options for Oaxaca trip
          data.carRentals = [
            {
              id: "car-oaxaca",
              company: "Localiza",
              pickupLocation: "OAX",
              dropoffLocation: "OAX",
              pickupDate: "Feb 17",
              dropoffDate: "Feb 22",
              basePrice: 140,
              withCDW: 211,
              currency: "USD",
              insuranceIncluded: "Insurance included except CDW",
              securityDeposit: 758,
              notes: "Credit card required for security deposit"
            },
            {
              id: "car-mexico-city",
              company: "Keddy",
              pickupLocation: "MEX",
              dropoffLocation: "MEX",
              pickupDate: "Feb 22",
              dropoffDate: "Feb 24",
              basePrice: 24,
              withCDW: 72,
              currency: "USD",
              insuranceIncluded: "Insurance included except CDW",
              securityDeposit: 975,
              notes: "Credit card required for security deposit"
            }
          ];

          // Override flights with detailed leg information for Oaxaca trip
          data.flights = [
            {
              id: "flight-oaxaca",
              airline: "Round-trip Flight Package",
              departureAirport: "JFK",
              arrivalAirport: "OAX",
              departureTime: "Feb 17, 2026",
              arrivalTime: "Feb 25, 2026",
              price: 1009,
              currency: "USD",
              flightCode: null,
              baggageOptions: "Included: 1 carry-on, 1 checked bag",
              // Detailed flight legs with individual pricing
              legs: [
                {
                  route: "JFK-OAX",
                  date: "Feb 17, 2026",
                  price: 559,
                  description: "New York to Oaxaca (layover in MEX for 2hrs)"
                },
                {
                  route: "OAX-MEX",
                  date: "Feb 22, 2026",
                  price: 109,
                  description: "Oaxaca to Mexico City (nonstop)"
                },
                {
                  route: "MEX-JFK",
                  date: "Feb 25, 2026",
                  price: 450,
                  description: "Mexico City to New York (nonstop)"
                }
              ]
            }
          ];
        }

        setTripData(data);

        // Auto-select first hotel, flight, and car rental if available
        if (data.hotels && data.hotels.length > 0) {
          setSelectedHotel(data.hotels[0].id || 'hotel-0');
        }
        if (data.hotelsOaxaca && data.hotelsOaxaca.length > 0) {
          setSelectedHotelOaxaca(data.hotelsOaxaca[0].id || 'hotel-oaxaca-0');
        }
        if (data.hotelsMexicoCity && data.hotelsMexicoCity.length > 0) {
          setSelectedHotelMexicoCity(data.hotelsMexicoCity[0].id || 'hotel-mexico-0');
        }
        if (data.flights && data.flights.length > 0) {
          setSelectedFlight(data.flights[0].id || 'flight-0');
        }
        if (data.carRentals && data.carRentals.length > 0) {
          setSelectedCarRental(data.carRentals[0].id || 'car-0');
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
    if (!mounted || !tripData?.headerImages?.length) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % (tripData.headerImages.length || 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [mounted, tripData?.headerImages]);

  // Countdown timer to trip start date
  useEffect(() => {
    if (!mounted || !tripData?.startDate) return;

    const calculateTimeLeft = () => {
      // Parse date and set to noon to avoid timezone issues
      const tripDate = new Date(tripData.startDate + 'T12:00:00');
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
  const selectedHotelOaxacaData = tripData?.hotelsOaxaca?.find((h) => h.id === selectedHotelOaxaca);
  const selectedHotelMexicoCityData = tripData?.hotelsMexicoCity?.find((h) => h.id === selectedHotelMexicoCity);
  const selectedFlightData = tripData?.flights.find((f) => f.id === selectedFlight);
  const selectedCarRentalData = tripData?.carRentals?.find((c) => c.id === selectedCarRental);

  const calculateNights = () => {
    if (!tripData) return 7;
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 7;
  };

  const nights = calculateNights();

  // Calculate hotel costs - handle separate Oaxaca/Mexico City hotels or single hotel
  let hotelCost = 0;
  if (selectedHotelOaxacaData && selectedHotelMexicoCityData) {
    // Oaxaca trip with two separate hotels - prices are already total for entire stay
    const oaxacaHotelCost = parseFloat((selectedHotelOaxacaData.price || 0).toFixed(2));
    const mexicoCityHotelCost = parseFloat((selectedHotelMexicoCityData.price || 0).toFixed(2));
    hotelCost = parseFloat((oaxacaHotelCost + mexicoCityHotelCost).toFixed(2));
  } else {
    // Regular trip with single hotel
    hotelCost = parseFloat(((selectedHotelData?.price || 0) * nights).toFixed(2));
  }

  const flightCost = parseFloat((selectedFlightData?.price || 0).toFixed(2));
  const carRentalCost = parseFloat((selectedCarRentalData?.basePrice || 0).toFixed(2));
  const foodBudget = 500.0; // Fixed food budget for the trip
  // Trip cost excludes flights - includes hotels, car rental, and food budget
  const tripCost = parseFloat((hotelCost + carRentalCost + foodBudget).toFixed(2));
  const unlockFee = 299.0;
  const totalCost = parseFloat((tripCost + unlockFee).toFixed(2));

  // Format dates
  const formatDateRange = () => {
    if (!tripData) return "";
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
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
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const destination = tripData.title.replace(/Trip to |Visit to |Journey to /i, '').trim();

    return `${days} Days of Adventure, Discovery, and Unforgettable Memories in ${destination}`;
  };

  // Generate descriptive day title
  const generateDayTitle = (day: any) => {
    // For Oaxaca trip, skip date entirely and just return descriptive title
    if (isOaxacaTrip) {
      // Generate a title based on activities for this day
      const activities = day.items?.filter((item: any) => item.type === 'activity') || [];

      // Generate title based on first day, last day, or activity types
      if (day.dayNumber === 1) {
        return 'Arrival & Getting Started';
      } else if (tripData && day.dayNumber === tripData.dailySchedule.length) {
        return 'Final Explorations & Departure';
      } else if (activities.length >= 3) {
        return 'Full Day of Adventures';
      } else if (activities.length >= 2) {
        return 'Discovery & Exploration';
      } else {
        return 'Sightseeing & Relaxation';
      }
    }

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
    if (day.dayNumber === 1) {
      return 'Arrival & Getting Started';
    } else if (tripData && day.dayNumber === tripData.dailySchedule.length) {
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
    // Special handling for Oaxaca trip - use custom descriptions based on hotel ID
    if (isOaxacaTrip) {
      const oaxacaDescriptions: { [key: string]: string } = {
        'hotel-azucenas': 'Boutique Apartment Stay - Superhost',
        'hotel-vasconcelos': 'Central Location Private Apartment',
        'hotel-corazon': 'Luxury Boutique Hotel with Breakfast',
        'hotel-garibaldi': 'Comfortable City Center Hotel',
        'hotel-zocalo': 'Historic District Hotel with Breakfast',
        'hotel-canada': 'Central Hotel with Rooftop Terrace',
        'hotel-mas-centro': 'Spacious Suite with Breakfast'
      };

      if (hotel.id && oaxacaDescriptions[hotel.id]) {
        return oaxacaDescriptions[hotel.id];
      }
    }

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

  // Special handling for Oaxaca trip
  const isOaxacaTrip = tripId === 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

  // Use database header images from Wanderlog scrape, fallback to destination-specific images
  let bannerImages = tripData.headerImages && tripData.headerImages.length > 0
    ? tripData.headerImages
    : [
        '/images/edmonton/edmonton-skyline.jpeg',
        '/images/edmonton/edmonton-lights.jpeg',
        '/images/edmonton/edmonton-couple.jpeg',
        '/images/edmonton/edmonton-whitehouse.jpg',
      ];

  // Override with Oaxaca images for the specific trip
  if (isOaxacaTrip) {
    bannerImages = [
      '/oaxaca/images/Playa Zicatela.jpeg',
      '/oaxaca/images/Palacio de Bellas Artes.jpeg',
      '/oaxaca/images/Grutas Tolantongo.jpeg',
      '/oaxaca/images/TEATRO MACEDONIO ALCALÁ.jpeg',
      '/oaxaca/images/Museo Nacional de Antropología.jpeg',
      '/oaxaca/images/Basilica of Our Lady of Guadalupe.jpeg',
    ];
  }

  // Helper function to get Oaxaca activity image based on name
  const getOaxacaActivityImage = (activityName: string): string | null => {
    if (!isOaxacaTrip) return null;

    const nameLower = activityName.toLowerCase();

    // Mapping of activity name keywords to image paths
    const imageMap: { [key: string]: string } = {
      'basilica': '/oaxaca/images/Basilica of Our Lady of Guadalupe.jpeg',
      'guadalupe': '/oaxaca/images/Basilica of Our Lady of Guadalupe.jpeg',
      'biblioteca': '/oaxaca/images/Biblioteca Vasconcelos.jpeg',
      'vasconcelos': '/oaxaca/images/Biblioteca Vasconcelos.jpeg',
      'coyoacan': '/oaxaca/images/Coyoacan Market.jpeg',
      'frida': '/oaxaca/images/Frida Kahlo Museum.jpeg',
      'kahlo': '/oaxaca/images/Frida Kahlo Museum.jpeg',
      'grutas': '/oaxaca/images/Grutas Tolantongo.jpeg',
      'tolantongo': '/oaxaca/images/Grutas Tolantongo.jpeg',
      'antropología': '/oaxaca/images/Museo Nacional de Antropología.jpeg',
      'antropologia': '/oaxaca/images/Museo Nacional de Antropología.jpeg',
      'soumaya': '/oaxaca/images/Museo Soumaya.jpeg',
      'bellas artes': '/oaxaca/images/Palacio de Bellas Artes.jpeg',
      'palacio': '/oaxaca/images/Palacio de Bellas Artes.jpeg',
      'zicatela': '/oaxaca/images/Playa Zicatela.jpeg',
      'playa': '/oaxaca/images/Playa Zicatela.jpeg',
      'coyotepec': '/oaxaca/images/San Bartolo Coyotepec.jpeg',
      'tilcajete': '/oaxaca/images/San Martín Tilcajete.jpeg',
      'apoala': '/oaxaca/images/Santiago Apoala.jpeg',
      'macedonio': '/oaxaca/images/TEATRO MACEDONIO ALCALÁ.jpeg',
      'teatro': '/oaxaca/images/TEATRO MACEDONIO ALCALÁ.jpeg',
      'teotitlán': '/oaxaca/images/Teotitlán del Valle.jpeg',
      'teotitlan': '/oaxaca/images/Teotitlán del Valle.jpeg',
    };

    // Check for matches
    for (const [keyword, imagePath] of Object.entries(imageMap)) {
      if (nameLower.includes(keyword)) {
        return imagePath;
      }
    }

    return null;
  };

  // Helper function to get Oaxaca hotel image based on name
  const getOaxacaHotelImage = (hotelName: string, hotelAddress?: string | null): string | null => {
    if (!isOaxacaTrip) return null;

    const nameLower = hotelName.toLowerCase();
    const addressLower = (hotelAddress || '').toLowerCase();
    const combined = `${nameLower} ${addressLower}`;

    // Mapping of hotel name/address keywords to image paths
    const imageMap: { [key: string]: string } = {
      'canada central': '/oaxaca/images/Hotel Canada Central & Rooftop.jpeg',
      'canada': '/oaxaca/images/Hotel Canada Central & Rooftop.jpeg',
      'corazón': '/oaxaca/images/Hotel con Corazón Oaxaca.jpeg',
      'corazon': '/oaxaca/images/Hotel con Corazón Oaxaca.jpeg',
      'mx más centro': '/oaxaca/images/Hotel MX más centro.jpeg',
      'mx mas centro': '/oaxaca/images/Hotel MX más centro.jpeg',
      'más centro': '/oaxaca/images/Hotel MX más centro.jpeg',
      'mas centro': '/oaxaca/images/Hotel MX más centro.jpeg',
      'mx zócalo': '/oaxaca/images/Hotel MX zócalo.jpeg',
      'mx zocalo': '/oaxaca/images/Hotel MX zócalo.jpeg',
      'zócalo': '/oaxaca/images/Hotel MX zócalo.jpeg',
      'zocalo': '/oaxaca/images/Hotel MX zócalo.jpeg',
      'plaza garibaldi': '/oaxaca/images/Hotel Plaza Garibaldi.jpeg',
      'garibaldi': '/oaxaca/images/Hotel Plaza Garibaldi.jpeg',
      'azucenas 113': '/oaxaca/images/hotel-C. Azucenas 113.jpeg',
      'azucenas': '/oaxaca/images/hotel-C. Azucenas 113.jpeg',
      'vasconcelos 307': '/oaxaca/images/hotel-Lic. José Vasconcelos 307.jpeg',
      'josé vasconcelos': '/oaxaca/images/hotel-Lic. José Vasconcelos 307.jpeg',
      'jose vasconcelos': '/oaxaca/images/hotel-Lic. José Vasconcelos 307.jpeg',
    };

    // Check for matches
    for (const [keyword, imagePath] of Object.entries(imageMap)) {
      if (combined.includes(keyword)) {
        return imagePath;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #faf9f7, #f5f3ef, #fdfcfa)' }}>
      {/* Navigation Bar with Logo */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="h-12 w-auto drop-shadow-lg hover:scale-105 transition-transform duration-200"
            />
          </Link>
        </div>
      </nav>

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

      {/* Flights Section */}
      {tripData.flights && tripData.flights.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              {isOaxacaTrip ? 'Your Flight' : 'Select Your Flight'}
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              {isOaxacaTrip ? 'Round-trip airfare included in your package' : 'Choose the flight option that best suits your schedule and budget'}
            </p>
          </div>

          {isOaxacaTrip ? (
            // Static flight display for Oaxaca trip - no selection
            <div className="max-w-2xl mx-auto">
              {tripData.flights.map((flight, flightIdx) => {
                const flightImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800';

                return (
                  <div
                    key={flight.id || `flight-${flightIdx}`}
                    className="rounded-xl overflow-hidden shadow-lg border border-gray-200"
                  >
                    <div className="relative h-48">
                      <img
                        src={flightImage}
                        alt="Flight"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                          {flight.airline}
                        </h3>
                      </div>
                    </div>

                    <div className="bg-white p-6">
                      {/* Flight Legs Detail */}
                      {(flight as any).legs && (flight as any).legs.length > 0 ? (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Flight Details</h4>
                          <div className="space-y-3">
                            {(flight as any).legs.map((leg: any, legIdx: number) => (
                              <div key={legIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-900 mb-1">{leg.route}</div>
                                  <div className="text-xs text-gray-600">{leg.description}</div>
                                  <div className="text-xs text-gray-500 mt-1">{leg.date}</div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-lg font-bold text-[#1e3a8a]">
                                    ${leg.price.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">per person</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Departure</div>
                            <div className="font-bold text-gray-900">{flight.departureAirport}</div>
                            <div className="text-sm text-gray-600">{flight.departureTime}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Return</div>
                            <div className="font-bold text-gray-900">{flight.arrivalAirport}</div>
                            <div className="text-sm text-gray-600">{flight.arrivalTime}</div>
                          </div>
                        </div>
                      )}

                      {flight.baggageOptions && (
                        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                          {flight.baggageOptions}
                        </div>
                      )}

                      <div className="pt-4 border-t-2 border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">Total Airfare</span>
                          <span className="text-2xl font-bold text-[#1e3a8a]">
                            ${flight.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">For 2 travelers (${(flight.price / 2).toFixed(2)} per person)</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Original selection grid for non-Oaxaca trips
            <div className="grid md:grid-cols-3 gap-5">
              {tripData.flights.map((flight, flightIdx) => {
              const flightKey = flight.id || `flight-${flightIdx}`;
              const isSelected = selectedFlight === flightKey;
              // Use different plane images for each flight
              const planeImages = [
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
                'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800',
                'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800'
              ];
              const flightImage = planeImages[flightIdx % planeImages.length];

              return (
                <div
                  key={flightKey}
                  onClick={() => setSelectedFlight(flightKey)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
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
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800';
                      }}
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
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </p>
                    <div className="space-y-0.5 mb-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Departure:</span>
                        <span className="font-semibold">{flight.departureTime}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Arrival:</span>
                        <span className="font-semibold">{flight.arrivalTime}</span>
                      </div>
                    </div>
                    {flight.baggageOptions && (
                      <div className="mb-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        {flight.baggageOptions}
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-center">
                        <span className="text-xl font-bold text-[#1e3a8a]">
                          ${(flight.price || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-600"> roundtrip</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* Oaxaca Hotels Section (Feb 17-22) */}
      {tripData.hotelsOaxaca && tripData.hotelsOaxaca.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Oaxaca Accommodation
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Feb 17-22 • Choose your home base in Oaxaca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tripData.hotelsOaxaca.map((hotel, hotelIdx) => {
              const hotelKey = hotel.id || `hotel-oaxaca-${hotelIdx}`;
              const isSelected = selectedHotelOaxaca === hotelKey;
              const oaxacaNights = 5; // Feb 17-22

              // Check for Oaxaca-specific hotel images first
              const oaxacaHotelImage = getOaxacaHotelImage(hotel.name, hotel.address);

              // Use database hotel image if available, otherwise use fallback images
              const fallbackHotelImages = [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
              ];
              const hotelImage = oaxacaHotelImage || (hotel as any).images?.[0] || fallbackHotelImages[hotelIdx % fallbackHotelImages.length];

              return (
                <div
                  key={hotelKey}
                  onClick={() => setSelectedHotelOaxaca(hotelKey)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
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
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                      }}
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
                      {hotel.roomType || "Premium accommodation with modern amenities"}
                    </p>
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-[#1e3a8a]">
                          ${(hotel.price || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-600"> total</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {oaxacaNights} nights
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mexico City Hotels Section (Feb 22-25) */}
      {tripData.hotelsMexicoCity && tripData.hotelsMexicoCity.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Mexico City Accommodation
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Feb 22-25 • Choose your home base in Mexico City
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {tripData.hotelsMexicoCity.map((hotel, hotelIdx) => {
              const hotelKey = hotel.id || `hotel-mexico-${hotelIdx}`;
              const isSelected = selectedHotelMexicoCity === hotelKey;
              const mexicoCityNights = 3; // Feb 22-25

              // Check for Oaxaca-specific hotel images first
              const oaxacaHotelImage = getOaxacaHotelImage(hotel.name, hotel.address);

              // Use database hotel image if available, otherwise use fallback images
              const fallbackHotelImages = [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
                'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'
              ];
              const hotelImage = oaxacaHotelImage || (hotel as any).images?.[0] || fallbackHotelImages[hotelIdx % fallbackHotelImages.length];

              return (
                <div
                  key={hotelKey}
                  onClick={() => setSelectedHotelMexicoCity(hotelKey)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
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
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                      }}
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
                      {hotel.roomType || "Premium accommodation with modern amenities"}
                    </p>
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-[#1e3a8a]">
                          ${(hotel.price || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-600"> total</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {mexicoCityNights} nights
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Old Hotels Section - Keep for non-Oaxaca trips */}
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

              // Check for Oaxaca-specific hotel images first
              const oaxacaHotelImage = getOaxacaHotelImage(hotel.name, hotel.address);

              // Use database hotel image if available, otherwise use fallback images
              const fallbackHotelImages = [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
              ];
              const hotelImage = oaxacaHotelImage || (hotel as any).images?.[0] || fallbackHotelImages[hotelIdx % fallbackHotelImages.length];

              return (
                <div
                  key={hotelKey}
                  onClick={() => setSelectedHotel(hotelKey)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
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
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                      }}
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
                      {hotel.roomType || "Premium accommodation with modern amenities"}
                    </p>
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-[#1e3a8a]">
                          ${(hotel.price || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-600"> /night</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {nights} nights
                        <div className="font-bold text-xs text-gray-900">
                          ${((hotel.price || 0) * nights).toFixed(2)}
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

      {/* Car Rental Section */}
      {tripData.carRentals && tripData.carRentals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Select Your Car Rental
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Choose your transportation option for maximum flexibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tripData.carRentals.map((carRental, carIdx) => {
              const carKey = carRental.id || `car-${carIdx}`;
              const isSelected = selectedCarRental === carKey;
              const choiceLabel = carIdx === 0 ? "Choice A" : "Choice B";

              return (
                <div
                  key={carKey}
                  onClick={() => setSelectedCarRental(carKey)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
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

                  <div className="bg-white p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                          {choiceLabel}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {carRental.company} - {carRental.pickupLocation} to {carRental.dropoffLocation}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pickup:</span>
                        <span className="font-semibold">{carRental.pickupDate} - {carRental.pickupLocation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Drop-off:</span>
                        <span className="font-semibold">{carRental.dropoffDate} - {carRental.dropoffLocation}</span>
                      </div>
                    </div>

                    <div className="mb-3 text-xs text-gray-600 bg-blue-50 p-3 rounded">
                      <p className="mb-1">{carRental.insuranceIncluded}</p>
                      <p className="mb-1">Security Deposit: ${carRental.securityDeposit.toFixed(2)} (refundable)</p>
                      {carRental.notes && <p className="text-gray-500">{carRental.notes}</p>}
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Without CDW:</span>
                        <span className="text-lg font-bold text-[#1e3a8a]">
                          ${carRental.basePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">With CDW:</span>
                        <span className="text-base font-semibold text-gray-700">
                          ${carRental.withCDW.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Car Rental Total Summary */}
          <div className="mt-8 max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Car Rental Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total without CDW:</span>
                <span className="font-bold text-[#1e3a8a]">$164.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total with CDW:</span>
                <span className="font-semibold text-gray-700">$283.00</span>
              </div>
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-blue-200">
                CDW insurance may be covered by your credit card. Check with your card issuer before purchasing additional coverage.
              </p>
            </div>
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
            {tripData.dailySchedule.map((day, dayIdx) => (
              <div
                key={`day-${day.dayNumber}-${dayIdx}`}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out"
              >
                <div className="mb-6">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-white text-xl font-bold px-4 py-2 rounded-full" style={{
                        fontFamily: 'var(--font-cormorant)',
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                        boxShadow: '0 2px 8px rgba(26, 95, 122, 0.3)'
                      }}>
                        Day {day.dayNumber}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
                        {generateDayTitle(day)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                {(() => {
                  // Deduplicate activities by name (keep the one with best rating or most info)
                  const deduplicateActivities = (activities: any[]) => {
                    const seen = new Map();
                    activities.forEach(activity => {
                      const normalizedName = activity.name.toLowerCase().trim();
                      const existing = seen.get(normalizedName);

                      // Keep the activity with better data (rating, contact, hours)
                      if (!existing ||
                          (activity.rating && !existing.rating) ||
                          (activity.rating > (existing.rating || 0)) ||
                          (activity.contact && !existing.contact)) {
                        seen.set(normalizedName, activity);
                      }
                    });
                    return Array.from(seen.values());
                  };

                  // Filter activities (exclude hotels, dining, airports)
                  let allActivities = day.items.filter((item: any) => {
                    if (item.type !== 'activity') return false;

                    // Check if this item is actually a hotel
                    const isHotel = tripData.hotels?.some(hotel =>
                      hotel.name.toLowerCase().includes(item.name.toLowerCase()) ||
                      item.name.toLowerCase().includes(hotel.name.toLowerCase())
                    );
                    if (isHotel) return false;

                    // Check if item name suggests it's a hotel/accommodation
                    const hotelKeywords = ['hotel', 'inn', 'suites', 'resort', 'motel', 'lodge'];
                    const nameContainsHotelKeyword = hotelKeywords.some(keyword =>
                      item.name.toLowerCase().includes(keyword)
                    );
                    if (nameContainsHotelKeyword) return false;

                    // Check if it's an airport
                    const isAirport = item.name.toLowerCase().includes('airport');
                    if (isAirport) return false;

                    // Exclude dining venues
                    const diningKeywords = ['restaurant', 'cafe', 'bistro', 'bar', 'grill', 'eatery', 'diner', 'pizzeria', 'steakhouse', 'sushi', 'tavern', 'pub', 'kitchen'];
                    const isDining = diningKeywords.some(keyword =>
                      item.name.toLowerCase().includes(keyword)
                    );
                    const activityDetails = tripData.activities.find(
                      (act) => act.name === item.name
                    );
                    const category = (activityDetails as any)?.category;
                    const hasDiningCategory = category?.toLowerCase().includes('dining') ||
                                             category?.toLowerCase().includes('restaurant') ||
                                             category?.toLowerCase().includes('food');
                    if (isDining || hasDiningCategory) return false;

                    return true;
                  });

                  // Deduplicate activities before displaying
                  allActivities = deduplicateActivities(allActivities.map((item: any) => {
                    return tripData.activities.find((act: any) => act.name === item.name) || item;
                  }));

                  // Ensure minimum 3 activities per day - if fewer, pull from full activities list
                  if (allActivities.length < 3) {
                    const allNonDiningActivities = deduplicateActivities(tripData.activities.filter((act: any) => {
                      // Exclude dining
                      const diningKeywords = ['restaurant', 'cafe', 'bistro', 'bar', 'grill', 'eatery', 'diner', 'pizzeria', 'steakhouse', 'sushi', 'tavern', 'pub', 'kitchen', 'tea house', 'teahouse'];
                      const isDining = diningKeywords.some(keyword =>
                        act.name.toLowerCase().includes(keyword)
                      );
                      // Exclude hotels/airports
                      const isHotelOrAirport = act.name.toLowerCase().includes('hotel') ||
                                               act.name.toLowerCase().includes('inn') ||
                                               act.name.toLowerCase().includes('airport');
                      return !isDining && !isHotelOrAirport;
                    }));

                    // Get additional activities to reach minimum 3
                    const needed = 3 - allActivities.length;
                    const additionalActivities = allNonDiningActivities
                      .filter(act => !allActivities.some(item => item.name === act.name))
                      .slice(0, needed)
                      .map(act => ({
                        name: act.name,
                        type: 'activity',
                        description: act.description
                      }));

                    allActivities = [...allActivities, ...additionalActivities];
                  }

                  if (allActivities.length === 0) return null;

                  // Distribute activities across morning, afternoon, evening
                  const activitiesPerSlot = Math.ceil(allActivities.length / 3);
                  const timeSlots = [
                    { label: 'MORNING', activities: allActivities.slice(0, activitiesPerSlot) },
                    { label: 'AFTERNOON', activities: allActivities.slice(activitiesPerSlot, activitiesPerSlot * 2) },
                    { label: 'EVENING', activities: allActivities.slice(activitiesPerSlot * 2) }
                  ].filter(slot => slot.activities.length > 0);

                  if (timeSlots.length === 0) return null;

                  return (
                    <>
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                          Activities
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {allActivities.map((item: any, actIdx: number) => {
                            // Find the full activity details
                            const activityDetails = tripData.activities.find(
                              (act) => act.name === item.name
                            );

                            // Extract location from address
                            const location = activityDetails?.address?.split(',').slice(0, 2).join(',') || 'Local Area';

                            // Determine time slot
                            const activityIndex = actIdx;
                            const activitiesPerSlot = Math.ceil(allActivities.length / 3);
                            let timeLabel = 'Morning';
                            if (activityIndex >= activitiesPerSlot * 2) {
                              timeLabel = 'Evening';
                            } else if (activityIndex >= activitiesPerSlot) {
                              timeLabel = 'Afternoon';
                            }

                            // Get description - use actual data or generic fallback
                            const description = item.description || activityDetails?.description || 'Explore this local attraction and discover what makes it special';

                            // Get activity image from database - use different images from the same activity if available
                            // Rotate through images to avoid duplicates across different activity cards
                            const imageIndex = actIdx % (activityDetails?.images?.length || 1);
                            const activityImage = activityDetails?.images?.[imageIndex]?.url;

                            // Check for Oaxaca-specific images first
                            const oaxacaImage = getOaxacaActivityImage(item.name);

                            // Fallback images based on activity type/name
                            const getFallbackImage = (activityName: string) => {
                              const name = activityName.toLowerCase();

                              // Science/Technology attractions
                              if (name.includes('science') || name.includes('museum') || name.includes('technology')) {
                                return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800';
                              }
                              // Zoo/Wildlife
                              if (name.includes('zoo') || name.includes('wildlife') || name.includes('animal')) {
                                return 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800';
                              }
                              // Garden/Botanical
                              if (name.includes('garden') || name.includes('botanic') || name.includes('park')) {
                                return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800';
                              }
                              // Shopping/Mall
                              if (name.includes('mall') || name.includes('shop')) {
                                return 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800';
                              }
                              // Lake/Water
                              if (name.includes('lake') || name.includes('water')) {
                                return 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800';
                              }

                              // Generic travel/attraction images
                              const genericImages = [
                                'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
                                'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800',
                                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
                                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                              ];
                              return genericImages[actIdx % genericImages.length];
                            };

                            const finalImage = oaxacaImage || activityImage || getFallbackImage(item.name);

                            return (
                              <div
                                key={`activity-${dayIdx}-${actIdx}`}
                                className="bg-white rounded-xl overflow-hidden border border-blue-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer"
                              >
                                {/* Activity Image */}
                                <div className="relative h-40">
                                  <img
                                    src={finalImage}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = getFallbackImage(item.name);
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                  <div className="absolute top-2 left-2 text-xs font-semibold text-white uppercase tracking-wider bg-cyan-600/80 px-2 py-1 rounded">
                                    {timeLabel}
                                  </div>
                                </div>

                                {/* Activity Details */}
                                <div className="p-4">
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="font-bold text-gray-900 flex-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                      {item.name}
                                    </div>
                                    {activityDetails?.rating && (
                                      <div className="flex items-center gap-1 ml-2">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-semibold text-gray-700">{activityDetails.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">{description}</div>

                                  {activityDetails?.hours && (
                                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                      <span className="font-semibold">Hours:</span> {activityDetails.hours}
                                    </div>
                                  )}

                                  <div className="text-xs text-gray-500">{location}</div>

                                  {activityDetails?.contact && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      {activityDetails.contact}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    {/* Dining Section */}
                    {(() => {
                      // Get all dining venues from activities (deduplicated)
                      const diningKeywords = ['restaurant', 'cafe', 'bistro', 'bar', 'grill', 'eatery', 'diner', 'pizzeria', 'steakhouse', 'sushi', 'tavern', 'pub', 'kitchen', 'tea house', 'teahouse', 'food', 'bakery', 'deli'];
                      const allDiningActivities = deduplicateActivities(tripData.activities.filter((act: any) => {
                        const isDining = diningKeywords.some(keyword =>
                          act.name.toLowerCase().includes(keyword)
                        );
                        const description = act.description || '';
                        const hasDiningDescription = description.toLowerCase().includes('dining') ||
                                                    description.toLowerCase().includes('restaurant') ||
                                                    description.toLowerCase().includes('cuisine') ||
                                                    description.toLowerCase().includes('food');
                        return isDining || hasDiningDescription;
                      }));

                      // Pick THREE different dining venues for breakfast, lunch, and dinner
                      // Ensure they don't repeat within the same day
                      let breakfastVenue: any;
                      let lunchVenue: any;
                      let dinnerVenue: any;

                      if (allDiningActivities.length >= 3) {
                        // We have at least 3 venues - pick different ones for each meal
                        // Use separate rotation for each meal type to ensure variety across days
                        const venueCount = allDiningActivities.length;
                        const breakfastIdx = dayIdx % venueCount;
                        // Offset lunch and dinner to ensure they're different from breakfast
                        const lunchOffset = Math.floor(venueCount / 3);
                        const dinnerOffset = Math.floor((venueCount * 2) / 3);
                        const lunchIdx = (dayIdx + lunchOffset) % venueCount;
                        const dinnerIdx = (dayIdx + dinnerOffset) % venueCount;

                        breakfastVenue = allDiningActivities[breakfastIdx];
                        lunchVenue = allDiningActivities[lunchIdx];
                        dinnerVenue = allDiningActivities[dinnerIdx];
                      } else if (allDiningActivities.length === 2) {
                        // Only 2 venues - alternate and create a generic third
                        const baseIndex = (dayIdx * 2) % 2;
                        breakfastVenue = allDiningActivities[baseIndex];
                        lunchVenue = allDiningActivities[(baseIndex + 1) % 2];
                        dinnerVenue = {
                          name: 'Local Dining Spot',
                          description: 'Curated dining experience featuring local cuisine and fresh ingredients',
                        };
                      } else if (allDiningActivities.length === 2) {
                        // Only 2 venues - use both, skip the third meal slot
                        breakfastVenue = allDiningActivities[0];
                        lunchVenue = allDiningActivities[1];
                        dinnerVenue = null;
                      } else if (allDiningActivities.length === 1) {
                        // Only 1 venue - use it for breakfast only
                        breakfastVenue = allDiningActivities[0];
                        lunchVenue = null;
                        dinnerVenue = null;
                      } else {
                        // No venues - skip dining section entirely
                        breakfastVenue = null;
                        lunchVenue = null;
                        dinnerVenue = null;
                      }

                      return (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            Dining
                          </h4>

                          {/* Single row with Breakfast, Lunch, Dinner - only show actual venues */}
                          <div className="grid md:grid-cols-3 gap-4">
                            {/* Breakfast */}
                            {breakfastVenue && (
                            <div className="bg-white rounded-xl overflow-hidden border border-orange-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer">
                              <div className="relative h-32">
                                <img
                                  src={(breakfastVenue as any).images?.[0]?.url || 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800'}
                                  alt={breakfastVenue.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute top-2 left-2 text-xs font-semibold text-white uppercase tracking-wider bg-orange-600/80 px-2 py-1 rounded">
                                  Breakfast
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="font-bold text-gray-900 flex-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                    {breakfastVenue.name}
                                  </div>
                                  {breakfastVenue.rating && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs font-semibold text-gray-700">{breakfastVenue.rating}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  {breakfastVenue.description || 'Delicious breakfast options to start your day'}
                                </div>
                                {breakfastVenue.hours && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    <span className="font-semibold">Hours:</span> {breakfastVenue.hours}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {breakfastVenue.address?.split(',').slice(0, 2).join(',') || 'Local dining area'}
                                </div>
                                {breakfastVenue.contact && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    {breakfastVenue.contact}
                                  </div>
                                )}
                              </div>
                            </div>
                            )}

                            {/* Lunch */}
                            {lunchVenue && (
                            <div className="bg-white rounded-xl overflow-hidden border border-orange-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer">
                              <div className="relative h-32">
                                <img
                                  src={(lunchVenue as any).images?.[0]?.url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'}
                                  alt={lunchVenue.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute top-2 left-2 text-xs font-semibold text-white uppercase tracking-wider bg-orange-600/80 px-2 py-1 rounded">
                                  Lunch
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="font-bold text-gray-900 flex-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                    {lunchVenue.name}
                                  </div>
                                  {lunchVenue.rating && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs font-semibold text-gray-700">{lunchVenue.rating}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  {lunchVenue.description || 'Authentic local flavors for your midday meal'}
                                </div>
                                {lunchVenue.hours && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    <span className="font-semibold">Hours:</span> {lunchVenue.hours}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {lunchVenue.address?.split(',').slice(0, 2).join(',') || 'Local dining area'}
                                </div>
                                {lunchVenue.contact && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    {lunchVenue.contact}
                                  </div>
                                )}
                              </div>
                            </div>
                            )}

                            {/* Dinner */}
                            {dinnerVenue && (
                            <div className="bg-white rounded-xl overflow-hidden border border-orange-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer">
                              <div className="relative h-32">
                                <img
                                  src={(dinnerVenue as any).images?.[0]?.url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'}
                                  alt={dinnerVenue.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute top-2 left-2 text-xs font-semibold text-white uppercase tracking-wider bg-orange-600/80 px-2 py-1 rounded">
                                  Dinner
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="font-bold text-gray-900 flex-1" style={{ fontFamily: 'var(--font-inter)' }}>
                                    {dinnerVenue.name}
                                  </div>
                                  {dinnerVenue.rating && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs font-semibold text-gray-700">{dinnerVenue.rating}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  {dinnerVenue.description || 'Evening dining experience with regional specialties'}
                                </div>
                                {dinnerVenue.hours && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    <span className="font-semibold">Hours:</span> {dinnerVenue.hours}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {dinnerVenue.address?.split(',').slice(0, 2).join(',') || 'Local dining area'}
                                </div>
                                {dinnerVenue.contact && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    {dinnerVenue.contact}
                                  </div>
                                )}
                              </div>
                            </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    </>
                  );
                })()}

                {/* Accommodations */}
                {day.items.filter((item: any) => item.type === 'accommodation').length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                      Accommodation
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {day.items.filter((item: any) => item.type === 'accommodation').map((item: any, idx: number) => (
                        <div
                          key={`accommodation-${dayIdx}-${idx}`}
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
            {/* Show separate hotels for Oaxaca trip */}
            {selectedHotelOaxacaData && (
              <div className="flex justify-between items-center pb-3 border-b border-white/30">
                <div>
                  <div className="font-semibold text-base">
                    {getHotelDescription(selectedHotelOaxacaData)} (Oaxaca)
                  </div>
                  <div className="text-blue-100 text-sm">
                    {selectedHotelOaxacaData.rating ? `${selectedHotelOaxacaData.rating} stars` : ""} • 5 nights
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${(selectedHotelOaxacaData.price || 0).toFixed(2)}</div>
                </div>
              </div>
            )}

            {selectedHotelMexicoCityData && (
              <div className="flex justify-between items-center pb-3 border-b border-white/30">
                <div>
                  <div className="font-semibold text-base">
                    {getHotelDescription(selectedHotelMexicoCityData)} (Mexico City)
                  </div>
                  <div className="text-blue-100 text-sm">
                    {selectedHotelMexicoCityData.rating ? `${selectedHotelMexicoCityData.rating} stars` : ""} • 3 nights
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${(selectedHotelMexicoCityData.price || 0).toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Show single hotel for regular trips */}
            {selectedHotelData && !selectedHotelOaxacaData && !selectedHotelMexicoCityData && (
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

            {selectedCarRentalData && (
              <div className="flex justify-between items-center pb-3 border-b border-white/30">
                <div>
                  <div className="font-semibold text-base">
                    Car Rental
                  </div>
                  <div className="text-blue-100 text-sm">
                    {selectedCarRentalData.company} • {selectedCarRentalData.pickupDate} - {selectedCarRentalData.dropoffDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${carRentalCost.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Food Budget */}
            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div>
                <div className="font-semibold text-base">
                  Food & Dining Budget
                </div>
                <div className="text-blue-100 text-sm">
                  Estimated for entire trip
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">${foodBudget.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div className="text-base font-semibold">Trip Subtotal</div>
              <div className="text-right">
                <div className="text-xl font-bold">${tripCost.toFixed(2)}</div>
                <div className="text-blue-100 text-sm">for 2 travelers</div>
              </div>
            </div>

            <div className="pt-5 space-y-2.5">
              <button
                onClick={() => router.push(`/payment/${tripId}`)}
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: `linear-gradient(135deg, ${colors.accent} 0%, #a0522d 100%)`,
                  boxShadow: '0 4px 15px rgba(193, 105, 79, 0.4)'
                }}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                I love it! Unlock Complete Itinerary
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
