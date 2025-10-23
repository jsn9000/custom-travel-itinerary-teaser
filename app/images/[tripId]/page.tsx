/**
 * Images Gallery Page
 * Displays all scraped images from a Wanderlog trip
 */

import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { WanderlogTrip } from "@/types/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function ImagesPage({ params }: PageProps) {
  const { tripId } = await params;

  const supabase = createServerSupabaseClient();

  // Fetch trip data
  const { data, error } = await supabase
    .from("wanderlog_trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !data) {
    notFound();
  }

  const tripData = data as WanderlogTrip;
  const metadata: any = tripData.metadata || {};
  const headerImages = metadata.header_images || [];
  const activities = metadata.activities || [];
  const hotels = metadata.hotels || [];
  const dailyItinerary = metadata.daily_itinerary || [];

  // Collect all activity images
  const activityImages: Array<{ activity: string; images: any[] }> = [];
  activities.forEach((activity: any) => {
    if (activity.images && activity.images.length > 0) {
      activityImages.push({
        activity: activity.name,
        images: activity.images,
      });
    }
  });

  // Collect hotel images if they exist
  const hotelImages: Array<{ hotel: string; images: any[] }> = [];
  hotels.forEach((hotel: any) => {
    if (hotel.images && hotel.images.length > 0) {
      hotelImages.push({
        hotel: hotel.name,
        images: hotel.images,
      });
    }
  });

  // Count total images
  const totalImages =
    headerImages.length +
    activityImages.reduce((sum, a) => sum + a.images.length, 0) +
    hotelImages.reduce((sum, h) => sum + h.images.length, 0);

  return (
    <div className="max-w-[1400px] mx-auto p-8 min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl mb-8 shadow-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Scraped Images Gallery
        </h1>
        <div className="flex gap-8 flex-wrap text-gray-600 text-sm">
          <div>
            <strong>Trip:</strong> {tripData.trip_title || "Untitled Trip"}
          </div>
          <div>
            <strong>Source:</strong>{" "}
            <a
              href={tripData.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {tripData.source_url}
            </a>
          </div>
          <div>
            <strong>Total Images:</strong> {totalImages}
          </div>
        </div>
        <Link
          href={`/teaser/${tripId}`}
          className="inline-block mt-4 text-blue-600 font-medium hover:underline"
        >
          ← Back to Teaser Page
        </Link>
      </div>

      <div className="flex gap-8 flex-wrap p-4 bg-blue-50 rounded-lg mb-4">
        <div className="text-sm">
          <strong className="text-blue-600 text-2xl block">
            {headerImages.length}
          </strong>
          Header Images
        </div>
        <div className="text-sm">
          <strong className="text-blue-600 text-2xl block">
            {activityImages.length}
          </strong>
          Activities with Images
        </div>
        <div className="text-sm">
          <strong className="text-blue-600 text-2xl block">
            {activityImages.reduce((sum, a) => sum + a.images.length, 0)}
          </strong>
          Activity Images
        </div>
        {hotelImages.length > 0 && (
          <div className="text-sm">
            <strong className="text-blue-600 text-2xl block">
              {hotelImages.reduce((sum, h) => sum + h.images.length, 0)}
            </strong>
            Hotel Images
          </div>
        )}
      </div>

      {/* Header Images */}
      {headerImages.length > 0 && (
        <div className="bg-white p-8 rounded-xl mb-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b-4 border-blue-600 pb-2">
            Header Images ({headerImages.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {headerImages.map((imageUrl: string, idx: number) => (
              <div
                key={idx}
                className="border border-gray-300 rounded-lg overflow-hidden bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={imageUrl}
                  alt={`Header ${idx + 1}`}
                  className="w-full h-[250px] object-cover"
                />
                <div className="p-4 bg-gray-50">
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                    Header Image {idx + 1}
                  </div>
                  <div className="text-sm text-gray-900 font-medium break-all">
                    {imageUrl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Images */}
      {activityImages.length > 0 && (
        <div className="bg-white p-8 rounded-xl mb-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b-4 border-blue-600 pb-2">
            Activity Images ({activityImages.length} activities)
          </h2>
          {activityImages.map((activity, idx) => (
            <div key={idx}>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800 bg-gray-100 p-3 rounded-lg">
                {activity.activity} ({activity.images.length} images)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activity.images.map((img: any, imgIdx: number) => (
                  <div
                    key={imgIdx}
                    className="border border-gray-300 rounded-lg overflow-hidden bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || activity.activity}
                      className="w-full h-[250px] object-cover"
                    />
                    <div className="p-4 bg-gray-50">
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                        Position {img.position || imgIdx}
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        {img.alt || activity.activity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hotel Images */}
      {hotelImages.length > 0 && (
        <div className="bg-white p-8 rounded-xl mb-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b-4 border-blue-600 pb-2">
            Hotel Images ({hotelImages.length} hotels)
          </h2>
          {hotelImages.map((hotel, idx) => (
            <div key={idx}>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800 bg-gray-100 p-3 rounded-lg">
                {hotel.hotel} ({hotel.images.length} images)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {hotel.images.map((img: any, imgIdx: number) => (
                  <div
                    key={imgIdx}
                    className="border border-gray-300 rounded-lg overflow-hidden bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || hotel.hotel}
                      className="w-full h-[250px] object-cover"
                    />
                    <div className="p-4 bg-gray-50">
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                        Position {img.position || imgIdx}
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        {img.alt || hotel.hotel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalImages === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="text-center py-12 text-gray-400 italic">
            No images found for this trip.
          </div>
        </div>
      )}
    </div>
  );
}
