/**
 * Image Search Utilities
 *
 * Helper functions for retrieving location-based images from stock photo APIs.
 * These functions can be used directly in your API routes or by Claude Code
 * through MCP servers.
 */

// ============================================================================
// Types
// ============================================================================

export interface ImageSearchParams {
  query: string;
  location?: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
}

export interface StockImage {
  id: string;
  url: string;
  downloadUrl: string;
  photographer: string;
  photographerUrl: string;
  source: 'unsplash' | 'pexels' | 'pixabay';
  width: number;
  height: number;
  alt?: string;
  color?: string;
}

export interface LocationImageSearchParams {
  destination: string;
  category?: 'landmark' | 'food' | 'hotel' | 'activity' | 'people' | 'general';
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

// ============================================================================
// Image Search Functions (Direct API Calls)
// ============================================================================

/**
 * Search Unsplash for images
 * Requires UNSPLASH_ACCESS_KEY in environment
 */
export async function searchUnsplashImages(
  params: ImageSearchParams
): Promise<StockImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY not configured');
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', params.query);
  url.searchParams.set('per_page', String(params.count || 10));

  if (params.orientation) {
    url.searchParams.set('orientation', params.orientation);
  }

  if (params.color) {
    url.searchParams.set('color', params.color);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.regular,
    downloadUrl: photo.urls.full,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    source: 'unsplash' as const,
    width: photo.width,
    height: photo.height,
    alt: photo.alt_description || photo.description,
    color: photo.color,
  }));
}

/**
 * Search Pexels for images
 * Requires PEXELS_API_KEY in environment
 */
export async function searchPexelsImages(
  params: ImageSearchParams
): Promise<StockImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    throw new Error('PEXELS_API_KEY not configured');
  }

  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', params.query);
  url.searchParams.set('per_page', String(params.count || 10));

  if (params.orientation) {
    url.searchParams.set('orientation', params.orientation);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.photos.map((photo: any) => ({
    id: String(photo.id),
    url: photo.src.large,
    downloadUrl: photo.src.original,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    source: 'pexels' as const,
    width: photo.width,
    height: photo.height,
    alt: photo.alt || undefined,
    color: photo.avg_color,
  }));
}

/**
 * Search Pixabay for images
 * Requires PIXABAY_API_KEY in environment
 */
export async function searchPixabayImages(
  params: ImageSearchParams
): Promise<StockImage[]> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    throw new Error('PIXABAY_API_KEY not configured');
  }

  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('q', params.query);
  url.searchParams.set('per_page', String(params.count || 10));
  url.searchParams.set('image_type', 'photo');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.hits.map((photo: any) => ({
    id: String(photo.id),
    url: photo.largeImageURL,
    downloadUrl: photo.largeImageURL,
    photographer: photo.user,
    photographerUrl: `https://pixabay.com/users/${photo.user}-${photo.user_id}/`,
    source: 'pixabay' as const,
    width: photo.imageWidth,
    height: photo.imageHeight,
    alt: photo.tags,
  }));
}

// ============================================================================
// Location-Based Image Search
// ============================================================================

/**
 * Search for location-based images across all configured platforms
 *
 * This function intelligently combines location and category to create
 * effective search queries for travel destinations.
 *
 * @example
 * ```ts
 * const images = await searchLocationImages({
 *   destination: 'Edmonton',
 *   category: 'landmark',
 *   count: 6,
 *   orientation: 'landscape'
 * });
 * ```
 */
