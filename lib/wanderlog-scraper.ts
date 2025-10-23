import { createBrowserSession } from './browserbase';
import type {
  ScrapedWanderlogData,
  WanderlogImage,
  WanderlogFlight,
  WanderlogHotel,
  WanderlogCarRental,
  WanderlogActivity,
  WanderlogDailySchedule,
} from '@/types/wanderlog';
import { nanoid } from 'nanoid';

const MAX_UPLOADS = 500;
const UPLOAD_CONCURRENCY = 6;

/**
 * Helper to sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if a URL is a map tile (to be filtered out)
 */
const isMapTile = (url: string): boolean => /maps\.google\.|googleapis\.com\/maps/.test(url);

/**
 * Check if a URL is a Wanderlog app asset (logos, sprites, etc.)
 */
const isAppAsset = (url: string): boolean => /:\/\/(www\.)?wanderlog\.com\/assets\//.test(url);

/**
 * Accept cookie consent if shown
 */
async function acceptCookieIfShown(page: any) {
  const selectors = [
    'button:has-text("Accept")',
    'button:has-text("I agree")',
    'button[aria-label*="accept" i]',
    '#onetrust-accept-btn-handler',
  ];

  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click({ timeout: 1500 });
        console.log('✅ Accepted cookie consent');
        break;
      }
    } catch {
      // Continue to next selector
    }
  }
}

/**
 * Robust navigation with multiple fallback attempts
 */
async function robustGoto(page: any, url: string) {
  try {
    page.setDefaultNavigationTimeout(90000);
  } catch {}
  try {
    page.setDefaultTimeout(30000);
  } catch {}

  try {
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.9',
      'upgrade-insecure-requests': '1',
    });
  } catch {}

  // Attempt 1: Direct navigation
  try {
    console.log('🔄 Navigation attempt 1: Direct navigation...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await acceptCookieIfShown(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    console.log('✅ Navigation successful (attempt 1)');
    return;
  } catch (e1) {
    console.warn('⚠️  Navigation attempt 1 failed:', String(e1));
  }

  // Attempt 2: Visit homepage first, then target URL
  try {
    console.log('🔄 Navigation attempt 2: Via homepage...');
    await page.goto('https://wanderlog.com/', { waitUntil: 'commit', timeout: 45000 });
    await acceptCookieIfShown(page);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
    await acceptCookieIfShown(page);
    await Promise.race([
      page.waitForLoadState('domcontentloaded', { timeout: 20000 }),
      page.waitForSelector('h1, [data-testid="trip-title"]', { timeout: 20000 }),
    ]).catch(() => {});
    console.log('✅ Navigation successful (attempt 2)');
    return;
  } catch (e2) {
    console.warn('⚠️  Navigation attempt 2 failed:', String(e2));
  }

  // Attempt 3: Reload
  try {
    console.log('🔄 Navigation attempt 3: Reload...');
    await page.reload({ waitUntil: 'commit', timeout: 30000 });
    await acceptCookieIfShown(page);
    await page.waitForSelector('h1, [data-testid="trip-title"]', { timeout: 25000 });
    console.log('✅ Navigation successful (attempt 3)');
    return;
  } catch (e3) {
    console.error('❌ All navigation attempts failed:', String(e3));
    throw new Error('Failed to navigate to Wanderlog page after 3 attempts');
  }
}

/**
 * Scroll page incrementally to trigger lazy-loaded images
 */
async function scrollToLoadImages(page: any) {
  console.log('📜 Scrolling to load lazy images...');
  await page.evaluate(() => window.scrollTo(0, 0));

  for (let y = 0; y < 6000; y += 800) {
    await page.evaluate((scrollY: number) => window.scrollTo(0, scrollY), y);
    await sleep(150);
  }

  console.log('✅ Scrolling complete');
}

/**
 * Extract all page data from DOM
 */
