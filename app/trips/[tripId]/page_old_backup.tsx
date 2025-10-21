'use client';

/**
 * Dynamic Trip Display Page
 * Displays imported Wanderlog trip data with clean, modern styling
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
  };
}

export default function TripDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
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
        (prev) => (prev + 1) % tripData.metadata.images.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [tripData]);

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
  const { locations = [], itinerary = [], images = [] } = metadata || {};

  // Use Wanderlog images if available, otherwise use placeholders
  const bannerImages = images.length > 0
    ? images.slice(0, 10).map((img, idx) => ({
        type: 'image',
        url: img,
        title: `${destination} - Image ${idx + 1}`,
      }))
    : [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920',
          title: 'Travel Destination',
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
            <div className="flex items-center gap-3 text-lg md:text-xl text-white/95">
              <Calendar className="w-5 h-5" />
              <p className="font-semibold drop-shadow-lg">
                {trip_dates}
              </p>
            </div>

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
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Your {destination} Adventure
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed text-center max-w-3xl mx-auto mb-6">
            Imported from Wanderlog • {locations.length} locations •{' '}
            {itinerary.length} days of activities
          </p>

          <div className="flex justify-center">
            <a
              href={tripData.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              View Original on Wanderlog
            </a>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      {locations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Locations to Explore
            </h2>
            <p className="text-lg text-gray-600">
              {locations.length} amazing places waiting for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {locations.slice(0, 12).map((location, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48">
                  {location.imageUrl ? (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">
                      {location.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {location.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Itinerary Section */}
      {itinerary.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Your Itinerary
            </h2>
            <p className="text-lg text-gray-600">
              {itinerary.length} days of unforgettable experiences
            </p>
          </div>

          <div className="space-y-8">
            {itinerary.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold px-6 py-3 rounded-lg shadow-md">
                      {day.day}
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Activities & Locations
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {day.activities.map((activity, actIdx) => (
                      <div
                        key={actIdx}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {activity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Buttons Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">
            Ready to Book Your Adventure?
          </h2>

          <div className="max-w-md mx-auto space-y-3">
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
              onClick={() => window.open(tripData.source_url, '_blank')}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              View Full Trip on Wanderlog
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
            >
              I like it but I want to make edits
            </button>

            <button
              onClick={() => setShowNotInterestedModal(true)}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
            >
              Not Interested
            </button>

            <button
              onClick={() => router.push('/wanderlog-import')}
              className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Import Another Trip
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-2xl font-bold text-white mb-2">
                Custom Itinerary Travel
              </div>
              <p className="text-gray-500 text-sm">
                Powered by Wanderlog & Firecrawl AI
              </p>
            </div>
            <div className="border-t border-gray-800 pt-6 mt-6">
              <p className="text-sm">
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
                setEditRequest('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What Would You Like to Change?
            </h3>
            <p className="text-gray-600 mb-6">
              Tell us what edits you'd like to make to this itinerary.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requested Changes
                </label>
                <textarea
                  value={editRequest}
                  onChange={(e) => setEditRequest(e.target.value)}
                  placeholder="Describe the changes you'd like..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRequest('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Edit request submitted:', editRequest);
                    alert('Thank you! We will update your itinerary.');
                    setShowEditModal(false);
                    setEditRequest('');
                  }}
                  disabled={!editRequest.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                setNotInterestedReason('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              We'd Love Your Feedback
            </h3>
            <p className="text-gray-600 mb-6">
              Help us improve! Please let us know why this isn't the right fit.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notInterestedReason}
                  onChange={(e) => setNotInterestedReason(e.target.value)}
                  placeholder="Please share your feedback..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowNotInterestedModal(false);
                    setNotInterestedReason('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Not interested reason:', notInterestedReason);
                    alert('Thank you for your feedback!');
                    setShowNotInterestedModal(false);
                    setNotInterestedReason('');
                  }}
                  disabled={!notInterestedReason.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
