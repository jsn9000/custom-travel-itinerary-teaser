'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Download, CheckCircle2, XCircle, Link as LinkIcon, ArrowLeft, Sparkles, Wand2 } from 'lucide-react';

interface ImportResult {
  success: boolean;
  tripId?: string;
  message?: string;
  duration?: string;
  stats?: {
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
  };
  data?: {
    title: string;
    startDate: string;
    endDate: string;
    creator?: string;
  };
  error?: string;
  hint?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [force, setForce] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceSuccess, setEnhanceSuccess] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      setResult({
        success: false,
        error: 'Please enter a Wanderlog URL',
      });
      return;
    }

    if (!url.includes('wanderlog.com')) {
      setResult({
        success: false,
        error: 'Invalid URL. Must be a wanderlog.com URL',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const queryParams = new URLSearchParams({
        url: url.trim(),
        ...(force && { force: 'true' }),
      });

      const response = await fetch(`/api/scrape?${queryParams}`);
      const data = await response.json();

      setResult(data);

      // Clear URL on success
      if (data.success) {
        setUrl('');
        setForce(false);
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to connect to server',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleImport();
    }
  };

  const handleEnhance = async (tripId: string) => {
    setEnhancing(true);
    setEnhanceSuccess(false);

    try {
      const response = await fetch(`/api/trips/${tripId}/enhance`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setEnhanceSuccess(true);
        // Update result to show enhancement was successful
        if (result) {
          setResult({
            ...result,
            message: result.message + ' ✨ Descriptions enhanced!',
          });
        }
      } else {
        alert(`Enhancement failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">
            Import Wanderlog Trip
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Paste a Wanderlog URL to import trip details, flights, hotels, activities, and images
          </p>
        </div>

        {/* Import Card */}
        <Card className="p-8 mb-6 shadow-lg">
          <div className="space-y-4">
            {/* URL Input */}
            <div>
              <label
                htmlFor="wanderlog-url"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Wanderlog URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="wanderlog-url"
                    type="text"
                    placeholder="https://wanderlog.com/view/abc123/trip-name"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Example: https://wanderlog.com/view/znjfochocj/trip-to-edmonton
              </p>
            </div>

            {/* Force Re-scrape Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="force-rescrape"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label
                htmlFor="force-rescrape"
                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Force re-import (override if trip already exists)
              </label>
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={loading || !url.trim()}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Importing... This may take 30-60 seconds
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Import Trip
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Result Display */}
        {result && (
          <Card
            className={`p-6 shadow-lg ${
              result.success
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    result.success
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}
                >
                  {result.success ? 'Import Successful!' : 'Import Failed'}
                </h3>

                <p
                  className={`mb-4 ${
                    result.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}
                >
                  {result.message || result.error}
                </p>

                {result.hint && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 italic">
                    💡 {result.hint}
                  </p>
                )}

                {/* Trip Details */}
                {result.success && result.data && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      {result.data.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {result.data.creator && (
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Creator:</span>
                          <span className="ml-2 text-slate-900 dark:text-white">
                            {result.data.creator}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Dates:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          {result.data.startDate} - {result.data.endDate}
                        </span>
                      </div>
                      {result.tripId && (
                        <div className="col-span-2">
                          <span className="text-slate-600 dark:text-slate-400">Trip ID:</span>
                          <span className="ml-2 text-slate-900 dark:text-white font-mono text-xs">
                            {result.tripId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                {result.stats && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Import Statistics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-2">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {result.stats.flights}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">Flights</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-2">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {result.stats.hotels}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">Hotels</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-2">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {result.stats.activities}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">Activities</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-2">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {result.stats.carRentals}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">Car Rentals</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-2">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                          {result.stats.dailyScheduleDays}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">Days</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-2">
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                          {result.stats.images.total}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">Images</div>
                      </div>
                    </div>

                    {result.stats.images && (
                      <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                        📸 {result.stats.images.associated} images associated with activities,{' '}
                        {result.stats.images.unassociated} unassociated
                      </div>
                    )}

                    {result.duration && (
                      <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                        ⏱️ Completed in {result.duration}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {result.success && result.tripId && (
                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={() => handleEnhance(result.tripId!)}
                      disabled={enhancing || enhanceSuccess}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50"
                      size="lg"
                    >
                      {enhancing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Enhancing descriptions... (30-60s)
                        </>
                      ) : enhanceSuccess ? (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Descriptions Enhanced!
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-5 w-5" />
                          Enhance Descriptions
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                      {enhanceSuccess
                        ? '✨ Activity descriptions enhanced with AI'
                        : '🎨 Make activity descriptions more enticing with AI'}
                    </p>

                    <Button
                      onClick={() => router.push(`/teaser/${result.tripId}`)}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Create Teaser Page
                    </Button>
                    <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                      Generate a beautiful, paywalled teaser page for this trip
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ What gets imported?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Trip title, dates, and creator information</li>
            <li>Flight details with prices and times</li>
            <li>Hotel options with ratings and amenities</li>
            <li>Car rental information</li>
            <li>All activities with descriptions and hours</li>
            <li>Day-by-day itinerary</li>
            <li>Images associated with activities and locations</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
