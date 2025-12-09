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
  periods?: Array<{
    location: string;
    dates: string;
    basePrice: number;
    withCDW: number;
    company: string;
    securityDeposit: number;
  }>;
  options?: Array<{
    company: string;
    rating: string;
    bookingNote?: string;
    basePrice: number;
    withCDW: number;
    securityDeposit: number;
  }>;
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
  hotelsOaxacaReturn?: HotelOption[];
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
  const [selectedHotelOaxacaReturn, setSelectedHotelOaxacaReturn] = useState<string>("");
  const [selectedFlight, setSelectedFlight] = useState<string>("");
  const [selectedCarRental, setSelectedCarRental] = useState<string>("");
  const [selectedCarRentalOption, setSelectedCarRentalOption] = useState<number | null>(null);
  const [selectedCarRentalCDW, setSelectedCarRentalCDW] = useState<boolean>(false); // CDW insurance selection
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
          data.startDate = '2026-02-18';
          data.endDate = '2026-02-26';

          // Split hotels into Oaxaca (Feb 18-21) and Mexico City (Feb 22-26)
          data.hotelsOaxaca = [
            {
              id: "hotel-azucenas",
              name: "C. Azucenas 113",
              address: "C. Azucenas 113, Oaxaca",
              roomType: "Private Airbnb Apartment",
              amenities: ["Hosted by 9-year Superhost", "High ratings", "10min to city center"],
              rating: 4.5,
              price: 367,
              currency: "USD"
            },
            {
              id: "hotel-vasconcelos",
              name: "Lic. José Vasconcelos 307",
              address: "Lic. José Vasconcelos 307, Oaxaca",
              roomType: "Private Airbnb Apartment",
              amenities: ["5min drive to city center", "18min walk to center", "Modern amenities"],
              rating: 4.5,
              price: 350,
              currency: "USD"
            },
            {
              id: "hotel-corazon",
              name: "Hotel con Corazón Oaxaca",
              address: "Oaxaca City Center",
              roomType: "Queen Room including breakfast",
              amenities: ["Free breakfast", "City center location", "Premium service"],
              rating: 4.7,
              price: 483,
              currency: "USD"
            }
          ];

          data.hotelsMexicoCity = [
            {
              id: "hotel-casa-beu",
              name: "Casa Beu",
              address: "Puerto Escondido",
              roomType: "Queen Room",
              amenities: ["Click here to book on booking.com"],
              rating: 4.5,
              price: 465,
              currency: "USD"
            },
            {
              id: "hotel-quiote-quiote",
              name: "Quiote Quiote",
              address: "Puerto Escondido",
              roomType: "Deluxe Double Studio",
              amenities: ["Click here to book on booking.com"],
              rating: 4.5,
              price: 643,
              currency: "USD"
            },
            {
              id: "hotel-casa-ita-surf",
              name: "Casa Ita Surf",
              address: "Puerto Escondido",
              roomType: "Deluxe Double Room",
              amenities: ["Click here to book on booking.com"],
              rating: 4.5,
              price: 709,
              currency: "USD"
            }
          ];

          // Oaxaca return stay (Feb 25-26)
          data.hotelsOaxacaReturn = [
            {
              id: "hotel-ayook",
              name: "Budget-Friendly Hotel with Breakfast",
              address: "Oaxaca",
              roomType: "Economy Double Room",
              amenities: ["Click here to book on booking.com", "Breakfast included"],
              rating: 4.5,
              price: 142,
              currency: "USD"
            },
            {
              id: "hotel-maria-ines",
              name: "Standard Hotel Suite",
              address: "Oaxaca",
              roomType: "Standard Room",
              amenities: ["Click here to book on booking.com"],
              rating: 4.5,
              price: 94,
              currency: "USD"
            },
            {
              id: "hotel-sauve-casa",
              name: "Boutique Hotel with Breakfast",
              address: "Oaxaca",
              roomType: "Standard King Room",
              amenities: ["Click here to book on booking.com", "Breakfast included"],
              rating: 4.5,
              price: 248,
              currency: "USD"
            }
          ];

          // Keep hotels array empty for Oaxaca trip (using separate arrays)
          data.hotels = [];

          // Car rental for Oaxaca trip
          data.carRentals = [
            {
              id: "car-rental-alamo",
              company: "Alamo",
              pickupLocation: "OAX",
              dropoffLocation: "OAX",
              pickupDate: "Feb 18",
              dropoffDate: "Feb 26",
              basePrice: 94,
              withCDW: 202,
              currency: "USD",
              insuranceIncluded: "includes insurance except for CDW (collision damage waiver) insurance but you can find this on credit cards. Adding CDW if you don't have a credit card is $211",
              securityDeposit: 202,
              notes: "*They also need a credit card in order to put the security deposit of $202 that is refunded back to you when you return the car",
              bookingLink: "click here to book on Rentalcars.com"
            }
          ];

          // Override flights with detailed leg information for Oaxaca trip
          data.flights = [
            {
              id: "flight-option-1",
              airline: "Round Trip Flight Option 1 American Airlines",
              departureAirport: "ALB",
              arrivalAirport: "OAX",
              departureTime: "Feb 18, 2026",
              arrivalTime: "Feb 26, 2026",
              price: 1357,
              currency: "USD",
              flightCode: null,
              baggageOptions: "2 personal items | 2 carry-on bags | Seat selection included",
              // Detailed flight legs - total airfare for two travelers
              legs: [
                {
                  route: "ALB ↔ OAX",
                  date: "",
                  price: 1357.00,
                  description: "ALB-OAX (1 layover)"
                }
              ]
            },
            {
              id: "flight-option-2",
              airline: "Round Trip Flight Option 2 Delta Airlines",
              departureAirport: "SYR",
              arrivalAirport: "OAX",
              departureTime: "Feb 18, 2026",
              arrivalTime: "Feb 26, 2026",
              price: 1225,
              currency: "USD",
              flightCode: null,
              baggageOptions: "2 personal items | 2 carry-on bags | Seat selection included",
              // Detailed flight legs - total airfare for two travelers
              legs: [
                {
                  route: "SYR ↔ OAX",
                  date: "",
                  price: 1225.00,
                  description: "SYR-OAX (2 layovers)"
                }
              ]
            }
          ];

          // Override daily schedule - customize Day 1 and Day 2
          if (data.dailySchedule && data.dailySchedule.length > 0) {
            // Update Day 1 with travel day activities
            const day1 = data.dailySchedule.find((day: any) => day.dayNumber === 1);
            if (day1) {
              day1.items = [
                {
                  id: "arrival-header",
                  name: "Arrival",
                  type: "header",
                  category: "section",
                  description: "Welcome to Oaxaca! Your adventure begins.",
                  notes: "Day 1 section header"
                },
                {
                  id: "oaxaca-airport",
                  name: "Oaxaca International Airport",
                  type: "activity",
                  category: "transportation",
                  categoryLabel: "International airport • Airport",
                  rating: 4.2,
                  description: "Arrive at 1:12pm through American Airlines for Round Trip total $1,137",
                  time: "1:12 PM",
                  details: [
                    "2 personal items",
                    "2 carry on",
                    "Seat selection included"
                  ],
                  address: "Oaxaca - Puerto Angel, Santa Cruz",
                  location: "Oaxaca - Puerto Angel, Santa Cruz",
                  notes: "Airport arrival - international terminal",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
                      alt: "Oaxaca International Airport"
                    }
                  ]
                },
                {
                  id: "tlayudas-libres-dona-martha",
                  name: "Tlayudas Libres Doña Martha",
                  type: "food",
                  category: "restaurant",
                  categoryLabel: "$$$ • affordable • Mexican restaurant",
                  cuisine: "Mexican",
                  priceLevel: "$$$",
                  description: "Calle Libres (between Morelos & Murguía) – The Late-Night Hub\n⭐ Most famous for: Tlayudas Libres — open until 3–4 a.m.\nExpect several bean-based tlayuda stands, grilled tortillas with refried beans, avocado, and you can ask \"sin carne ni queso\" (no meat, no cheese).\nLocals and night-shift workers gather here; it's lively and safe if you go before midnight.",
                  address: "Calle Libres (between Morelos & Murguía), Oaxaca",
                  location: "Just a few blocks from the Zócalo and Templo de Santo Domingo",
                  hours: "Open until 3-4 AM",
                  time: "Late Night",
                  notes: "Famous late-night tlayuda spot, affordable Mexican dining",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
                      alt: "Tlayudas Libres Doña Martha - Authentic Oaxacan tlayudas"
                    }
                  ]
                },
                {
                  id: "tree-of-tule",
                  name: "Tree of Tule",
                  type: "activity",
                  category: "landmark",
                  categoryLabel: "Historical landmark • Sights & Landmarks",
                  description: "This Montezuma cypress is the widest tree in the world & is thought to be over 1,400 years old.",
                  location: "Santa María del Tule, Oaxaca",
                  notes: "Iconic ancient tree, must-see landmark",
                  images: [
                    {
                      url: "https://itin-dev.wanderlogstatic.com/freeImage/BuGxyb8pOQlCRQ2kuJUlpmTaBjD4BPZH",
                      alt: "Tree of Tule - Ancient Montezuma cypress"
                    }
                  ]
                }
              ];
            }

            // Update Day 2 with food venues and activities
            const day2 = data.dailySchedule.find((day: any) => day.dayNumber === 2);
            if (day2) {
              day2.items = [
                {
                  id: "kiyo-cafe",
                  name: "Kiyo Café",
                  type: "food",
                  category: "cafeteria",
                  categoryLabel: "Cafeteria • Restaurant",
                  description: "Stylish café that offers vegan toast and oatmeal",
                  address: "Oaxaca City",
                  location: "Oaxaca City",
                  distance: "8 min walk, 0.43 mi",
                  notes: "Cafeteria/Restaurant with vegan options",
                  images: [
                    {
                      url: "/oaxaca/images/Kiyo Cafe.jpeg",
                      alt: "Kiyo Café"
                    }
                  ]
                },
                {
                  id: "hierve-el-agua",
                  name: "Hierve el Agua",
                  type: "activity",
                  category: "nature preserve",
                  categoryLabel: "Nature preserve • Sights & Landmarks",
                  description: "Ancient geological site featuring towering, waterfall-like rock formations, pools & springs.",
                  address: "San Lorenzo Albarradas, Oaxaca",
                  location: "San Lorenzo Albarradas, Oaxaca",
                  notes: "Natural wonder with petrified waterfalls and mineral springs",
                  images: [
                    {
                      url: "/oaxaca/images/Hierve el Agua.jpeg",
                      alt: "Hierve el Agua - Petrified waterfalls and mineral pools"
                    }
                  ]
                }
              ];
            }

            // Day 3 override for Oaxaca trip
            const day3 = data.dailySchedule.find((day: any) => day.dayNumber === 3);
            if (day3) {
              day3.items = [
                {
                  id: "citronella-barra",
                  name: "Citronella Barra Natural",
                  type: "food",
                  category: "vegan restaurant",
                  categoryLabel: "Vegan restaurant • Espresso bar",
                  description: "All-vegan breakfast, salads, drinks, and sandwiches in an interior courtyard flooded with natural light. Lighter vegan fare for breakfast and lunch such as coffee, juices, smoothies made with three types of plant milks (which are made on site), mixed cold drinks made from fresh ingredients, sweet and savory breakfast items including vegan ceviche, and a selection of salads.",
                  address: "Oaxaca City",
                  location: "Oaxaca City",
                  notes: "Vegan restaurant, Espresso bar",
                  images: [
                    {
                      url: "/oaxaca/images/Citronella Barra Natural.jpeg",
                      alt: "Citronella Barra Natural"
                    }
                  ]
                },
                {
                  id: "monte-alban",
                  name: "Monte Albán",
                  type: "activity",
                  category: "archaeological site",
                  categoryLabel: "Archaeological site • Sights & Landmarks",
                  description: "The famous Monte Alban ruins. Located about 20 minutes southwest of the city, Monte Alban was once one of the most important cities of the Zapotec civilization. The city historically served as a political, economic, and religious center for 1,000+ years!\n\nTime on site: 1.5–2 hours\nThis includes walking the Great Plaza, viewpoints, and a few main structures",
                  address: "9 km from Oaxaca City",
                  location: "About 20 minutes southwest of Oaxaca City",
                  notes: "Archaeological site, UNESCO World Heritage Site",
                  images: [
                    {
                      url: "/oaxaca/images/Monte%20Albán.jpeg",
                      alt: "Monte Albán"
                    }
                  ]
                }
              ];
            }

            // Day 4 override for Oaxaca trip
            const day4 = data.dailySchedule.find((day: any) => day.dayNumber === 4);
            if (day4) {
              day4.items = [
                {
                  id: "nanita",
                  name: "Nanita",
                  type: "food",
                  category: "vegan restaurant",
                  categoryLabel: "Vegan restaurant",
                  description: "Plant-based comfort foods café offering Southern style dishes, desserts and drinks.",
                  address: "Oaxaca City",
                  location: "Oaxaca City",
                  notes: "Vegan restaurant",
                  images: [
                    {
                      url: "/oaxaca/images/Nanita.jpeg",
                      alt: "Nanita"
                    }
                  ]
                },
                {
                  id: "teotitlan-del-valle",
                  name: "Teotitlan Del Valle",
                  type: "activity",
                  category: "historical landmark",
                  categoryLabel: "Historical landmark • Sights & Landmarks",
                  description: "One of the oldest and most culturally rich Zapotec villages in the region. It's best known for its handwoven textiles made with natural dyes from plants, minerals, and insects — an art form passed down through generations.",
                  address: "Oaxaca Valley",
                  location: "Oaxaca Valley",
                  notes: "Historical landmark, Zapotec village",
                  images: [
                    {
                      url: "/oaxaca/images/Teotitlan Del Valle.jpeg",
                      alt: "Teotitlan Del Valle"
                    }
                  ]
                }
              ];
            }

            // Day 5 override for Oaxaca trip
            const day5 = data.dailySchedule.find((day: any) => day.dayNumber === 5);
            if (day5) {
              day5.items = [
                {
                  id: "sweet-spot-cafe",
                  name: "Sweet Spot Café & Restaurant",
                  type: "food",
                  category: "vegan restaurant",
                  categoryLabel: "Vegan restaurant • Restaurant",
                  description: "Good for vegan breakfasts, toasts, salads, and lighter meals",
                  address: "Oaxaca City",
                  location: "Oaxaca City",
                  notes: "Vegan restaurant",
                  images: [
                    {
                      url: "/oaxaca/images/Sweet Spot Café & Restaurant.jpeg",
                      alt: "Sweet Spot Café & Restaurant"
                    }
                  ]
                },
                {
                  id: "chill-a-kill",
                  name: "Restaurante Bar Chill A Kill",
                  type: "food",
                  category: "mexican restaurant",
                  categoryLabel: "Mexican restaurant • Bar",
                  description: "Vegan tacos and vegan sandwich",
                  address: "Oaxaca City",
                  location: "Oaxaca City",
                  notes: "Mexican restaurant with vegan options",
                  images: [
                    {
                      url: "/oaxaca/images/Restaurante Bar Chill A Kill.jpeg",
                      alt: "Restaurante Bar Chill A Kill"
                    }
                  ]
                },
                {
                  id: "omars-sportfishing",
                  name: "Omar's Sportfishing & boat trips",
                  type: "activity",
                  category: "fishing charter",
                  categoryLabel: "Fishing charter • Adventure sports center",
                  description: "3hr Dolphin & Whale Watching in Puerto Escondido",
                  time: "11:00 AM - 2:00 PM",
                  address: "Puerto Escondido, Oaxaca",
                  location: "Meeting Point - Puerto Escondido",
                  notes: "Scheduled: 11:00 AM - 2:00 PM, Dolphin & Whale Watching",
                  images: [
                    {
                      url: "/oaxaca/images/Omar's Sportfishing & boat trips.jpeg",
                      alt: "Omar's Sportfishing & boat trips"
                    }
                  ]
                }
              ];
            }

            // Day 6 override for Oaxaca trip
            const day6 = data.dailySchedule.find((day: any) => day.dayNumber === 6);
            if (day6) {
              day6.items = [
                {
                  id: "restaurante-taniperla",
                  name: "Restaurante Taniperla Oaxaca",
                  type: "food",
                  category: "restaurant",
                  description: "Restaurant serving authentic Oaxacan and Mexican cuisine in a welcoming atmosphere.",
                  address: "Oaxaca City",
                  notes: "Traditional Oaxacan restaurant",
                  images: [
                    {
                      url: "/oaxaca/images/Restaurante Taniperla Oaxaca.jpeg",
                      alt: "Restaurante Taniperla Oaxaca"
                    }
                  ]
                },
                {
                  id: "la-pitahaya-vegana",
                  name: "La Pitahaya Vegana",
                  type: "food",
                  category: "vegan restaurant",
                  description: "100% plant-based restaurant offering creative vegan dishes with Mexican and international influences.",
                  address: "Oaxaca City",
                  notes: "Vegan restaurant",
                  images: [
                    {
                      url: "/oaxaca/images/La Pitahaya Vegana.png",
                      alt: "La Pitahaya Vegana"
                    }
                  ]
                },
                {
                  id: "plantasia",
                  name: "Plantasia",
                  type: "food",
                  category: "vegan restaurant",
                  description: "Plant-based eatery specializing in healthy, organic vegan food with fresh ingredients and creative flavors.",
                  address: "Oaxaca City",
                  notes: "Vegan restaurant",
                  images: [
                    {
                      url: "/oaxaca/images/Plantasia.jpeg",
                      alt: "Plantasia"
                    }
                  ]
                },
                {
                  id: "templo-mayor-museum",
                  name: "Templo Mayor Museum",
                  type: "activity",
                  category: "museum",
                  description: "Archaeological museum showcasing the ruins of the Aztec temple complex and artifacts from the ancient capital of Tenochtitlan. A fascinating glimpse into Aztec civilization.",
                  address: "Mexico City Historic Center",
                  notes: "Archaeological museum, Aztec ruins",
                  images: [
                    {
                      url: "/oaxaca/images/Templo Mayor Museum.jpeg",
                      alt: "Templo Mayor Museum"
                    }
                  ]
                },
                {
                  id: "plaza-constitucion",
                  name: "Plaza de la Constitución",
                  type: "activity",
                  category: "plaza",
                  description: "The main square of Mexico City, also known as Zócalo. One of the largest public squares in the world, surrounded by historic buildings including the Metropolitan Cathedral and National Palace.",
                  address: "Mexico City Historic Center",
                  notes: "Historic plaza, Zócalo",
                  images: [
                    {
                      url: "/oaxaca/images/Zócalo de la Ciudad de Oaxaca.jpeg",
                      alt: "Plaza de la Constitución"
                    }
                  ]
                },
                {
                  id: "sunset-horseback-ride",
                  name: "4hr Sunset by horse (river and beach)",
                  type: "activity",
                  category: "horseback riding",
                  categoryLabel: "Horseback riding • Adventure tour",
                  description: "Ride through river, lagoon, and beach landscapes. Learn about local culture and bioluminescence. Enjoy a sunset horseback ride along the Pacific coast. Visit a local family's beach cabin for refreshments.",
                  time: "3:00 PM - 7:00 PM",
                  price: 181.00,
                  address: "Puerto Escondido, Oaxaca",
                  location: "Pacific coast - Puerto Escondido",
                  bookingLink: "https://www.viator.com",
                  notes: "Scheduled: 3:00 PM - 7:00 PM, Total price $181",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1568042972221-99e6379c8f33?w=800&q=80",
                      alt: "Sunset horseback riding on beach"
                    }
                  ]
                },
                {
                  id: "oaxaca-airport",
                  name: "Oaxaca International Airport",
                  type: "travel",
                  category: "airport",
                  description: "Departure from Oaxaca International Airport (OAX). Check-in and security processing for your flight to Mexico City.",
                  address: "Oaxaca",
                  notes: "Airport departure",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
                      alt: "Oaxaca International Airport"
                    }
                  ]
                },
                {
                  id: "mexico-city-airport",
                  name: "Mexico City International Airport Benito Juárez",
                  type: "travel",
                  category: "airport",
                  description: "Arrival at Mexico City International Airport (MEX). One of Latin America's busiest airports, connecting to destinations worldwide.",
                  address: "Mexico City",
                  notes: "Airport arrival",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
                      alt: "Mexico City International Airport Benito Juárez"
                    }
                  ]
                }
              ];
            }

            // Day 7 override for Oaxaca trip
            const day7 = data.dailySchedule.find((day: any) => day.dayNumber === 7);
            if (day7) {
              day7.items = [
                {
                  id: "cafe-elephant-garden",
                  name: "Café Elephant Garden",
                  type: "food",
                  category: "health food restaurant",
                  categoryLabel: "$$ • affordable • Health food restaurant",
                  description: "Casual, relaxed spot with several vegetarian/vegan-friendly menu items (smoothie bowls, plant-milk coffee, etc.).",
                  address: "Oaxaca City",
                  location: "Oaxaca City",
                  notes: "Health food restaurant with vegan options",
                  images: [
                    {
                      url: "/oaxaca/images/Café Elephant Garden.jpeg",
                      alt: "Café Elephant Garden"
                    }
                  ]
                },
                {
                  id: "goyos-burgers",
                  name: "Goyo's Burgers Roma",
                  type: "food",
                  category: "burger restaurant",
                  description: "Popular burger joint in Roma neighborhood serving creative gourmet burgers with fresh ingredients and unique flavor combinations.",
                  address: "Roma, Mexico City",
                  notes: "Gourmet burgers",
                  images: [
                    {
                      url: "/oaxaca/images/Goyo%E2%80%99s%20Burgers%20Roma.jpeg",
                      alt: "Goyo's Burgers Roma"
                    }
                  ]
                },
                {
                  id: "gracias-madre",
                  name: "Gracias Madre Vegan Tacos",
                  type: "food",
                  category: "vegan restaurant",
                  description: "100% plant-based taqueria serving delicious vegan tacos, quesadillas, and Mexican street food with authentic flavors.",
                  address: "Mexico City",
                  notes: "Vegan tacos and Mexican food",
                  images: [
                    {
                      url: "/oaxaca/images/Gracias Madre Vegan Tacos.jpeg",
                      alt: "Gracias Madre Vegan Tacos"
                    }
                  ]
                },
                {
                  id: "san-juan-teotihuacan",
                  name: "San Juan Teotihuacán",
                  type: "activity",
                  category: "archaeological site",
                  description: "Ancient Mesoamerican city and UNESCO World Heritage Site, home to the iconic Pyramids of the Sun and Moon. One of the most significant archaeological sites in Mexico.",
                  address: "State of Mexico",
                  notes: "Archaeological site, UNESCO World Heritage",
                  images: [
                    {
                      url: "/oaxaca/images/San Juan Teotihuacán.jpeg",
                      alt: "San Juan Teotihuacán"
                    }
                  ]
                },
                {
                  id: "pyramid-of-the-sun",
                  name: "Pyramid of the Sun",
                  type: "activity",
                  category: "archaeological site",
                  description: "The largest building in Teotihuacán and one of the largest pyramids in Mesoamerica. Climb to the top for breathtaking views of the ancient city.",
                  address: "Teotihuacán, State of Mexico",
                  notes: "Ancient pyramid, UNESCO World Heritage",
                  images: [
                    {
                      url: "/oaxaca/images/Pyramid of the Sun.jpeg",
                      alt: "Pyramid of the Sun"
                    }
                  ]
                },
                {
                  id: "xochimilco",
                  name: "Xochimilco",
                  type: "activity",
                  category: "cultural site",
                  description: "Famous for its network of canals and colorful trajineras (gondola-like boats). Experience traditional Mexican culture while floating through ancient waterways, a UNESCO World Heritage Site.",
                  address: "Mexico City",
                  notes: "Canals, trajineras, UNESCO World Heritage",
                  images: [
                    {
                      url: "/oaxaca/images/Xochimilco.jpeg",
                      alt: "Xochimilco"
                    }
                  ]
                },
                {
                  id: "fundacion-casa-wabi",
                  name: "Fundación Casa Wabi",
                  type: "activity",
                  category: "art center",
                  categoryLabel: "Art center • Cultural site",
                  description: "An art foundation built by renowned architect, Tadao Ando. This beautiful space offers artist residencies as well as social programs for the community.\n\nYou can visit Casa Wabi on guided tours only. Check the website above for available times and to reserve for total donation price of $66",
                  price: 66.00,
                  address: "Puerto Escondido, Oaxaca",
                  location: "Puerto Escondido, Oaxaca",
                  notes: "Guided tours only, total donation price $66",
                  images: [
                    {
                      url: "/oaxaca/images/Fundación Casa Wabi.jpeg",
                      alt: "Fundación Casa Wabi"
                    }
                  ]
                }
              ];
            }

            // Day 8 override for Oaxaca trip
            const day8 = data.dailySchedule.find((day: any) => day.dayNumber === 8);
            if (day8) {
              day8.items = [
                {
                  id: "cafe-vegetal",
                  name: "Café Vegetal",
                  type: "food",
                  category: "vegan cafe",
                  description: "Plant-based cafe offering organic coffee, fresh juices, and healthy vegan breakfast and lunch options in a cozy atmosphere.",
                  address: "Mexico City",
                  notes: "Vegan cafe",
                  images: [
                    {
                      url: "/oaxaca/images/Café Vegetal.jpeg",
                      alt: "Café Vegetal"
                    }
                  ]
                },
                {
                  id: "mictlan-antojitos",
                  name: "Mictlan Antojitos Veganos",
                  type: "food",
                  category: "vegan restaurant",
                  description: "Authentic vegan Mexican street food and antojitos (traditional snacks) with plant-based versions of classic dishes.",
                  address: "Mexico City",
                  notes: "Vegan Mexican street food",
                  images: [
                    {
                      url: "/oaxaca/images/Mictlan Antojitos Veganos.jpeg",
                      alt: "Mictlan Antojitos Veganos"
                    }
                  ]
                },
                {
                  id: "taco-santo-vegano",
                  name: "Taco Santo Vegano",
                  type: "food",
                  category: "vegan taqueria",
                  description: "Creative vegan taqueria serving plant-based tacos with innovative fillings and traditional Mexican flavors.",
                  address: "Mexico City",
                  notes: "Vegan tacos",
                  images: [
                    {
                      url: "/oaxaca/images/Taco Santo Vegano.jpeg",
                      alt: "Taco Santo Vegano"
                    }
                  ]
                },
                {
                  id: "bosque-chapultepec",
                  name: "Bosque de Chapultepec",
                  type: "activity",
                  category: "park",
                  description: "One of the largest city parks in the Western Hemisphere, featuring museums, lakes, a zoo, and beautiful green spaces perfect for walking and relaxation.",
                  address: "Mexico City",
                  notes: "City park, museums, zoo",
                  images: [
                    {
                      url: "/oaxaca/images/Bosque de Chapultepec.jpeg",
                      alt: "Bosque de Chapultepec"
                    }
                  ]
                },
                {
                  id: "chapultepec-castle",
                  name: "Chapultepec Castle",
                  type: "activity",
                  category: "castle/museum",
                  description: "Historic castle on Chapultepec Hill housing the National Museum of History. Offers stunning views of Mexico City and beautiful architecture.",
                  address: "Chapultepec Park, Mexico City",
                  notes: "Historic castle, museum, city views",
                  images: [
                    {
                      url: "/oaxaca/images/Chapultepec Castle.jpeg",
                      alt: "Chapultepec Castle"
                    }
                  ]
                },
                {
                  id: "mercado-ciudadela",
                  name: "Mercado de Artesanías La Ciudadela",
                  type: "activity",
                  category: "artisan market",
                  description: "Large artisan market featuring traditional Mexican handicrafts, textiles, pottery, and folk art from across the country. Perfect for souvenir shopping.",
                  address: "Mexico City",
                  notes: "Artisan market, handicrafts",
                  images: [
                    {
                      url: "/oaxaca/images/Mercado de Artesanías La Ciudadela.jpeg",
                      alt: "Mercado de Artesanías La Ciudadela"
                    }
                  ]
                }
              ];
            }

            // Day 9 override for Oaxaca trip
            const day9 = data.dailySchedule.find((day: any) => day.dayNumber === 9);
            if (day9) {
              day9.dayTitle = "Final Explorations & Departure";
              day9.items = [
                {
                  id: "mexico-city-airport-departure",
                  name: "Mexico City International Airport Benito Juárez",
                  type: "travel",
                  category: "airport",
                  description: "Departure from Mexico City International Airport (MEX). Check-in and security processing for your return flight.",
                  address: "Mexico City",
                  notes: "Airport departure",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80",
                      alt: "Mexico City International Airport Benito Juárez"
                    }
                  ]
                },
                {
                  id: "jfk-airport",
                  name: "John F. Kennedy International Airport",
                  type: "travel",
                  category: "airport",
                  description: "Arrival at John F. Kennedy International Airport (JFK) in New York.",
                  address: "New York, USA",
                  notes: "Airport arrival",
                  images: [
                    {
                      url: "https://images.unsplash.com/photo-1583531172005-814191b8b6c0?w=800&q=80",
                      alt: "John F. Kennedy International Airport"
                    }
                  ]
                },
                {
                  id: "buena-tierra-mex",
                  name: "Buena Tierra (MEX airport)",
                  type: "food",
                  category: "restaurant",
                  description: "Restaurant located at Mexico City airport offering meals before departure.",
                  address: "Mexico City International Airport",
                  notes: "Airport restaurant",
                  images: [
                    {
                      url: "/oaxaca/images/Buena Tierra.jpeg",
                      alt: "Buena Tierra"
                    }
                  ]
                }
              ];
            }

          }
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

  // Get the actual car rental cost based on CDW selection
  const getCarRentalCost = () => {
    if (!selectedCarRentalData) return 0;
    return selectedCarRentalCDW ? selectedCarRentalData.withCDW : selectedCarRentalData.basePrice;
  };

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
  const carRentalCost = parseFloat(getCarRentalCost().toFixed(2));
  const foodBudget = 500.0; // Fixed food budget for the trip
  // Trip cost includes flights, hotels, car rental, and food budget
  const tripCost = parseFloat((hotelCost + flightCost + carRentalCost + foodBudget).toFixed(2));
  const unlockFee = 299.0;
  const totalCost = parseFloat((tripCost + unlockFee).toFixed(2));

  // Format dates
  const formatDateRange = () => {
    if (!tripData) return "";
    // Ensure dates are parsed correctly for display
    const start = new Date(tripData.startDate + 'T00:00:00');
    const end = new Date(tripData.endDate + 'T00:00:00');
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
      } else if (day.dayNumber === 9) {
        return 'Final Explorations & Departure';
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/mame-dee-logo.png"
              alt="Mame Dee Travel World"
              className="h-32 md:h-44 object-contain"
            />
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Select Your Flight
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Choose the flight option that best suits your schedule and budget
            </p>
          </div>

          {isOaxacaTrip ? (
            // Selectable flight cards for Oaxaca trip - side by side
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {tripData.flights.map((flight, flightIdx) => {
                const flightKey = flight.id || `flight-${flightIdx}`;
                const isSelected = selectedFlight === flightKey;
                const planeImages = [
                  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
                  'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=800'
                ];
                const flightImage = planeImages[flightIdx % planeImages.length];

                return (
                  <div
                    key={flightKey}
                    onClick={() => setSelectedFlight(flightKey)}
                    className={`rounded-xl overflow-hidden shadow-lg border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      isSelected
                        ? 'border-blue-600 scale-105'
                        : 'border-gray-200 opacity-60 grayscale-[50%]'
                    }`}
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
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                          {flight.airline}
                        </h3>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
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
                                  <div className="text-xs text-gray-600">{leg.description}</div>
                                  {leg.date && <div className="text-xs text-gray-500 mt-1">{leg.date}</div>}
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-lg font-bold text-[#1e3a8a]">
                                    ${leg.price.toFixed(2)}
                                  </div>
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
                        <p className="text-xs text-gray-500 mt-2">For 2 travelers</p>
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

      {/* Oaxaca Hotels Section (Feb 18-21) */}
      {tripData.hotelsOaxaca && tripData.hotelsOaxaca.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Oaxaca Accommodation
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Feb 18-21 • Choose your home base in Oaxaca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tripData.hotelsOaxaca.map((hotel, hotelIdx) => {
              const hotelKey = hotel.id || `hotel-oaxaca-${hotelIdx}`;
              const isSelected = selectedHotelOaxaca === hotelKey;
              const oaxacaNights = 4; // Feb 18-21

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

      {/* Puerto Escondido Hotels Section (Feb 21-25) */}
      {tripData.hotelsMexicoCity && tripData.hotelsMexicoCity.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Puerto Escondido Accommodation
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Feb 21-25 • Choose your home base in Puerto Escondido
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tripData.hotelsMexicoCity.map((hotel, hotelIdx) => {
              const hotelKey = hotel.id || `hotel-mexico-${hotelIdx}`;
              const isSelected = selectedHotelMexicoCity === hotelKey;
              const mexicoCityNights = 5; // Feb 21-25

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

      {/* Oaxaca Return Hotels Section (Feb 25-26) */}
      {tripData.hotelsOaxacaReturn && tripData.hotelsOaxacaReturn.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
              Oaxaca Accommodation
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Feb 25-26 • Choose your final night in Oaxaca
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {tripData.hotelsOaxacaReturn.map((hotel, hotelIdx) => {
              const hotelKey = hotel.id || `hotel-oaxaca-return-${hotelIdx}`;
              const isSelected = selectedHotelOaxacaReturn === hotelKey;
              const oaxacaReturnNights = 1; // Feb 25-26

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
                  onClick={() => setSelectedHotelOaxacaReturn(hotelKey)}
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

                  <div className="relative h-48">
                    <img
                      src={hotelImage}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = fallbackHotelImages[0];
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        {hotel.name}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-white p-6">
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-sm font-semibold text-gray-700">
                        {hotel.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
                      {hotel.roomType}
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
                        {oaxacaReturnNights} night
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
              Car Rental
            </h2>
            <p className="text-lg" style={{ fontFamily: 'var(--font-inter)', color: '#5a5a5a' }}>
              Choose your transportation option for maximum flexibility
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-6 max-w-3xl mx-auto">
            {tripData.carRentals.map((carRental, carIdx) => {
              const carKey = carRental.id || `car-${carIdx}`;
              const isSelected = selectedCarRental === carKey;

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
                        <h3 className="text-lg font-bold text-gray-900">
                          {carRental.company}
                        </h3>
                      </div>
                    </div>

                    {/* Pickup and Drop-off (for Choice B only) */}
                    {carRental.options && carRental.options.length > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-700">
                          <div>
                            <span className="font-semibold">Pickup:</span> {carRental.pickupLocation}
                          </div>
                          <div>
                            <span className="font-semibold">Drop-off:</span> {carRental.dropoffLocation}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Route Information */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 text-center">
                        {carRental.pickupDate} - {carRental.dropoffDate}
                      </div>
                    </div>

                    {/* Rental Periods Breakdown (for Choice A) */}
                    {carRental.periods && carRental.periods.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Rental Periods</h4>
                        <div className="space-y-3">
                          {carRental.periods.map((period, periodIdx) => (
                            <div key={periodIdx} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-900 mb-1">
                                    {period.location.includes('Oaxaca') ? 'Oaxaca to Oaxaca (OAX)' : 'Mexico City (MEX) to Mexico City (MEX)'}
                                  </div>
                                  <div className="text-xs text-gray-600">{period.company}</div>
                                  <div className="text-xs text-gray-500 mt-1">{period.dates}</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded mb-2">
                                <p>{period.company} Security Deposit: ${period.securityDeposit.toFixed(2)} (refundable)</p>
                              </div>
                              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                                <div className="flex-1">
                                  <div className="text-gray-600 text-xs">Without CDW:</div>
                                  <div className="font-bold text-[#1e3a8a]">${period.basePrice.toFixed(2)}</div>
                                </div>
                                <div className="flex-1 text-right">
                                  <div className="text-gray-600 text-xs">With CDW:</div>
                                  <div className="font-semibold text-gray-700">${period.withCDW.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* One-Way Rental Options (for Choice B) */}
                    {carRental.options && carRental.options.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Available Options - Select One</h4>
                        <div className="space-y-3">
                          {carRental.options.map((option, optionIdx) => {
                            const isOptionSelected = isSelected && selectedCarRentalOption === optionIdx;
                            return (
                              <div
                                key={optionIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCarRental(carKey);
                                  setSelectedCarRentalOption(optionIdx);
                                }}
                                className={`cursor-pointer rounded-lg border-2 p-3 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
                                  isOptionSelected
                                    ? 'bg-blue-50 border-blue-500 shadow-md'
                                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="font-bold text-gray-900">{option.company}</div>
                                      {isOptionSelected && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600">Rating: {option.rating}</div>
                                    {option.bookingNote && (
                                      <div className="text-xs text-blue-600 mt-1">({option.bookingNote})</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 bg-white p-2 rounded mb-2">
                                  <p>Security Deposit: ${option.securityDeposit.toFixed(2)} (refundable)</p>
                                </div>
                                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex-1">
                                    <div className="text-gray-600 text-xs">Without CDW:</div>
                                    <div className="font-bold text-[#1e3a8a]">${option.basePrice.toFixed(2)}</div>
                                  </div>
                                  <div className="flex-1 text-right">
                                    <div className="text-gray-600 text-xs">With CDW:</div>
                                    <div className="font-semibold text-gray-700">${option.withCDW.toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-3 text-xs text-gray-600 bg-blue-50 p-3 rounded">
                      <p className="mb-1">{carRental.insuranceIncluded}</p>
                      {carRental.notes && <p className="text-gray-500">{carRental.notes}</p>}
                    </div>

                    {/* CDW Selection Buttons */}
                    <div className="pt-3 border-t-2 border-gray-300">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Insurance Option</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCarRentalCDW(false);
                            }}
                            className={`px-4 py-3 rounded-lg border-2 transition-all ${
                              !selectedCarRentalCDW
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="text-sm">Without CDW</div>
                            <div className="text-xl font-bold">${carRental.basePrice.toFixed(2)}</div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCarRentalCDW(true);
                            }}
                            className={`px-4 py-3 rounded-lg border-2 transition-all ${
                              selectedCarRentalCDW
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <div className="text-sm">With CDW</div>
                            <div className="text-xl font-bold">${carRental.withCDW.toFixed(2)}</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Car Rental Total Summary */}
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
            {tripData.dailySchedule
              .filter((day: any) => !(isOaxacaTrip && day.dayNumber === 10))
              .map((day, dayIdx) => (
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
                  // This function is used by both activities and dining sections
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

                  // Store function reference outside IIFE for dining section
                  (window as any).__deduplicateActivities = deduplicateActivities;

                  // Filter activities (exclude hotels, dining, airports) - EXCEPT for customized days
                  let allActivities = day.items.filter((item: any) => {
                    // For Day 1, 2, 3, 4, 5, 6, 7, 8, 9 on Oaxaca trip, show activity, food, travel, and header items
                    if (isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9)) {
                      return item.type === 'activity' || item.type === 'food' || item.type === 'travel' || item.type === 'header';
                    }

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

                  // Deduplicate activities before displaying (skip for customized Oaxaca days)
                  if (isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9)) {
                    // For customized days, use the items as-is without looking them up in activities database
                    allActivities = allActivities;
                  } else {
                    allActivities = deduplicateActivities(allActivities.map((item: any) => {
                      return tripData.activities.find((act: any) => act.name === item.name) || item;
                    }));
                  }

                  // Ensure minimum 3 activities per day - if fewer, pull from full activities list
                  // Skip this for customized Oaxaca days
                  if (allActivities.length < 3 && !(isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9))) {
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

                  // For customized Oaxaca days, separate food, activities, travel, and headers
                  const headerItems = (isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9))
                    ? allActivities.filter((item: any) => item.type === 'header')
                    : [];
                  const foodItems = (isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9))
                    ? allActivities.filter((item: any) => item.type === 'food')
                    : [];
                  const travelItems = (isOaxacaTrip && (day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 9))
                    ? allActivities.filter((item: any) => item.type === 'travel')
                    : [];
                  const activityItems = (isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9))
                    ? allActivities.filter((item: any) => item.type === 'activity')
                    : allActivities;

                  return (
                    <>
                      {/* Special rendering for Day 1 with Arrival header */}
                      {isOaxacaTrip && day.dayNumber === 1 && headerItems.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-cormorant)', color: colors.primary }}>
                            {headerItems[0].name}
                          </h3>
                          {headerItems[0].description && (
                            <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                              {headerItems[0].description}
                            </p>
                          )}
                          {/* Airport card under Arrival */}
                          {activityItems.filter((item: any) => item.id === 'oaxaca-airport').map((item: any, idx: number) => {
                            const description = item.description || 'Airport arrival';
                            const itemImage = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800';

                            return (
                              <div
                                key={`arrival-airport-${idx}`}
                                className="bg-white rounded-xl overflow-hidden border border-blue-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer mb-6"
                              >
                                <div className="relative h-40">
                                  <img
                                    src={itemImage}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>
                                <div className="p-4">
                                  {item.categoryLabel && (
                                    <div className="text-xs text-gray-500 mb-1">
                                      {item.categoryLabel}
                                    </div>
                                  )}
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="font-bold text-gray-900 flex-1">{item.name}</div>
                                    {item.rating && (
                                      <div className="flex items-center ml-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                                        <span className="text-sm font-semibold text-gray-700">{item.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">{description}</div>
                                  {item.details && item.details.length > 0 && (
                                    <ul className="text-xs text-gray-600 mb-2 space-y-1">
                                      {item.details.map((detail: string, detailIdx: number) => (
                                        <li key={detailIdx} className="flex items-start">
                                          <span className="mr-2">•</span>
                                          <span>{detail}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {item.location && (
                                    <div className="text-xs text-gray-500 mt-2">
                                      {item.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Food Section - only for customized days */}
                      {foodItems.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            Food
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {foodItems.map((item: any, foodIdx: number) => {
                              const description = item.description || 'Delicious local cuisine and dining experience';
                              const foodImage = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800';

                              return (
                                <div
                                  key={`food-${item.id || foodIdx}`}
                                  className="bg-white rounded-xl overflow-hidden border border-orange-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer"
                                >
                                  <div className="relative h-48">
                                    <img
                                      src={foodImage}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4">
                                    {/* Category Label */}
                                    {item.categoryLabel && (
                                      <div className="text-xs text-gray-500 mb-1">
                                        {item.categoryLabel}
                                      </div>
                                    )}
                                    <h5 className="font-bold text-gray-900 mb-2">{item.name}</h5>
                                    <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{description}</p>

                                    {item.hours && (
                                      <div className="text-xs text-gray-600 mb-1">
                                        <span className="font-semibold">Hours:</span> {item.hours}
                                      </div>
                                    )}

                                    {item.location && (
                                      <div className="text-xs text-gray-500">
                                        {item.location}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Activities Section */}
                      {activityItems.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            Activities
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {activityItems
                              .filter((item: any) => !(isOaxacaTrip && day.dayNumber === 1 && item.id === 'oaxaca-airport'))
                              .map((item: any, actIdx: number) => {
                            // Find the full activity details
                            const activityDetails = tripData.activities.find(
                              (act) => act.name === item.name
                            );

                            // Extract location from address
                            const location = activityDetails?.address?.split(',').slice(0, 2).join(',') || 'Local Area';

                            // Get description - use actual data or generic fallback
                            const description = item.description || activityDetails?.description || 'Explore this local attraction and discover what makes it special';

                            // Get activity image - check item.images first (for custom days), then fall back to database
                            // Rotate through images to avoid duplicates across different activity cards
                            const imageIndex = actIdx % (activityDetails?.images?.length || 1);
                            const itemImage = item.images?.[0]?.url; // Custom days have images directly on item
                            const activityImage = itemImage || activityDetails?.images?.[imageIndex]?.url;

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
                                </div>

                                {/* Activity Details */}
                                <div className="p-4">
                                  {/* Category Label */}
                                  {item.categoryLabel && (
                                    <div className="text-xs text-gray-500 mb-1">
                                      {item.categoryLabel}
                                    </div>
                                  )}

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

                                  {/* Description with optional booking link */}
                                  {item.bookingLink ? (
                                    <a
                                      href={item.bookingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block hover:underline"
                                    >
                                      {description}
                                    </a>
                                  ) : (
                                    <div className="text-sm text-gray-600 mb-2">{description}</div>
                                  )}

                                  {/* Details list (for airport info) */}
                                  {item.details && item.details.length > 0 && (
                                    <ul className="text-xs text-gray-600 mb-2 space-y-1">
                                      {item.details.map((detail: string, idx: number) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="mr-2">•</span>
                                          <span>{detail}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

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
                      )}

                      {/* Travel Section - for Day 5 and Day 6 */}
                      {travelItems.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
                            Travel
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {travelItems.map((item: any, travelIdx: number) => {
                              const description = item.description || 'Travel information';
                              const travelImage = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800';

                              return (
                                <div
                                  key={`travel-${item.id || travelIdx}`}
                                  className="bg-white rounded-xl overflow-hidden border border-blue-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform cursor-pointer"
                                >
                                  <div className="relative h-48">
                                    <img
                                      src={travelImage}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4">
                                    <h5 className="font-bold text-gray-900 mb-2">{item.name}</h5>
                                    <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                    {/* Dining Section - Skip for customized Oaxaca days */}
                    {!(isOaxacaTrip && (day.dayNumber === 1 || day.dayNumber === 2 || day.dayNumber === 3 || day.dayNumber === 4 || day.dayNumber === 5 || day.dayNumber === 6 || day.dayNumber === 7 || day.dayNumber === 8 || day.dayNumber === 9)) && (() => {
                      // Get deduplicate function from window
                      const deduplicateActivities = (window as any).__deduplicateActivities;
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

            {/* Flight Cost */}
            {selectedFlightData && (
              <div className="flex justify-between items-center pb-3 border-b border-white/30">
                <div>
                  <div className="font-semibold text-base">
                    Round-trip Flight
                  </div>
                  <div className="text-blue-100 text-sm">
                    {selectedFlightData.departureAirport} ↔ {selectedFlightData.arrivalAirport} • 2 travelers
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${flightCost.toFixed(2)}</div>
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
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/send-feedback-email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          tripId,
                          tripData,
                          feedbackType: 'edit_request',
                          message: editRequest
                        }),
                      });

                      if (response.ok) {
                        alert("Thank you! We'll update your itinerary and send you a revised version.");
                        setShowEditModal(false);
                        setEditRequest("");
                      } else {
                        alert("There was an error submitting your request. Please try again.");
                      }
                    } catch (error) {
                      console.error('Error submitting edit request:', error);
                      alert("There was an error submitting your request. Please try again.");
                    }
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
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/send-feedback-email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          tripId,
                          tripData,
                          feedbackType: 'not_interested',
                          message: notInterestedReason
                        }),
                      });

                      if (response.ok) {
                        alert("Thank you for your feedback. We appreciate your time!");
                        setShowNotInterestedModal(false);
                        setNotInterestedReason("");
                      } else {
                        alert("There was an error submitting your feedback. Please try again.");
                      }
                    } catch (error) {
                      console.error('Error submitting feedback:', error);
                      alert("There was an error submitting your feedback. Please try again.");
                    }
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
