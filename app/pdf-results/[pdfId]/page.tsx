'use client';

/**
 * PDF Results Page
 * Displays extracted content from processed PDF files
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  Image, 
  MapPin, 
  Calendar, 
  Loader2, 
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import type { PDFFile, PDFTextContent, PDFImage, PDFTripInfo } from '@/types/supabase';

interface PDFResultsData {
  pdfFile: PDFFile;
  textContent: PDFTextContent[];
  images: PDFImage[];
  tripInfo: PDFTripInfo | null;
}

export default function PDFResultsPage() {
  const params = useParams();
  const pdfId = params.pdfId as string;
  
  const [data, setData] = useState<PDFResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfId) return;

    const fetchPDFData = async () => {
      try {
        const response = await fetch(`/api/pdf-results/${pdfId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch PDF data');
        }

        setData(result.data);
      } catch (err) {
        console.error('Error fetching PDF data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF data');
      } finally {
        setLoading(false);
      }
    };

    fetchPDFData();
  }, [pdfId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading PDF results...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">
                  {error || 'Failed to load PDF data'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { pdfFile, textContent, images, tripInfo } = data;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-full p-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PDF Processing Results
          </h1>
          <p className="text-lg text-gray-600">
            {pdfFile.file_name}
          </p>
        </div>

        {/* Processing Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                pdfFile.status === 'processed' ? 'bg-green-500' :
                pdfFile.status === 'processing' ? 'bg-yellow-500' :
                pdfFile.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="font-semibold text-gray-900 capitalize">
                Status: {pdfFile.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {(pdfFile.file_size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          
          {pdfFile.status === 'error' && pdfFile.processing_error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{pdfFile.processing_error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Information */}
          {tripInfo && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Trip Information
                </h2>
                
                {tripInfo.trip_title && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-1">Title</h3>
                    <p className="text-gray-600">{tripInfo.trip_title}</p>
                  </div>
                )}
                
                {tripInfo.destination && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-1">Destination</h3>
                    <p className="text-gray-600">{tripInfo.destination}</p>
                  </div>
                )}
                
                {tripInfo.trip_dates && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Dates
                    </h3>
                    <p className="text-gray-600">{tripInfo.trip_dates}</p>
                  </div>
                )}
                
                {tripInfo.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                    <p className="text-gray-600 text-sm">{tripInfo.description}</p>
                  </div>
                )}
                
                {tripInfo.locations && Array.isArray(tripInfo.locations) && tripInfo.locations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Locations</h3>
                    <div className="space-y-1">
                      {tripInfo.locations.slice(0, 5).map((location: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {location.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Debug Info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>Images found: {images.length}</p>
                <p>Text pages: {textContent.length}</p>
                <p>Trip info: {tripInfo ? 'Yes' : 'No'}</p>
                {images.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Image details:</p>
                    {images.slice(0, 3).map((img, idx) => (
                      <p key={idx} className="ml-2">
                        {idx + 1}. Page {img.page_number}, Index {img.image_index}, 
                        Format: {img.image_format}, Size: {img.width}x{img.height}, 
                        Data length: {img.image_data?.length || 0}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Images */}
            {images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  Extracted Images ({images.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.slice(0, 6).map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={`data:image/${image.image_format};base64,${image.image_data}`}
                        alt={`Page ${image.page_number} Image ${image.image_index}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', image.id)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        Page {image.page_number}
                      </div>
                    </div>
                  ))}
                </div>
                {images.length > 6 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 6 images of {images.length} total
                  </p>
                )}
              </div>
            )}

            {/* No Images Message */}
            {images.length === 0 && (
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <Image className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      No images found in this PDF
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      The PDF may not contain extractable images, or they may be embedded in a way that's not accessible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Text */}
            {textContent.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Extracted Text ({textContent.length} pages)
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {textContent.slice(0, 5).map((content) => (
                    <div key={content.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Page {content.page_number}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          content.extraction_method === 'ocr' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {content.extraction_method.toUpperCase()}
                        </span>
                        {content.confidence_score && (
                          <span className="text-xs text-gray-500">
                            {Math.round(content.confidence_score * 100)}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {content.text_content.substring(0, 300)}
                        {content.text_content.length > 300 && '...'}
                      </p>
                    </div>
                  ))}
                </div>
                {textContent.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 5 pages of {textContent.length} total
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <a
            href="/wanderlog-import"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 transition-colors"
          >
            ← Process Another PDF
          </a>
        </div>
      </div>
    </main>
  );
}
