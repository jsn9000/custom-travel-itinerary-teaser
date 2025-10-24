'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, CreditCard, Calendar, Shield } from 'lucide-react';

export default function PaymentPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string>('');
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock payment processing - just show alert for now
    alert('Payment processing mockup - This would process the payment in a real application');
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trip Details
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Secure Payment</h1>
                  <p className="text-sm text-slate-500">Complete your booking</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="cardNumber"
                      required
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '');
                        if (value.length <= 16) {
                          setCardNumber(formatCardNumber(value));
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-2">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        id="expiryDate"
                        required
                        value={expiryDate}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            setExpiryDate(formatExpiryDate(value));
                          }
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-slate-700 mb-2">
                      CVV
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        id="cvv"
                        required
                        value={cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            setCvv(value);
                          }
                        }}
                        placeholder="123"
                        maxLength={4}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Complete Payment - ${conciergeFee.toFixed(2)}
                </button>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-xl">
                  <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    Your payment information is encrypted and secure. We never store your credit card details.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white sticky top-8">
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

                  {/* Package Includes */}
                  <div className="space-y-3 pb-4 border-b border-white/30">
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Package Includes</p>

                    {/* Activities */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Activities</div>
                        <div className="text-blue-100 text-sm">
                          {activitiesCount} activities scheduled
                        </div>
                      </div>
                    </div>

                    {/* Flights */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Flights</div>
                        <div className="text-blue-100 text-sm">
                          {flightsCount} {flightsCount === 1 ? 'flight' : 'flights'} booked
                        </div>
                      </div>
                    </div>

                    {/* Accommodations */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Accommodations</div>
                        <div className="text-blue-100 text-sm">
                          {totalNights} {totalNights === 1 ? 'night' : 'nights'}
                        </div>
                      </div>
                    </div>
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
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-lg font-bold">Total Amount</div>
                    <div className="text-3xl font-bold">${conciergeFee.toFixed(2)}</div>
                  </div>

                  {/* What You Get */}
                  <div className="mt-6 pt-6 border-t border-white/30">
                    <p className="text-sm text-blue-100 leading-relaxed">
                      💎 Unlock all package details to begin your journey! Full access to hotel names, flight details, restaurant recommendations, and activity information.
                    </p>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-white/30">
                <p className="text-xs text-blue-100 text-center">
                  100% Secure Payment • SSL Encrypted • Money Back Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