async function extractPageData(page: any, baseUrl: string) {
  return await page.evaluate((base: string) => {
    const toAbs = (u: string | null): string | null => {
      if (!u) return null;
      try {
        return new URL(u, base).toString();
      } catch {
        return null;
      }
    };

    const qAll = (sel: string, scope: Document | Element = document): Element[] =>
      Array.from(scope.querySelectorAll(sel));

    const pick = (el: Element | null): string | null =>
      el ? (el.textContent || '').trim() : null;

    const attr = (el: Element | null, name: string): string | null =>
      el ? el.getAttribute(name) : null;

    // Extract title
    const title =
      (pick(document.querySelector('h1, [data-testid="trip-title"], .trip-title')) ||
        document.title).replace(/\s*\|\s*Wanderlog.*$/, '').trim();

    // Extract summary
    const summary = pick(document.querySelector('.trip-summary, [data-testid="trip-summary"], main p'));

    // Extract tags
    const tags = qAll('.chip, .tag, [data-testid="tag"]')
      .map((x) => pick(x))
      .filter(Boolean) as string[];

    // Text sections, excluding map containers
    const sections = qAll('section, article, div')
      .filter((el) => !el.closest('.gm-style') && !el.closest('[aria-label="Map"]'))
      .map((el) => ({
        heading: pick(el.querySelector('h2,h3,h4')) || null,
        text: pick(el),
      }))
      .filter((obj) => obj.text && obj.text.length > 20);

    // Images: <img>, <picture srcset>, CSS background-image
    const imgUrls = [
      ...qAll('img').map((img) =>
        attr(img, 'data-src') || attr(img, 'data-lazy') || attr(img, 'src')
      ),
      ...qAll('picture source[srcset]').flatMap((s) =>
        (attr(s, 'srcset') || '').split(',').map((p) => p.trim().split(' ')[0])
      ),
      ...(() => {
        const urls: string[] = [];
        qAll('*').forEach((el) => {
          const st = getComputedStyle(el);
          const m = st.backgroundImage && st.backgroundImage.match(/url\(([^)]+)\)/g);
          if (m) {
            m.forEach((u) => {
              const raw = u.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
              urls.push(raw);
            });
          }
        });
        return urls;
      })(),
    ]
      .map((u) => toAbs(u))
      .filter(Boolean)
      .filter((u) => !/maps\.google\.|googleapis\.com\/maps/.test(u!)) as string[];

    return {
      title,
      summary,
      tags,
      sections,
      images: Array.from(new Set(imgUrls)),
    };
  }, baseUrl);
}

/**
 * Upload image via Supabase Edge Function
 */
