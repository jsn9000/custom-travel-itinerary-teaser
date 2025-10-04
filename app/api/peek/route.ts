import { NextRequest, NextResponse } from "next/server";

export interface PeekResponse {
  hasAccess: boolean;
  message: string;
  stopId?: string;
  revealedData?: {
    exactName?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
    bookingInfo?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { stopId, accessToken } = await request.json();

    // In production, this would:
    // 1. Validate accessToken against purchase records
    // 2. Check if user has paid for this itinerary
    // 3. Return full details if authorized
    // 4. Log access attempt for security

    // Mock: Always deny access in teaser mode
    const hasAccess = false; // Set to true after payment verification

    if (!hasAccess) {
      return NextResponse.json<PeekResponse>({
        hasAccess: false,
        message: "Unlock the full itinerary to reveal all details",
      });
    }

    // Mock revealed data (would come from Wanderlog in production)
    return NextResponse.json<PeekResponse>({
      hasAccess: true,
      message: "Access granted",
      stopId,
      revealedData: {
        exactName: "The Grand Hotel & Spa",
        address: "123 Coastal Avenue, Suite 100",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        bookingInfo: "Confirmation #ABC123456",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { hasAccess: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
