'use client';

/**
 * Wanderlog Import Page
 * Allows users to import trip data from Wanderlog PDFs using Firecrawl
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Upload, Loader2, Sparkles, FileText } from 'lucide-react';

export default function WanderlogImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Importing PDF:', file.name);

      // Create FormData to send the PDF file
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/wanderlog/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import trip');
      }

      console.log('✅ Trip imported successfully:', data.tripId);

      // Redirect to the trip display page
      router.push(`/trips/${data.tripId}`);
    } catch (err) {
      console.error('❌ Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import trip. Please try again.');
      setIsLoading(false);
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
            Import from Wanderlog PDF
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload or drag & drop your Wanderlog trip PDF and we'll use AI-powered extraction to get all
            locations, activities, images, and itinerary details.
          </p>
        </div>

        {/* Import Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Wanderlog Trip PDF
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : file
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center text-center">
                  {file ? (
                    <>
                      <FileText className="w-12 h-12 text-green-600 mb-3" />
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        disabled={isLoading}
                      >
                        Choose different file
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Drop your Wanderlog PDF here
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        or click to browse
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF files up to 50MB
                      </p>
                    </>
                  )}
                </div>
              </div>
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
                      Importing your trip with Firecrawl...
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      This may take 10-30 seconds while we scrape all the data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting from PDF...
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  Import Trip from PDF
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Powered by Firecrawl AI:
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                <span>Export your Wanderlog trip as a PDF from the website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                <span>Upload or drag & drop the PDF file above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                <span>Firecrawl AI extracts all trip details, locations, images, and descriptions from the PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                <span>View your customized trip with destination-themed styling</span>
              </li>
            </ol>
          </div>
        </div>

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