export async function searchLocationImages(
  params: LocationImageSearchParams
): Promise<StockImage[]> {
  // Build search query combining destination and category
  const queryParts = [params.destination];

  if (params.category) {
    const categoryKeywords: Record<string, string[]> = {
      landmark: ['landmark', 'architecture', 'monument', 'historic'],
      food: ['food', 'restaurant', 'cuisine', 'dining'],
      hotel: ['hotel', 'accommodation', 'room', 'luxury'],
      activity: ['activity', 'adventure', 'tourism', 'outdoor'],
      people: ['people', 'tourists', 'travelers', 'family'],
      general: ['cityscape', 'aerial', 'downtown', 'skyline'],
    };

    const keywords = categoryKeywords[params.category] || [];
    // Randomly pick one keyword to add variety
    if (keywords.length > 0) {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      queryParts.push(keyword);
    }
  }

  const query = queryParts.join(' ');

  // Try all available platforms
  const results: StockImage[] = [];
  const searchParams: ImageSearchParams = {
    query,
    count: params.count || 6,
    orientation: params.orientation || 'landscape',
  };

  // Try Unsplash first (best quality for travel photos)
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const unsplashImages = await searchUnsplashImages(searchParams);
      results.push(...unsplashImages);
    } catch (error) {
      console.warn('Unsplash search failed:', error);
    }
  }

  // If we need more images, try Pexels
  if (results.length < (params.count || 6) && process.env.PEXELS_API_KEY) {
    try {
      const pexelsImages = await searchPexelsImages({
        ...searchParams,
        count: (params.count || 6) - results.length,
      });
      results.push(...pexelsImages);
    } catch (error) {
      console.warn('Pexels search failed:', error);
    }
  }

  // If we still need more, try Pixabay
  if (results.length < (params.count || 6) && process.env.PIXABAY_API_KEY) {
    try {
      const pixabayImages = await searchPixabayImages({
        ...searchParams,
        count: (params.count || 6) - results.length,
      });
      results.push(...pixabayImages);
    } catch (error) {
      console.warn('Pixabay search failed:', error);
    }
  }

  return results.slice(0, params.count || 6);
}

// ============================================================================
// Trip-Specific Image Search
// ============================================================================

/**
 * Get header images for a trip destination
 *
 * Searches for diverse, high-quality images suitable for a trip header carousel
 */
export async function getHeaderImages(
  destination: string,
  count: number = 6
): Promise<StockImage[]> {
  const categories: LocationImageSearchParams['category'][] = [
    'landmark',
    'general',
    'activity',
    'people',
  ];

  const imagesPerCategory = Math.ceil(count / categories.length);
  const allImages: StockImage[] = [];

  for (const category of categories) {
    try {
      const images = await searchLocationImages({
        destination,
        category,
        count: imagesPerCategory,
        orientation: 'landscape',
      });
      allImages.push(...images);
    } catch (error) {
      console.warn(`Failed to get ${category} images for ${destination}:`, error);
    }

    // Stop if we have enough images
    if (allImages.length >= count) {
      break;
    }
  }

  // Shuffle to mix categories
  const shuffled = allImages.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

/**
 * Get images for a specific activity
 */
export async function getActivityImages(
  activityName: string,
  location: string,
  count: number = 3
): Promise<StockImage[]> {
  const query = `${activityName} ${location}`;

  return searchLocationImages({
    destination: query,
    count,
    orientation: 'landscape',
  });
}

/**
 * Get images for a hotel/accommodation
 */
export async function getHotelImages(
  hotelName: string,
  location: string,
  count: number = 4
): Promise<StockImage[]> {
  // Try specific hotel name first
  try {
    const images = await searchLocationImages({
      destination: `${hotelName} ${location}`,
      category: 'hotel',
      count,
      orientation: 'landscape',
    });

    if (images.length >= count / 2) {
      return images;
    }
  } catch (error) {
    console.warn('Specific hotel search failed, trying generic');
  }

  // Fallback to generic hotel images for the location
  return searchLocationImages({
    destination: location,
    category: 'hotel',
    count,
    orientation: 'landscape',
  });
}

// ============================================================================
// Image Attribution
// ============================================================================

/**
 * Generate proper attribution text for a stock image
 */
export function getImageAttribution(image: StockImage): string {
  switch (image.source) {
    case 'unsplash':
      return `Photo by ${image.photographer} on Unsplash`;
    case 'pexels':
      return `Photo by ${image.photographer} from Pexels`;
    case 'pixabay':
      return `Photo by ${image.photographer} from Pixabay`;
    default:
      return `Photo by ${image.photographer}`;
  }
}

/**
 * Generate attribution HTML with link
 */
export function getImageAttributionHTML(image: StockImage): string {
  return `<a href="${image.photographerUrl}" target="_blank" rel="noopener">${getImageAttribution(image)}</a>`;
}
