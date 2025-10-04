import { NextResponse } from "next/server";

// Types matching the schema from prompts/claude.pmd
export interface TeaserStop {
  id: string;
  displayName: string;
  displayArea: string;
  timeWindow: "Morning" | "Midday" | "Afternoon" | "Evening" | "Late";
  thumbUrl: string;
  type: "hotel" | "food" | "attraction" | "transport" | "other";
}

export interface TeaserDay {
  label: string;
  summary: string;
  stops: TeaserStop[];
}

export interface TeaserPayload {
  tripTitle: string;
  tripDates: string;
  days: TeaserDay[];
}

// Mock teaser data - obfuscated per redaction policy
const mockTeaserData: TeaserPayload = {
  tripTitle: "Mediterranean Adventure",
  tripDates: "June 10-17, 2025",
  days: [
    {
      label: "Day 1",
      summary: "Arrival in the azure coast and sunset welcome",
      stops: [
        {
          id: "t1-morning-1",
          displayName: "Luxury Resort S•••",
          displayArea: "Coastal Village",
          timeWindow: "Morning",
          thumbUrl: "/api/og/teaser?stop=1",
          type: "hotel",
        },
        {
          id: "t1-midday-1",
          displayName: "Seafood Taverna P•••",
          displayArea: "Harbor District",
          timeWindow: "Midday",
          thumbUrl: "/api/og/teaser?stop=2",
          type: "food",
        },
        {
          id: "t1-afternoon-1",
          displayName: "Ancient Acropolis •••",
          displayArea: "Historic Center",
          timeWindow: "Afternoon",
          thumbUrl: "/api/og/teaser?stop=3",
          type: "attraction",
        },
        {
          id: "t1-evening-1",
          displayName: "Sunset Terrace R•••",
          displayArea: "Cliffside",
          timeWindow: "Evening",
          thumbUrl: "/api/og/teaser?stop=4",
          type: "food",
        },
      ],
    },
    {
      label: "Day 2",
      summary: "Island hopping and crystal-clear waters",
      stops: [
        {
          id: "t2-morning-1",
          displayName: "Private Boat T•••",
          displayArea: "Marina",
          timeWindow: "Morning",
          thumbUrl: "/api/og/teaser?stop=5",
          type: "transport",
        },
        {
          id: "t2-midday-1",
          displayName: "Beach Club M•••",
          displayArea: "Secluded Cove",
          timeWindow: "Midday",
          thumbUrl: "/api/og/teaser?stop=6",
          type: "food",
        },
        {
          id: "t2-afternoon-1",
          displayName: "Hidden Grotto •••",
          displayArea: "Island Coast",
          timeWindow: "Afternoon",
          thumbUrl: "/api/og/teaser?stop=7",
          type: "attraction",
        },
        {
          id: "t2-evening-1",
          displayName: "Waterfront Bistro L•••",
          displayArea: "Island Village",
          timeWindow: "Evening",
          thumbUrl: "/api/og/teaser?stop=8",
          type: "food",
        },
      ],
    },
    {
      label: "Day 3",
      summary: "Wine country and olive groves",
      stops: [
        {
          id: "t3-morning-1",
          displayName: "Vineyard Estate V•••",
          displayArea: "Wine Region",
          timeWindow: "Morning",
          thumbUrl: "/api/og/teaser?stop=9",
          type: "attraction",
        },
        {
          id: "t3-midday-1",
          displayName: "Family Trattoria A•••",
          displayArea: "Countryside",
          timeWindow: "Midday",
          thumbUrl: "/api/og/teaser?stop=10",
          type: "food",
        },
        {
          id: "t3-afternoon-1",
          displayName: "Olive Oil Mill •••",
          displayArea: "Rural Valley",
          timeWindow: "Afternoon",
          thumbUrl: "/api/og/teaser?stop=11",
          type: "attraction",
        },
        {
          id: "t3-evening-1",
          displayName: "Michelin Star D•••",
          displayArea: "Historic Town",
          timeWindow: "Evening",
          thumbUrl: "/api/og/teaser?stop=12",
          type: "food",
        },
      ],
    },
    {
      label: "Day 4",
      summary: "Coastal villages and artisan markets",
      stops: [
        {
          id: "t4-morning-1",
          displayName: "Scenic Drive T•••",
          displayArea: "Coastal Highway",
          timeWindow: "Morning",
          thumbUrl: "/api/og/teaser?stop=13",
          type: "transport",
        },
        {
          id: "t4-midday-1",
          displayName: "Artisan Market •••",
          displayArea: "Village Square",
          timeWindow: "Midday",
          thumbUrl: "/api/og/teaser?stop=14",
          type: "attraction",
        },
        {
          id: "t4-afternoon-1",
          displayName: "Cliffside Cafe C•••",
          displayArea: "Panoramic Point",
          timeWindow: "Afternoon",
          thumbUrl: "/api/og/teaser?stop=15",
          type: "food",
        },
        {
          id: "t4-evening-1",
          displayName: "Traditional Taverna E•••",
          displayArea: "Mountain Village",
          timeWindow: "Evening",
          thumbUrl: "/api/og/teaser?stop=16",
          type: "food",
        },
      ],
    },
    {
      label: "Day 5",
      summary: "Spa retreat and wellness day",
      stops: [
        {
          id: "t5-morning-1",
          displayName: "Thermal Springs S•••",
          displayArea: "Mountain Resort",
          timeWindow: "Morning",
          thumbUrl: "/api/og/teaser?stop=17",
          type: "other",
        },
        {
          id: "t5-midday-1",
          displayName: "Wellness Retreat L•••",
          displayArea: "Spa Village",
          timeWindow: "Midday",
          thumbUrl: "/api/og/teaser?stop=18",
          type: "food",
        },
        {
          id: "t5-afternoon-1",
          displayName: "Yoga & Meditation •••",
          displayArea: "Hilltop Sanctuary",
          timeWindow: "Afternoon",
          thumbUrl: "/api/og/teaser?stop=19",
          type: "other",
        },
        {
          id: "t5-evening-1",
          displayName: "Organic Farm Dinner F•••",
          displayArea: "Countryside Estate",
          timeWindow: "Evening",
          thumbUrl: "/api/og/teaser?stop=20",
          type: "food",
        },
      ],
    },
  ],
};

export async function GET() {
  // In production, this would:
  // 1. Fetch raw Wanderlog data from secure storage
  // 2. Apply redaction rules via the Itinerary Redactor
  // 3. Generate unique obfuscated IDs per viewer session
  // 4. Return teaser-safe payload

  return NextResponse.json(mockTeaserData);
}
