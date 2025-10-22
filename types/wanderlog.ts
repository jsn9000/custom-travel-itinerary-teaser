/**
 * TypeScript types for Wanderlog trip data
 */

export interface WanderlogImage {
  url: string;
  alt?: string;
  caption?: string;
  position: number;
  associatedSection?: string; // 'header' | 'notes' | 'flight' | 'hotel' | 'activity' | etc.
  associatedActivityId?: string;
}

export interface WanderlogFlight {
  airline: string;
  flightCode?: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  baggageOptions?: string;
}

export interface WanderlogHotel {
  name: string;
  roomType?: string;
  amenities: string[];
  rating?: number;
  price: number;
  currency: string;
  address?: string;
}

export interface WanderlogCarRental {
  company: string;
  vehicleType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  price?: number;
  currency?: string;
  discountInfo?: string;
}

export interface WanderlogActivity {
  id: string; // Generated ID for referencing
  name: string;
  description?: string;
  location?: string;
  address?: string;
  hours?: string;
  rating?: number;
  contact?: string;
  category?: string;
  images: WanderlogImage[];
}

export interface WanderlogDailyScheduleItem {
  type: 'travel' | 'accommodation' | 'activity' | 'meal';
  name: string;
  time?: string;
  duration?: string;
  distance?: string;
  description?: string;
  activityId?: string; // Reference to activity if applicable
}

export interface WanderlogDailySchedule {
  dayNumber: number;
  date: string; // Format: "Sun 7/13" or full date
  items: WanderlogDailyScheduleItem[];
}

export interface WanderlogTripData {
  // Basic trip info
  title: string;
  creator?: string;
  startDate: string;
  endDate: string;
  views?: number;
  publicationDate?: string;
  wanderlogUrl: string;

  // Header images
  headerImages: string[];

  // Sections
  notes?: string;
  flights: WanderlogFlight[];
  hotels: WanderlogHotel[];
  carRentals: WanderlogCarRental[];
  activities: WanderlogActivity[];

  // Daily schedule
  dailySchedule: WanderlogDailySchedule[];

  // All images with associations
  images: WanderlogImage[];
}

export interface ScrapedWanderlogData extends WanderlogTripData {
  scrapedAt: string;
  imageAssociationStats: {
    total: number;
    associated: number;
    unassociated: number;
  };
}
