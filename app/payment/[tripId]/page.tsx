'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';

export default function PaymentPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string>('');
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setTripId(resolvedParams.tripId);
    });
  }, [params]);

  useEffect(() => {
    if (!tripId) return;

    const fetchTripData = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}`);
        if (response.ok) {
          const data = await response.json();
          setTripData(data);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripId]);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Send email notification
      const response = await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId,
          tripData,
          conciergeFee: 299.00
        }),
      });

      if (response.ok) {
        alert('Booking request submitted successfully! You will receive a confirmation email shortly.');
        router.push(`/teaser/${tripId}`);
      } else {
        throw new Error('Failed to send booking email');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was an error submitting your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  // Calculate counts
  const activitiesCount = tripData?.dailySchedule?.reduce((total: number, day: any) => {
    return total + (day.activities?.length || 0);
  }, 0) || 0;
  const flightsCount = tripData?.flights?.length || 0;
  const totalNights = tripData?.hotels?.[0]?.nights || 0;

  // Travel Concierge fee
  const conciergeFee = 299.00;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trip Details
        </button>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          {tripData && (
            <div className="space-y-4">
              {/* Trip Title */}
              <div className="pb-4 border-b border-white/30">
                <h3 className="text-xl font-semibold mb-1">{tripData.title}</h3>
                <p className="text-blue-100 text-sm">
                  {tripData.startDate} - {tripData.endDate}
                </p>
              </div>

              {/* Unlock Fee */}
              <div className="flex justify-between items-center pb-4 border-b border-white/30">
                <div>
                  <div className="font-semibold">Travel Concierge Fee</div>
                  <div className="text-blue-100 text-sm">Unlock all package details</div>
                </div>
                <div className="text-xl font-bold">${conciergeFee.toFixed(2)}</div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 pb-6">
                <div className="text-lg font-bold">Total Amount</div>
                <div className="text-3xl font-bold">${conciergeFee.toFixed(2)}</div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-white text-blue-600 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