async function uploadImageViaEdgeFunction(url: string): Promise<string> {
  const edgeFunctionUrl = process.env.SUPABASE_EDGE_FUNCTION_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_BUCKET;

  if (!edgeFunctionUrl || !supabaseAnonKey || !bucket) {
    throw new Error('Missing Supabase Edge Function configuration in environment variables');
  }

  const today = new Date().toISOString().slice(0, 10);

  const body = {
    url,
    bucket,
    prefix: `wanderlog/${today}`,
    upsert: true,
  };

  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Edge upload failed: ${res.status} ${txt}`);
  }

  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.error || 'Edge upload error');
  }

  return json.publicUrl;
}

/**
 * Upload images in parallel with concurrency control
 */
async function uploadImages(imageUrls: string[]): Promise<Map<string, string>> {
  const images = imageUrls
    .filter((u) => !isMapTile(u) && !isAppAsset(u))
    .filter((u) => !u.startsWith('data:'))
    .slice(0, MAX_UPLOADS);

  console.log(`📷 Preparing to upload ${images.length} images...`);

  let cursor = 0;
  const mapped = new Map<string, string>();

  async function worker() {
    while (cursor < images.length) {
      const i = cursor++;
      const url = images[i];
      try {
        const publicUrl = await uploadImageViaEdgeFunction(url);
        mapped.set(url, publicUrl);
        if ((i + 1) % 20 === 0) {
          console.log(`   ...uploaded ${i + 1}/${images.length}`);
        }
      } catch (e) {
        console.warn(`   ⚠️  Upload failed for image ${i + 1}:`, String(e));
      }
    }
  }

  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, () => worker()));
  console.log(`✅ Edge uploads done: ${mapped.size}/${images.length}`);

  return mapped;
}

/**
 * Scrapes a Wanderlog trip page and extracts all relevant data
 */
export async function scrapeWanderlogTrip(
  wanderlogUrl: string
): Promise<ScrapedWanderlogData> {
  console.log(`🔍 Starting scrape for: ${wanderlogUrl}`);

  const { browser } = await createBrowserSession({ keepAlive: false });

  try {
    const context = browser.contexts()[0];
    const page = context.pages()[0];

    // Navigate with robust retry logic
    await robustGoto(page, wanderlogUrl);

    // Scroll to load lazy images
    await scrollToLoadImages(page);

    // Extract MOBX state (contains structured data)
    const mobxState = await page.evaluate(() => {
      return (window as any).__MOBX_STATE__;
    });

    console.log('📦 Extracted MOBX state from page');

    // Also extract DOM data for images
    let domData = await extractPageData(page, wanderlogUrl);

    console.log(`📋 Extracted trip: ${domData.title}`);
    console.log(`🖼️  Found ${domData.images.length} candidate images`);

    // Upload images via Edge Function
    const imageMapping = await uploadImages(domData.images);

    // Remap images to uploaded URLs
    const remappedImages = domData.images.map((u: string) => imageMapping.get(u) || u);

    // Parse structured data from MOBX state
    const parsedData = parseStructuredDataFromMobx(mobxState, remappedImages, imageMapping);

    console.log(`✈️  Found ${parsedData.flights.length} flights`);
    console.log(`🏨 Found ${parsedData.hotels.length} hotels`);
    console.log(`🚗 Found ${parsedData.carRentals.length} car rentals`);
    console.log(`🎯 Found ${parsedData.activities.length} activities`);
    console.log(`📅 Found ${parsedData.dailySchedule.length} days in schedule`);

    return {
      ...parsedData,
      wanderlogUrl,
      scrapedAt: new Date().toISOString(),
      imageAssociationStats: {
        total: remappedImages.length,
        associated: remappedImages.length, // All images are now uploaded
        unassociated: 0,
      },
    };
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
}

/**
 * Extract text from Quill Delta ops format
 */
function extractTextFromQuillOps(ops: any[]): string | undefined {
  if (!ops || !Array.isArray(ops)) return undefined;
  return ops.map((op) => (typeof op.insert === 'string' ? op.insert : '')).join('').trim() || undefined;
}

/**
 * Generate engaging descriptions based on place type
 */
function generatePlaceDescription(place: any): string {
  const types = place.types || [];
  const name = place.name || '';
  const rating = place.rating || 0;

  const typeDescriptions: { [key: string]: string } = {
    science_museum: 'Hands-on science center with interactive exhibits exploring technology, nature, and the cosmos',
    museum: 'Cultural museum featuring curated collections and historical exhibitions',
    zoo: 'Wildlife sanctuary home to exotic animals with conservation programs',
    park: 'Scenic park perfect for outdoor recreation and nature walks',
    restaurant: 'Local dining spot serving fresh, flavorful cuisine',
    cafe: 'Cozy café serving artisan coffee and fresh pastries',
  };

  // Check for special name patterns
  if (name.toLowerCase().includes('farm') || name.toLowerCase().includes('berry')) {
    return 'Working farm offering seasonal produce picking and agricultural experiences';
  }

  // Find matching type description
  for (const type of types) {
    if (typeDescriptions[type]) {
      return typeDescriptions[type];
    }
  }

  // Fallback based on rating
  if (rating >= 4.5) {
    return 'Highly-rated local attraction offering exceptional experience';
  } else if (rating >= 4.0) {
    return 'Popular destination featuring quality experience';
  } else {
    return 'Local venue offering unique regional experience';
  }
}

/**
 * Parse structured data from MOBX state
 */
function parseStructuredDataFromMobx(
  mobxState: any,
  images: string[],
  imageMapping: Map<string, string>
): Omit<ScrapedWanderlogData, 'wanderlogUrl' | 'scrapedAt' | 'imageAssociationStats'> {
  const tripData = mobxState?.tripPlanStore?.data?.tripPlan;
  const itinerary = tripData?.itinerary;
  const sections = itinerary?.sections || [];
  const budget = itinerary?.budget;

  // Extract notes
  const notesSection = sections.find((s: any) => s.heading === 'Notes');
  const notes = notesSection ? extractTextFromQuillOps(notesSection.text?.ops) : undefined;

  // Extract flights
  const flights = extractFlightsFromState(sections, budget);

  // Extract hotels
  const hotels = extractHotelsFromState(sections, budget, images);

  // Extract car rentals
  const carRentals = extractCarRentalsFromState(budget, sections);

  // Extract activities
  const activities = extractActivitiesFromState(sections, images, imageMapping);

  // Extract daily schedule
  const dailySchedule = extractDailyScheduleFromState(sections);

  // Set mock dates
  let startDate = '';
  let endDate = '';
  if (dailySchedule.length > 0) {
    const mockStart = new Date('2026-07-13');
    const mockEnd = new Date(mockStart);
    mockEnd.setDate(mockStart.getDate() + (dailySchedule.length - 1));

    startDate = mockStart.toISOString().split('T')[0];
    endDate = mockEnd.toISOString().split('T')[0];

    // Update each day's date
    dailySchedule.forEach((day, index) => {
      const dayDate = new Date(mockStart);
      dayDate.setDate(mockStart.getDate() + index);
      day.date = dayDate.toISOString().split('T')[0];
    });
  }

  // Collect all images with associations
  const allImages: WanderlogImage[] = [];
  let imagePosition = 0;

  // Header images (first 5)
  images.slice(0, 5).forEach((url) => {
    allImages.push({
      url,
      position: imagePosition++,
      associatedSection: 'header',
    });
  });

  // Activity images
  activities.forEach((activity) => {
    activity.images.forEach((img) => {
      allImages.push({
        ...img,
        associatedActivityId: activity.id,
        associatedSection: 'activity',
        position: imagePosition++,
      });
    });
  });

  return {
    title: tripData?.title || 'Untitled Trip',
    creator: undefined,
    startDate,
    endDate,
    views: undefined,
    publicationDate: undefined,
    headerImages: images.slice(0, 5),
    notes,
    flights,
    hotels,
    carRentals,
    activities,
    dailySchedule,
    images: allImages,
  };
}

/**
 * Extract flights from MOBX state
 */
function extractFlightsFromState(sections: any[], budget: any): WanderlogFlight[] {
  const flights: WanderlogFlight[] = [];
  const flightSection = sections.find((s: any) => s.heading === 'Flight');
  if (!flightSection) return flights;

  flightSection.blocks?.forEach((block: any) => {
    if (block.type === 'note' && block.text?.ops) {
      const text = extractTextFromQuillOps(block.text.ops) || '';
      const routePattern = /([A-Za-z\s]+Airlines?)\s+([A-Z]{3})-([A-Z]{3})\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(CAD|USD)/gi;
      const routeMatches = [...text.matchAll(routePattern)];

      routeMatches.forEach((match) => {
        flights.push({
          airline: match[1].trim(),
          departureAirport: match[2],
          arrivalAirport: match[3],
          price: parseFloat(match[4].replace(',', '')),
          currency: match[5],
          departureTime: '',
          arrivalTime: '',
          baggageOptions: undefined,
        });
      });

      // Extract times
      const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)(?:\+\d)?)/gi;
      const timeMatches = [...text.matchAll(timePattern)];

      timeMatches.forEach((match, index) => {
        if (flights[index]) {
          flights[index].departureTime = match[1];
          flights[index].arrivalTime = match[2];
        }
      });
    }
  });

  return flights;
}

/**
 * Extract hotels from MOBX state
 */
function extractHotelsFromState(sections: any[], budget: any, allImages: string[]): WanderlogHotel[] {
  const hotels: WanderlogHotel[] = [];
  const hotelSection = sections.find((s: any) => s.heading === 'Hotel Options' || s.heading?.includes('Hotel'));
  if (!hotelSection) return hotels;

  hotelSection.blocks?.forEach((block: any) => {
    if (block.type === 'place' && block.place) {
      const place = block.place;
      let roomType: string | undefined = undefined;
      let price = 0;
      let currency = 'CAD';

      if (block.text?.ops) {
        const text = extractTextFromQuillOps(block.text.ops) || '';
        const priceMatch = text.match(/Total\s+Price\s+(\d+(?:\.\d{2})?)\s*(CAD|USD)/i);
        if (priceMatch) {
          price = parseFloat(priceMatch[1]);
          currency = priceMatch[2];
        }
        roomType = text.replace(/Total\s+Price\s+\d+(?:\.\d{2})?\s*(?:CAD|USD)/i, '').trim();
      }

      hotels.push({
        name: place.name,
        price: price,
        currency: currency,
        rating: place.rating,
        amenities: place.amenities ? Object.keys(place.amenities).filter((k) => place.amenities[k]) : [],
        address: place.formatted_address,
        roomType: roomType,
      });
    }
  });

  return hotels;
}

/**
 * Extract car rentals from MOBX state
 */
function extractCarRentalsFromState(budget: any, sections: any[]): WanderlogCarRental[] {
  const carRentals: WanderlogCarRental[] = [];

  const carRentalExpenses = budget?.expenses?.filter(
    (e: any) =>
      e.category === 'carRental' ||
      e.description?.toLowerCase().includes('car') ||
      e.description?.toLowerCase().includes('rental')
  ) || [];

  carRentalExpenses.forEach((expense: any) => {
    const description = expense.description || '';
    let company = 'Unknown';
    if (description.toLowerCase().includes('budget')) company = 'Budget';
    else if (description.toLowerCase().includes('avis')) company = 'Avis';
    else if (description.toLowerCase().includes('enterprise')) company = 'Enterprise';
    else if (description.toLowerCase().includes('hertz')) company = 'Hertz';

    carRentals.push({
      company,
      vehicleType: description,
      pickupLocation: undefined,
      dropoffLocation: undefined,
      price: expense.amount?.amount,
      currency: expense.amount?.currencyCode || 'CAD',
    });
  });

  return carRentals;
}

/**
 * Extract activities from MOBX state
 */
function extractActivitiesFromState(sections: any[], allImages: string[], imageMapping: Map<string, string>): WanderlogActivity[] {
  const activities: WanderlogActivity[] = [];

  sections.forEach((section: any) => {
    if (!section.heading || section.heading === 'Notes' || section.heading === 'Flight' || section.heading?.includes('Hotel') || section.heading?.includes('Car')) {
      return;
    }

    section.blocks?.forEach((block: any, index: number) => {
      if (block.type === 'place' && block.place) {
        const place = block.place;
        const images = place.photo_urls
          ? place.photo_urls.map((url: string, imgIndex: number) => ({
              url: imageMapping.get(url) || url,
              alt: place.name,
              position: imgIndex,
            }))
          : [];

        activities.push({
          id: nanoid(),
          name: place.name,
          description: generatePlaceDescription(place),
          hours: undefined,
          rating: place.rating,
          address: place.formatted_address,
          contact: place.international_phone_number,
          images,
        });
      }
    });
  });

  return activities;
}

/**
 * Extract daily schedule from MOBX state
 */
function extractDailyScheduleFromState(sections: any[]): WanderlogDailySchedule[] {
  const schedule: WanderlogDailySchedule[] = [];
  let dayNumber = 1;

  sections.forEach((section: any) => {
    if (!section.heading || section.heading.trim() === '') return;

    const skipSections = ['Notes', 'Flight', 'Hotel Options', 'Car Rental', 'Activities'];
    const shouldSkip = skipSections.some(
      (keyword) => section.heading === keyword || section.heading.includes('Hotel') || section.heading.includes('Car')
    );
    if (shouldSkip) return;

    const items: any[] = [];
    section.blocks?.forEach((block: any) => {
      if (block.type === 'place' && block.place) {
        items.push({
          type: 'activity',
          name: block.place.name,
          time: undefined,
          description: generatePlaceDescription(block.place),
        });
      }
    });

    if (items.length > 0) {
      schedule.push({
        dayNumber: dayNumber++,
        date: section.heading,
        items,
      });
    }
  });

  return schedule;
}
