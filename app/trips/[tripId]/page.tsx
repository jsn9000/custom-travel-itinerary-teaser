'use client';

/**
 * Dynamic Trip Display Page
 * Displays imported Wanderlog trip data using paywalled itinerary teaser template
 * Follows CLAUDE.md design guidelines with destination-based color themes
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, Star, Plane, Building2, Check, MapPin, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface TripData {
  id: string;
  trip_title: string;
  trip_dates: string;
  destination: string;
  source_url: string;
  metadata: {
    source: string;
    description?: string;
    locations: Array<{
      name: string;
      type: string;
      imageUrl?: string;
    }>;
    itinerary: Array<{
      day: string;
      activities: string[];
    }>;
    images: string[];
    hotels?: Array<{
      name: string;
      stars?: number;
      price?: number;
      description?: string;
      imageUrl?: string;
    }>;
    flights?: Array<{
      name: string;
      price?: number;
      duration?: string;
      stops?: string;
      description?: string;
    }>;
  };
}

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

// Name redaction functions to obfuscate real names
const redactHotelName = (hotelName: string): string => {
  // Transform real hotel names into descriptive generic names
  const name = hotelName.toLowerCase();

  if (name.includes('hampton') || name.includes('inn')) {
    return 'Luxury Downtown Hotel •••';
  }
  if (name.includes('sandman')) {
    return 'Boutique City Center Hotel •••';
  }
  if (name.includes('best western')) {
    return 'Modern Comfort Hotel •••';
  }
  if (name.includes('hilton') || name.includes('marriott') || name.includes('hyatt')) {
    return 'Premium Luxury Resort •••';
  }
  if (name.includes('holiday inn')) {
    return 'Contemporary Business Hotel •••';
  }
  if (name.includes('sheraton') || name.includes('radisson')) {
    return 'Elegant Executive Hotel •••';
  }
  if (name.includes('comfort inn')) {
    return 'Cozy Traveler Hotel •••';
  }

  // Default generic name
  return 'Quality Accommodation •••';
};

const redactFlightName = (flightName: string): string => {
  // Transform airline names into generic flight descriptions
  const name = flightName.toLowerCase();

  if (name.includes('flair')) {
    return 'Budget-Friendly Direct Flight';
  }
  if (name.includes('air canada')) {
    return 'Premium National Carrier';
  }
  if (name.includes('westjet')) {
    return 'Comfortable Direct Service';
  }
  if (name.includes('united') || name.includes('delta')) {
    return 'International Premium Flight';
  }
  if (name.includes('american')) {
    return 'Standard Direct Flight';
  }

  // Default generic name
  return 'Standard Flight Service';
};

// Generate restaurant options for dining sections
const generateRestaurants = (destination: string, dayNum: number) => {
  const cuisineTypes = ['Local Cuisine', 'Fusion', 'Seafood', 'Traditional', 'Contemporary', 'Farm-to-Table'];
  const mealTypes = ['Lunch', 'Dinner'];

  return mealTypes.map((meal, idx) => ({
    meal,
    name: `Upscale ${cuisineTypes[(dayNum + idx) % cuisineTypes.length]} Restaurant`,
    cuisine: cuisineTypes[(dayNum + idx) % cuisineTypes.length],
    stars: 4 + (idx % 2),
    price: 2 + idx,
    location: `${destination} District`,
  }));
};

// Destination-based color themes
const getDestinationTheme = (destination: string) => {
  const dest = destination.toLowerCase();

  // Beach/coastal destinations - Blues and teals
  if (dest.includes('beach') || dest.includes('coast') || dest.includes('island') ||
      dest.includes('hawaii') || dest.includes('caribbean') || dest.includes('mediterranean')) {
    return {
      primary: '#1a5f7a', // Teal
      secondary: '#2a7c9e', // Light teal
      accent: '#c1694f', // Terracotta
      name: 'coastal'
    };
  }

  // Mountain/nature destinations - Greens and earth tones
  if (dest.includes('mountain') || dest.includes('alps') || dest.includes('rockies') ||
      dest.includes('forest') || dest.includes('national park')) {
    return {
      primary: '#2d5016', // Forest green
      secondary: '#4a7c27', // Light green
      accent: '#8b4513', // Saddle brown
      name: 'nature'
    };
  }

  // Desert/southwestern - Warm oranges and browns
  if (dest.includes('desert') || dest.includes('arizona') || dest.includes('dubai') ||
      dest.includes('morocco')) {
    return {
      primary: '#8b4513', // Saddle brown
      secondary: '#d2691e', // Chocolate
      accent: '#cd853f', // Peru
      name: 'desert'
    };
  }

  // Urban/city - Modern grays and blues
  if (dest.includes('city') || dest.includes('york') || dest.includes('london') ||
      dest.includes('paris') || dest.includes('tokyo')) {
    return {
      primary: '#2c3e50', // Dark gray-blue
      secondary: '#34495e', // Lighter gray-blue
      accent: '#e74c3c', // Red accent
      name: 'urban'
    };
  }

  // Canadian/northern - Cool blues and purples
  if (dest.includes('canada') || dest.includes('edmonton') || dest.includes('alberta') ||
      dest.includes('calgary') || dest.includes('vancouver') || dest.includes('iceland')) {
    return {
      primary: '#1e3a8a', // Deep blue
      secondary: '#3b82f6', // Bright blue
      accent: '#8b5cf6', // Purple
      name: 'northern'
    };
  }

  // Default - Mediterranean theme
  return {
    primary: '#1a5f7a',
    secondary: '#2a7c9e',
    accent: '#c1694f',
    name: 'default'
  };
};

// Generate hotel options based on destination
const generateHotelOptions = (destination: string, images: string[]): HotelOption[] => {
  const basePrice = 200 + Math.floor(Math.random() * 200);
  return [
    {
      id: 'h1',
      type: `Luxury ${destination} Resort`,
      stars: 5,
      price: basePrice + 150,
      image: images[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      description: `5-star premium property in the heart of ${destination}`,
    },
    {
      id: 'h2',
      type: `Boutique ${destination} Hotel`,
      stars: 4,
      price: basePrice + 50,
      image: images[1] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      description: `Charming 4-star hotel with local character`,
    },
    {
      id: 'h3',
      type: `Modern Downtown Hotel`,
      stars: 4,
      price: basePrice,
      image: images[2] || 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
      description: `Contemporary 4-star hotel with city views`,
    },
  ];
};

// Generate flight options
const generateFlightOptions = (): FlightOption[] => {
  return [
    {
      id: 'f1',
      type: 'Premium Direct Flight',
      price: 850,
      duration: '4h 30m',
      stops: 'Nonstop',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
      description: 'Direct premium service with extra legroom',
    },
    {
      id: 'f2',
      type: 'Standard Direct Flight',
      price: 620,
      duration: '4h 45m',
      stops: 'Nonstop',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
      description: 'Comfortable direct flight with standard amenities',
    },
    {
      id: 'f3',
      type: 'Economy Connection Flight',
      price: 480,
      duration: '7h 15m',
      stops: '1 stop',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      description: 'Budget-friendly option with one layover',
    },
  ];
};

export default function TripDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>('h1');
  const [selectedFlight, setSelectedFlight] = useState<string>('f1');
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotInterestedModal, setShowNotInterestedModal] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  const [notInterestedReason, setNotInterestedReason] = useState('');

  // Track when component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load trip data from Supabase
  useEffect(() => {
    async function loadTripData() {
      try {
        console.log(`📥 Loading trip data for ID: ${tripId}`);

        const { data, error: fetchError } = await supabase
          .from('wanderlog_trips')
          .select('*')
          .eq('id', tripId)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error('Trip not found');
        }

        console.log(`✅ Trip data loaded:`, (data as any).trip_title);
        setTripData(data as any as TripData);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error loading trip:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trip data');
        setIsLoading(false);
      }
    }

    loadTripData();
  }, [tripId]);

  // Auto-rotate banner images
  useEffect(() => {
    if (!tripData || !tripData.metadata?.images || tripData.metadata.images.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prev) => (prev + 1) % Math.min(tripData.metadata.images.length, 6)
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [tripData]);

  // Countdown timer to trip date
  useEffect(() => {
    if (!mounted || !tripData?.trip_dates) return;

    const calculateTimeLeft = () => {
      // Parse trip start date from trip_dates string
      // Format could be "December 10-17, 2025" or "December 10, 2025 - December 17, 2025"
      const datesStr = tripData.trip_dates;
      let tripStartDate: Date | null = null;

      try {
        // Try multiple parsing strategies
        // Strategy 1: Full date with year "December 10, 2025"
        let dateMatch = datesStr.match(/([A-Za-z]+)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})/);
        if (dateMatch) {
          const [, month, day, year] = dateMatch;
          tripStartDate = new Date(`${month} ${day}, ${year}`);
        }

        // Strategy 2: Date range "December 10-17, 2025" - extract first date
        if (!tripStartDate || isNaN(tripStartDate.getTime())) {
          dateMatch = datesStr.match(/([A-Za-z]+)\s+(\d+)(?:st|nd|rd|th)?(?:-\d+)?(?:,?\s+(\d{4}))?/);
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            const finalYear = year || new Date().getFullYear();
            tripStartDate = new Date(`${month} ${day}, ${finalYear}`);
          }
        }

        // Strategy 3: ISO format or any valid date string
        if (!tripStartDate || isNaN(tripStartDate.getTime())) {
          tripStartDate = new Date(datesStr);
        }

        console.log('📅 Countdown timer info:');
        console.log('  - Original dates string:', datesStr);
        console.log('  - Parsed trip date:', tripStartDate);
        console.log('  - Is valid date:', !isNaN(tripStartDate.getTime()));
        console.log('  - Days until trip:', Math.floor((tripStartDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
      } catch (e) {
        console.error('Error parsing trip date:', e);
      }

      // Fallback to a future date if parsing fails
      if (!tripStartDate || isNaN(tripStartDate.getTime())) {
        console.warn('Using fallback date - parsing failed for:', datesStr);
        tripStartDate = new Date();
        tripStartDate.setMonth(tripStartDate.getMonth() + 3);
      }

      const now = new Date();

      if (tripStartDate > now) {
        // Calculate total days
        const totalDays = Math.floor((tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate months (approximate, 30 days per month for display)
        const months = Math.floor(totalDays / 30);
        const remainingDays = totalDays % 30;

        // Calculate hours, minutes, seconds
        const difference = tripStartDate.getTime() - now.getTime();
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
        // Trip date has passed
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [mounted, tripData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Could not load trip data'}</p>
          <button
            onClick={() => router.push('/wanderlog-import')}
            className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-all"
          >
            Import Another Trip
          </button>
        </div>
      </div>
    );
  }

  const { trip_title, trip_dates, destination, metadata } = tripData;
  const {
    description = '',
    locations = [],
    itinerary = [],
    images = [],
    hotels = [],
    flights = []
  } = metadata || {};

  // Get destination-based theme
  const theme = getDestinationTheme(destination);

  // Create a varied image pool from hotel images, location images, and general images
  const createImagePool = (): string[] => {
    const pool: string[] = [];

    // Add hotel images
    hotels.forEach(hotel => {
      if (hotel.imageUrl) {
        pool.push(hotel.imageUrl);
      }
    });

    // Add location/activity images
    locations.forEach(location => {
      if (location.imageUrl) {
        pool.push(location.imageUrl);
      }
    });

    // Add general trip images
    images.forEach(img => {
      if (img && !pool.includes(img)) {
        pool.push(img);
      }
    });

    // Fallback images if pool is empty
    if (pool.length === 0) {
      pool.push(
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'
      );
    }

    return pool;
  };

  const imagePool = createImagePool();

  // Use real hotel data from Wanderlog if available, otherwise generate placeholders
  // Apply name redaction to protect sensitive information
  // LIMIT TO EXACTLY 3 OPTIONS with VARIED IMAGES
  const hotelOptions = (hotels.length > 0
    ? hotels.map((hotel, idx) => ({
        id: `h${idx + 1}`,
        type: redactHotelName(hotel.name),
        stars: hotel.stars || 4,
        price: hotel.price || 200 + idx * 50,
        // Use varied images from the pool, cycling through available images
        image: imagePool[idx % imagePool.length] || hotel.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        description: `Premium ${destination} accommodation`,
      }))
    : generateHotelOptions(destination, images).map((hotel, idx) => ({
        ...hotel,
        image: imagePool[idx % imagePool.length] || hotel.image,
      }))).slice(0, 3);

  // Use real flight data from Wanderlog if available, otherwise generate placeholders
  // Apply name redaction to protect sensitive information
  const flightOptions = flights.length > 0
    ? flights.map((flight, idx) => ({
        id: `f${idx + 1}`,
        type: redactFlightName(flight.name),
        price: flight.price || 500 + idx * 100,
        duration: flight.duration || '4h 30m',
        stops: flight.stops || 'Nonstop',
        image: `https://images.unsplash.com/photo-${1436491865332 + idx}?w=800`,
        description: 'Comfortable flight service to your destination',
      }))
    : generateFlightOptions();

  const selectedHotelData = hotelOptions.find((h) => h.id === selectedHotel);
  const selectedFlightData = flightOptions.find((f) => f.id === selectedFlight);

  // Calculate costs
  const numDays = itinerary.length || 7;
  const hotelCost = (selectedHotelData?.price || 0) * numDays;
  const flightCost = selectedFlightData?.price || 0;
  const tripCost = hotelCost + flightCost;
  const unlockFee = 299.0;
  const totalCost = tripCost + unlockFee;

  // Use Wanderlog images if available, limit to 6 for header rotation
  const bannerImages = images.length > 0
    ? images.slice(0, 6).map((img, idx) => ({
        url: img,
        title: `${destination} - Image ${idx + 1}`,
      }))
    : [
        {
          url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920',
          title: `${destination} Travel`,
        },
        {
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920',
          title: `${destination} Adventure`,
        },
      ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #faf9f7, #f5f3ef, #fdfcfa)' }}>
      {/* Hero Header with Rotating Banner */}
      <header className="relative overflow-hidden">
        <div className="relative h-[300px] md:h-[375px]">
          {bannerImages.map((media, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                mounted && index === currentImageIndex
                  ? 'opacity-100'
                  : index === 0 && !mounted
                    ? 'opacity-100'
                    : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${media.url}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(1.15) saturate(1.3) contrast(1.05)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55"></div>
            </div>
          ))}

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
            <h1
              className="text-4xl md:text-6xl font-bold mb-4 tracking-wide text-center drop-shadow-2xl"
              style={{
                fontFamily: 'var(--font-cormorant)',
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {trip_title}
            </h1>
            <p
              className="text-2xl md:text-3xl font-medium mb-4 text-white text-center drop-shadow-lg"
              style={{
                fontFamily: 'var(--font-inter)',
                textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              {destination}
            </p>
            <div className="flex items-center gap-3 text-lg md:text-xl text-white/95 mb-6">
              <Calendar className="w-5 h-5" />
              <p className="font-semibold drop-shadow-lg">
                {trip_dates}
              </p>
            </div>

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
                      mounted && index === currentImageIndex
                        ? 'w-8 bg-white'
                        : index === 0 && !mounted
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/75'
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="relative rounded-3xl p-8 md:p-10 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.primary} 100%)`,
            boxShadow: `0 10px 40px ${theme.primary}33, 0 2px 8px rgba(0, 0, 0, 0.1)`,
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6 text-center leading-tight tracking-wide"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Your {destination} Adventure Awaits
            </h2>
            <div className="w-24 h-0.5 bg-white/40 mx-auto mb-6"></div>

            <p
              className="text-base md:text-lg text-white/90 leading-relaxed text-center max-w-3xl mx-auto"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {description || `Embark on an extraordinary ${numDays}-day journey through ${destination}. Discover ${locations.length} amazing locations, immerse yourself in local culture, and create unforgettable memories.`}
            </p>
          </div>
        </div>
      </section>

      {/* Hotels Section - Split by Days */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 tracking-wide"
            style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
          >
            Accommodation Options by Day
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}
          >
            Choose from our handpicked selection of {destination} properties
          </p>
        </div>

        <div className="space-y-12">
          {itinerary.slice(0, 3).map((day, dayIdx) => (
            <div key={dayIdx} className="space-y-4">
              {/* Day Header */}
              <div className="flex items-center gap-3">
                <div
                  className="text-white text-xl font-bold px-4 py-2 rounded-full"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                    boxShadow: `0 2px 8px ${theme.primary}4d`,
                  }}
                >
                  Day {dayIdx + 1}
                </div>
                <h3
                  className="text-2xl md:text-3xl font-bold tracking-wide"
                  style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
                >
                  {day.day}
                </h3>
              </div>

              {/* 3 Hotel Options for this Day */}
              <div className="grid md:grid-cols-3 gap-5">
                {hotelOptions.map((hotel, hotelIdx) => {
                  const isSelected = selectedHotel === hotel.id && dayIdx === 0; // Only select on first day for demo
                  return (
                    <div
                      key={`${dayIdx}-${hotel.id}`}
                      onClick={() => setSelectedHotel(hotel.id)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-3 ${
                        isSelected
                          ? 'opacity-100 scale-105'
                          : 'opacity-60 grayscale-[50%] hover:opacity-80'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? `0 8px 30px ${theme.accent}66, 0 0 0 3px ${theme.accent}`
                          : '0 4px 15px rgba(0, 0, 0, 0.1)',
                        border: isSelected ? 'none' : '1px solid #e5e5e5',
                      }}
                    >
                      {isSelected && (
                        <div
                          className="absolute top-2 right-2 z-10 text-white rounded-full p-1.5"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                            boxShadow: `0 2px 8px ${theme.accent}80`,
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      <div className="relative h-32">
                        <img
                          src={imagePool[(dayIdx * 3 + hotelIdx) % imagePool.length] || hotel.image}
                          alt={hotel.type}
                          className="w-full h-full object-cover"
                          style={{ filter: 'blur(2px)' }}
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
                          <Building2 className="w-4 h-4" style={{ color: theme.primary }} />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{hotel.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold" style={{ color: theme.primary }}>
                              ${hotel.price}
                            </span>
                            <span className="text-xs text-gray-600"> /night</span>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            1 night
                            <div className="font-bold text-xs text-gray-900">
                              ${hotel.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 tracking-wide"
            style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
          >
            Select Your Flight
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}
          >
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
                    ? 'opacity-100 scale-105'
                    : 'opacity-60 grayscale-[50%] hover:opacity-80'
                }`}
                style={{
                  boxShadow: isSelected
                    ? `0 8px 30px ${theme.accent}66, 0 0 0 3px ${theme.accent}`
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  border: isSelected ? 'none' : '1px solid #e5e5e5',
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 z-10 text-white rounded-full p-1.5"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                      boxShadow: `0 2px 8px ${theme.accent}80`,
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="relative h-32">
                  <img
                    src={flight.image}
                    alt={flight.type}
                    className="w-full h-full object-cover"
                    style={{ filter: 'blur(2px)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="bg-white p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-base font-bold text-gray-900 flex-1">
                      {flight.type}
                    </h3>
                    <Plane className="w-4 h-4" style={{ color: theme.primary }} />
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
                      <span className="text-xl font-bold" style={{ color: theme.primary }}>
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

      {/* Itinerary Preview Section */}
      {itinerary.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 tracking-wide"
              style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
            >
              Your {Math.min(3, itinerary.length)}-Day Itinerary Preview
            </h2>
            <p
              className="text-lg"
              style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}
            >
              A glimpse of the unforgettable experiences awaiting you
            </p>
          </div>

          <div className="space-y-8">
            {itinerary.slice(0, 3).map((day, dayIdx) => {
              const restaurants = generateRestaurants(destination, dayIdx);

              return (
                <div
                  key={dayIdx}
                  className="bg-white rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="text-white text-xl font-bold px-4 py-2 rounded-full"
                        style={{
                          fontFamily: 'var(--font-cormorant)',
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          boxShadow: `0 2px 8px ${theme.primary}4d`,
                        }}
                      >
                        Day {dayIdx + 1}
                      </div>
                      <h3
                        className="text-2xl md:text-3xl font-bold tracking-wide"
                        style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
                      >
                        {day.day}
                      </h3>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="mb-6">
                    <h4
                      className="text-lg font-semibold text-gray-800 mb-3"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Activities
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {day.activities.slice(0, 3).map((activity, actIdx) => {
                        // Try to find a matching location with an image
                        const matchingLocation = locations.find(loc =>
                          activity.toLowerCase().includes(loc.name.toLowerCase()) ||
                          loc.name.toLowerCase().includes(activity.toLowerCase())
                        );
                        const activityImage = matchingLocation?.imageUrl || imagePool[actIdx % imagePool.length];

                        return (
                          <div
                            key={actIdx}
                            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                          >
                            {activityImage && (
                              <div className="relative h-32">
                                <img
                                  src={activityImage}
                                  alt={activity}
                                  className="w-full h-full object-cover"
                                  style={{ filter: 'blur(1.5px)' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute top-2 left-2">
                                  <div className="text-xs font-semibold text-white/90 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                                    {actIdx === 0 ? 'Morning' : actIdx === 1 ? 'Afternoon' : 'Evening'}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="p-3">
                              <div
                                className="font-bold text-gray-900 text-sm mb-1"
                                style={{ fontFamily: 'var(--font-inter)' }}
                              >
                                {activity}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" style={{ color: theme.accent }} />
                                <div className="text-xs text-gray-600">{destination}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dining Section */}
                  <div>
                    <h4
                      className="text-lg font-semibold text-gray-800 mb-3"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      Dining
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {restaurants.map((restaurant, idx) => (
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
              );
            })}
          </div>
        </section>
      )}

      {/* Trip Summary & Pricing Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-3xl p-6 text-white transition-all duration-300 ease-in-out"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.primary} 100%)`,
            boxShadow: `0 10px 40px ${theme.primary}4d, 0 2px 8px rgba(0, 0, 0, 0.1)`,
          }}
        >
          <h2
            className="text-2xl md:text-3xl font-bold mb-6 text-center tracking-wide"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Your Trip Summary
          </h2>
          <div className="max-w-md mx-auto space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div>
                <div className="font-semibold text-base">
                  {selectedHotelData?.type}
                </div>
                <div className="text-blue-100 text-sm">
                  {selectedHotelData?.stars} stars • {numDays} nights
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

            <div className="flex justify-between items-center pb-3 border-b border-white/30">
              <div className="text-base font-semibold">Full Itinerary Unlock Fee</div>
              <div className="text-right">
                <div className="text-xl font-bold">${unlockFee.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <div className="text-lg font-bold">Total</div>
              <div className="text-right">
                <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              </div>
            </div>

            <div className="pt-5 space-y-2.5">
              <button
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                  boxShadow: `0 4px 15px ${theme.accent}66`,
                }}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                I love it! Unlock Complete Itinerary - ${totalCost.toFixed(2)}
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                  boxShadow: `0 4px 15px ${theme.accent}66`,
                }}
              >
                I like it but I want to make edits
              </button>

              <button
                onClick={() => setShowNotInterestedModal(true)}
                className="w-full text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ease-in-out hover:-translate-y-0.5 transform"
                style={{
                  fontFamily: 'var(--font-inter)',
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                  boxShadow: `0 4px 15px ${theme.accent}66`,
                }}
              >
                Not Interested
              </button>

              <p className="text-center text-sm text-blue-100 mt-3">
                Secure payment • Instant access • All sales are final
              </p>

              <button
                onClick={() => router.push('/wanderlog-import')}
                className="w-full text-white/90 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ease-in-out hover:text-white border-2 border-white/30 hover:border-white/50"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-blue-200 py-12"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                {destination} Adventure
              </div>
              <p className="text-blue-300">
                Powered by Wanderlog & Firecrawl AI
              </p>
            </div>
            <div className="border-t pt-6 mt-6" style={{ borderColor: `${theme.secondary}80` }}>
              <p className="text-sm mb-4">
                © 2025 Custom Itinerary Travel. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

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

            <h3
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
            >
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
                  className="flex-1 px-6 py-3 text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                  }}
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

            <h3
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-cormorant)', color: theme.primary }}
            >
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
                  className="flex-1 px-6 py-3 text-white rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                  }}
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
