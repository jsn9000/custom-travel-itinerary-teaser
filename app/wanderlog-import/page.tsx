'use client';

/**
 * Wanderlog Import Page
 * Allows users to import trip data from Wanderlog URLs using Browserbase scraping
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Loader2, Sparkles, Globe } from 'lucide-react';

interface ImportStats {
  flights: number;
  hotels: number;
  carRentals: number;
  activities: number;
  dailyScheduleDays: number;
  images: {
    total: number;
    associated: number;
    unassociated: number;
  };
}

interface ImportResult {
  tripId: string;
  title: string;
  stats: ImportStats;
}

export default function WanderlogImportPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [forceRescrape, setForceRescrape] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const router = useRouter();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProgress(null);
    setImportResult(null);

    if (!url) {
      setError('Please enter a Wanderlog URL');
      return;
    }

    // Validate URL format
    if (!url.includes('wanderlog.com')) {
      setError('Please enter a valid Wanderlog URL (must contain wanderlog.com)');
      return;
    }

    setIsLoading(true);
    setProgress('Connecting to Wanderlog...');

    try {
      console.log('🚀 Scraping Wanderlog URL:', url);

      const response = await fetch('/api/scrape-wanderlog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, force: forceRescrape }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to scrape trip');
      }

      console.log('✅ Trip scraped successfully:', data.tripId);

      // Show detailed import results
      setImportResult({
        tripId: data.tripId,
        title: data.data?.title || 'Trip',
        stats: data.stats,
      });

      setProgress('✅ Import completed successfully!');
      setIsLoading(false);

    } catch (err) {
      console.error('❌ Scraping error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape trip. Please try again.');
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Import from Wanderlog URL
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your Wanderlog trip URL and we'll automatically scrape all
            locations, activities, images, and itinerary details.
          </p>
        </div>

        {/* Import Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Wanderlog Trip URL
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://wanderlog.com/view/..."
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Example: https://wanderlog.com/view/znjfochocj/trip-to-edmonton
              </p>
            </div>

            {/* Force Re-scrape Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="force-rescrape"
                checked={forceRescrape}
                onChange={(e) => setForceRescrape(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="force-rescrape" className="text-sm text-gray-700">
                Force re-scrape (overwrite existing trip data)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      {progress || 'Scraping your Wanderlog trip...'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      This may take 30-60 seconds while we scrape all the data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scraping Trip...
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  Import Trip from URL
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Powered by Browserbase Scraping:
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                <span>Go to wanderlog.com and open your trip (must be public or shared)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                <span>Copy the URL from your browser's address bar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                <span>Paste the URL above and we'll scrape all trip details, locations, flights, hotels, and images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                <span>View your customized trip teaser with destination-themed styling</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Success Summary */}
        {importResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Import Successful!</h2>
                <p className="text-sm text-gray-600">{importResult.title}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Trip ID</p>
              <code className="text-sm font-mono text-gray-700">{importResult.tripId}</code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Data Summary</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Flights */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Flights</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{importResult.stats.flights}</p>
              </div>

              {/* Hotels */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-purple-900">Hotels</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{importResult.stats.hotels}</p>
              </div>

              {/* Car Rentals */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-4 0v10m-4-5h8" />
                  </svg>
                  <span className="text-sm font-medium text-orange-900">Car Rentals</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{importResult.stats.carRentals}</p>
              </div>

              {/* Activities */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Activities</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{importResult.stats.activities}</p>
              </div>

              {/* Daily Schedule */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-indigo-900">Schedule Days</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{importResult.stats.dailyScheduleDays}</p>
              </div>

              {/* Images */}
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-pink-900">Images</span>
                </div>
                <p className="text-2xl font-bold text-pink-600">{importResult.stats.images.total}</p>
                <p className="text-xs text-pink-700 mt-1">
                  {importResult.stats.images.associated} associated
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setImportResult(null);
                  setUrl('');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                Import Another Trip
              </button>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
