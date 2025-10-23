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

/**
 * Scrapes a Wanderlog trip page and extracts all relevant data
 * including images associated with their activities/sections
 */
export async function scrapeWanderlogTrip(
  wanderlogUrl: string
): Promise<ScrapedWanderlogData> {
  console.log(`🔍 Starting scrape for: ${wanderlogUrl}`);

  const { browser } = await createBrowserSession({ keepAlive: false });

  try {
    const context = browser.contexts()[0];
    const page = context.pages()[0];

    // Navigate to the Wanderlog page
    // Use 'domcontentloaded' instead of 'networkidle' for faster loading
    await page.goto(wanderlogUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    console.log('✅ Page loaded');

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);

    // Wait for main content to load
    await page.waitForSelector('h1, [class*="title"]', { timeout: 30000 });

    // Extract the MOBX state from the page (contains all data in JSON format)
    const mobxState = await page.evaluate(() => {
      return (window as any).__MOBX_STATE__;
    });

    console.log('📦 Extracted MOBX state from page');

    // Save MOBX state to file for debugging
    const fs = require('fs');
    const mobxDebugPath = './debug-mobx-state.json';
    fs.writeFileSync(mobxDebugPath, JSON.stringify(mobxState, null, 2));
    console.log(`💾 Saved MOBX state to: ${mobxDebugPath}`);

    // Extract data from MOBX state
    const tripData = mobxState?.tripPlanStore?.data?.tripPlan;
    const itinerary = tripData?.itinerary;
    const sections = itinerary?.sections || [];
    const budget = itinerary?.budget;

    // Debug: Log budget expenses to understand car rental structure
    console.log('💰 Budget expenses:', JSON.stringify(budget?.expenses, null, 2));

    // Debug: Check if car rentals are in sections instead of budget
    const carRentalSection = sections.find((s: any) =>
      s.heading?.toLowerCase().includes('car') ||
      s.heading?.toLowerCase().includes('rental') ||
      s.heading?.toLowerCase().includes('transportation')
    );
    if (carRentalSection) {
      console.log('🚙 Found car rental section:', JSON.stringify(carRentalSection, null, 2));
    }

    // Extract trip metadata from state
    const tripMetadata = {
      title: await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || 'Untitled Trip'),
      creator: undefined,
      startDate: '',
      endDate: '',
      views: undefined,
      publicationDate: undefined,
      wanderlogUrl,
    };
    console.log(`📋 Extracted trip: ${tripMetadata.title}`);

    // Extract header images from page
    const headerImages = await extractHeaderImages(page);
    console.log(`🖼️  Found ${headerImages.length} header images`);
    if (headerImages.length > 0) {
      console.log('🖼️  Header images:', headerImages);
    }

    // Extract notes section from MOBX state
    const notesSection = sections.find((s: any) => s.heading === 'Notes');
    const notes = notesSection ? extractTextFromQuillOps(notesSection.text?.ops) : undefined;
    if (notes) {
      console.log('📝 Notes:', notes);
    }

    // Extract flights from budget expenses and Flight section
    const flights = extractFlightsFromState(sections, budget);
    console.log(`✈️  Found ${flights.length} flights`);
    if (flights.length > 0) {
      console.log('✈️  Flights:', JSON.stringify(flights, null, 2));
    }

    // Extract hotels from budget expenses and Hotel Options section
    const hotels = extractHotelsFromState(sections, budget);
    console.log(`🏨 Found ${hotels.length} hotels`);
    if (hotels.length > 0) {
      console.log('🏨 Hotels:', JSON.stringify(hotels, null, 2));
    }

    // Extract car rentals from budget expenses and sections
    const carRentals = extractCarRentalsFromState(budget, sections);
    console.log(`🚗 Found ${carRentals.length} car rentals`);
    if (carRentals.length > 0) {
      console.log('🚗 Car rentals:', JSON.stringify(carRentals, null, 2));
    }

    // Extract activities from sections
    const activities = extractActivitiesFromState(sections);
    console.log(`🎯 Found ${activities.length} activities`);
    if (activities.length > 0) {
      console.log('🎯 Activities:', JSON.stringify(activities, null, 2));
    }

    // Extract daily schedule from sections
    const dailySchedule = extractDailyScheduleFromState(sections);
    console.log(`📅 Found ${dailySchedule.length} days in schedule`);
    if (dailySchedule.length > 0) {
      console.log('📅 Daily schedule:', JSON.stringify(dailySchedule, null, 2));

      // Use mock dates: July 13-19, 2026
      // Assign dates based on day count
      if (dailySchedule.length > 0) {
        const startDate = new Date('2026-07-13');
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (dailySchedule.length - 1));

        tripMetadata.startDate = startDate.toISOString().split('T')[0];
        tripMetadata.endDate = endDate.toISOString().split('T')[0];
        console.log(`📅 Mock trip dates (${dailySchedule.length} days): ${tripMetadata.startDate} - ${tripMetadata.endDate}`);

        // Also update each day's date to match
        dailySchedule.forEach((day, index) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + index);
          day.date = dayDate.toISOString().split('T')[0]; // Store as ISO date
        });
      }
    }

    // Collect all images with associations
    const allImages: WanderlogImage[] = [];
    let imagePosition = 0;

    // Header images
    headerImages.forEach((url) => {
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

    // Hotel images (extract from hotel section)
    const hotelSection = sections.find((s: any) => s.heading === 'Hotel Options' || s.heading?.includes('Hotel'));
    if (hotelSection) {
      hotelSection.blocks?.forEach((block: any) => {
        if (block.type === 'place' && block.place && block.place.photo_urls) {
          block.place.photo_urls.forEach((url: string, imgIndex: number) => {
            allImages.push({
              url,
              alt: block.place.name,
              caption: block.place.name,
              position: imagePosition++,
              associatedSection: 'hotel',
            });
          });
        }
      });
    }

    // Calculate image association stats
    const imageStats = {
      total: allImages.length,
      associated: allImages.filter(
        (img) => img.associatedActivityId || img.associatedSection === 'header'
      ).length,
      unassociated: allImages.filter(
        (img) => !img.associatedActivityId && img.associatedSection !== 'header'
      ).length,
    };

    console.log(
      `📊 Image stats: ${imageStats.associated}/${imageStats.total} associated`
    );

    return {
      ...tripMetadata,
      headerImages: headerImages,
      notes,
      flights,
      hotels,
      carRentals,
      activities,
      dailySchedule,
      images: allImages,
      scrapedAt: new Date().toISOString(),
      imageAssociationStats: imageStats,
    };
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
}

/**
 * Expand all collapsible sections on the page
 */
async function expandAllSections(page: any) {
  console.log('🔓 Expanding all sections...');

  // Common selectors for expandable sections
  const selectors = [
    'button[aria-expanded="false"]',
    '[class*="expand"]',
    '[class*="collapse"]',
    '[class*="accordion"]',
    'summary', // HTML details/summary elements
  ];

  for (const selector of selectors) {
    try {
      const elements = await page.$$(selector);
      for (const element of elements) {
        try {
          await element.click({ timeout: 1000 });
          await page.waitForTimeout(500); // Wait for animation
        } catch {
          // Element might not be clickable, continue
        }
      }
    } catch {
      // Selector not found, continue
    }
  }

  console.log('✅ Sections expanded');
}

/**
 * Extract trip metadata (title, dates, creator, etc.)
 */
async function extractTripMetadata(page: any, wanderlogUrl: string) {
  return await page.evaluate((url: string) => {
    // Extract title
    const title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('[class*="title"]')?.textContent?.trim() ||
      'Untitled Trip';

    // Extract creator info
    const creator =
      document.querySelector('[class*="creator"]')?.textContent?.trim() ||
      document.querySelector('[class*="author"]')?.textContent?.trim();

    // Try to extract dates from various possible locations
    let startDate = '';
    let endDate = '';
    const dateText = document.body.textContent || '';
    const dateMatch = dateText.match(
      /(\w+\s+\d+\/\d+)\s*[-–]\s*(\w+\s+\d+\/\d+)/
    );
    if (dateMatch) {
      startDate = dateMatch[1];
      endDate = dateMatch[2];
    }

    // Extract views
    const viewsText =
      document.querySelector('[class*="views"]')?.textContent || '';
    const viewsMatch = viewsText.match(/(\d+)\s*views?/i);
    const views = viewsMatch ? parseInt(viewsMatch[1]) : undefined;

    // Extract publication date
    const pubText =
      document.querySelector('[class*="published"]')?.textContent ||
      document.querySelector('[class*="created"]')?.textContent ||
      '';

    return {
      title,
      creator,
      startDate,
      endDate,
      views,
      publicationDate: pubText || undefined,
      wanderlogUrl: url,
    };
  }, wanderlogUrl);
}

/**
 * Extract header/banner images
 */
async function extractHeaderImages(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    const images: string[] = [];

    // Look for the large header image at the top (like the Edmonton cityscape)
    // It's usually the first large image or in a hero/header section
    const allImages = Array.from(document.querySelectorAll('img'));

    allImages.forEach((img) => {
      const src = (img as HTMLImageElement).src;
      const width = (img as HTMLImageElement).width;
      const height = (img as HTMLImageElement).height;

      // Header images are typically large and near the top
      if (src && width > 400 && height > 200 && !src.includes('icon') && !src.includes('logo')) {
        if (!images.includes(src)) {
          images.push(src);
        }
      }
    });

    // Limit to first 5 header images
    return images.slice(0, 5);
  });
}

/**
 * Extract notes section
 */
async function extractNotes(page: any): Promise<string | undefined> {
  return await page.evaluate(() => {
    // Look for notes section
    const notesSelectors = [
      '[class*="notes"]',
      '[class*="description"]',
      '[class*="overview"]',
    ];

    for (const selector of notesSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && text.length > 20) {
          return text;
        }
      }
    }

    return undefined;
  });
}

/**
 * Extract flight information
 */
async function extractFlights(page: any): Promise<WanderlogFlight[]> {
  return await page.evaluate(() => {
    const flights: any[] = [];

    // Find the Flight section by looking for heading containing "Flight"
    const flightHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const flightSection = flightHeadings.find(h => h.textContent?.trim() === 'Flight')?.parentElement;

    if (!flightSection) return flights;

    // Extract all text from the flight section
    const text = flightSection.textContent || '';

    // Match airline routes like "Flair Airlines YYZ-YEG 715 CAD"
    const routePattern = /([\w\s]+Airlines?)\s+([A-Z]{3})-([A-Z]{3})\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(CAD|USD)/gi;
    const routeMatches = [...text.matchAll(routePattern)];

    routeMatches.forEach(match => {
      flights.push({
        airline: match[1].trim(),
        departureAirport: match[2],
        arrivalAirport: match[3],
        price: parseFloat(match[4].replace(',', '')),
        currency: match[5],
        departureTime: '',
        arrivalTime: '',
      });
    });

    // Extract times separately
    const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)(?:\+\d)?)/gi;
    const timeMatches = [...text.matchAll(timePattern)];

    // Match times to flights
    timeMatches.forEach((match, index) => {
      if (flights[index]) {
        flights[index].departureTime = match[1];
        flights[index].arrivalTime = match[2];
      }
    });

    return flights;
  });
}

/**
 * Extract hotel information
 */
async function extractHotels(page: any): Promise<WanderlogHotel[]> {
  return await page.evaluate(() => {
    const hotels: any[] = [];

    // Find the Hotel Options section
    const hotelHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const hotelSection = hotelHeadings.find(h =>
      h.textContent?.trim().includes('Hotel')
    )?.parentElement;

    if (!hotelSection) return hotels;

    // Get all text blocks that contain hotel information
    const textContent = hotelSection.textContent || '';

    // Split by hotel names (they typically contain location info)
    const hotelNamePattern = /([A-Za-z\s&]+(?:Inn|Hotel|Suites|Resort|Lodge)[^,\n]*(?:,\s*[^,\n]+)?)/g;
    const hotelNames = [...textContent.matchAll(hotelNamePattern)];

    // Extract hotel blocks by looking for price patterns
    const pricePattern = /Total Price\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(CAD|USD)/gi;
    const prices = [...textContent.matchAll(pricePattern)];

    hotelNames.forEach((nameMatch, index) => {
      const name = nameMatch[1].trim();

      // Get corresponding price if available
      const priceMatch = prices[index];
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
      const currency = priceMatch ? priceMatch[2] : 'CAD';

      if (name && name.length > 5) {
        hotels.push({
          name,
          price,
          currency,
          rating: undefined,
          amenities: [],
        });
      }
    });

    return hotels;
  });
}

/**
 * Extract car rental information
 */
async function extractCarRentals(page: any): Promise<WanderlogCarRental[]> {
  return await page.evaluate(() => {
    const carRentals: any[] = [];

    // Find the Car Rental section
    const carHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const carSection = carHeadings.find(h =>
      h.textContent?.trim().includes('Car Rental')
    )?.parentElement;

    if (!carSection) return carRentals;

    const text = carSection.textContent || '';

    // Extract Budget or Avis mentions with prices
    const companyPattern = /(Budget|Avis)/gi;
    const companies = [...text.matchAll(companyPattern)];

    // Extract prices like "C$119.98 Total Price"
    const pricePattern = /C?\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*Total Price/gi;
    const prices = [...text.matchAll(pricePattern)];

    companies.forEach((match, index) => {
      const price = prices[index] ? parseFloat(prices[index][1].replace(',', '')) : undefined;

      carRentals.push({
        company: match[1],
        vehicleType: undefined,
        pickupLocation: undefined,
        dropoffLocation: undefined,
        price,
        currency: 'CAD',
      });
    });

    return carRentals;
  });
}

/**
 * Extract activities with associated images
 */
async function extractActivities(page: any): Promise<WanderlogActivity[]> {
  return await page.evaluate(() => {
    const activities: any[] = [];

    // Look for date headings like "Monday, July 14th"
    const dateHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(h =>
      /\w+,\s+\w+\s+\d+/.test(h.textContent || '')
    );

    dateHeadings.forEach((dateHeading) => {
      const dateSection = dateHeading.parentElement;
      if (!dateSection) return;

      // Find all activity names - they're typically in headings within the date section
      const activityNames = Array.from(dateSection.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(
        h => h !== dateHeading && h.textContent && h.textContent.trim().length > 3
      );

      activityNames.forEach((nameElement, index) => {
        const name = nameElement.textContent?.trim() || '';
        if (name.length < 3 || name === 'Save') return;

        // Find the container for this activity
        const container = nameElement.closest('div, section, article');
        if (!container) return;

        // Extract description (look for "From the web:" pattern)
        const description = Array.from(container.querySelectorAll('p, div'))
          .map(el => el.textContent?.trim())
          .find(text => text && text.includes('From the web:'))
          ?.replace('From the web:', '').trim();

        // Extract images from the container
        const images: any[] = [];
        container.querySelectorAll('img').forEach((img, imgIndex) => {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('icon') && !src.includes('logo') && src.length > 20) {
            images.push({
              url: src,
              alt: (img as HTMLImageElement).alt || name,
              position: imgIndex,
            });
          }
        });

        // Extract time/schedule info
        const scheduleText = container.textContent || '';
        const timeMatch = scheduleText.match(/Scheduled:\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        const hours = timeMatch ? timeMatch[1] : undefined;

        activities.push({
          id: `activity-${Date.now()}-${index}`,
          name,
          description,
          hours,
          rating: undefined,
          address: undefined,
          contact: undefined,
          images,
        });
      });
    });

    return activities;
  });
}

/**
 * Extract text from Quill Delta ops format
 */
function extractTextFromQuillOps(ops: any[]): string | undefined {
  if (!ops || !Array.isArray(ops)) return undefined;
  return ops.map(op => typeof op.insert === 'string' ? op.insert : '').join('').trim() || undefined;
}

/**
 * Extract flights from MOBX state
 */
function extractFlightsFromState(sections: any[], budget: any): WanderlogFlight[] {
  const flights: WanderlogFlight[] = [];

  // Find the Flight section
  const flightSection = sections.find((s: any) => s.heading === 'Flight');
  if (!flightSection) return flights;

  // Get flight expenses from budget
  const flightExpenses = budget?.expenses?.filter((e: any) => e.category === 'flights') || [];

  // Extract from blocks (note blocks contain flight details)
  flightSection.blocks?.forEach((block: any) => {
    if (block.type === 'note' && block.text?.ops) {
      const text = extractTextFromQuillOps(block.text.ops) || '';

      // Parse flight routes like "Flair Airlines YYZ-YEG 715 CAD"
      const routePattern = /([A-Za-z\s]+Airlines?)\s+([A-Z]{3})-([A-Z]{3})\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(CAD|USD)/gi;
      const routeMatches = [...text.matchAll(routePattern)];

      routeMatches.forEach(match => {
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

      // Extract baggage information
      // Look for patterns like "Includes Personal Item for FREE" or "1 Check bag 23kg"
      const baggagePatterns = [
        /Includes\s+Personal\s+Item.*?for\s+FREE/i,
        /\d+\s+Check(?:ed)?\s+bag.*?\d+kg/i,
        /Personal\s+item.*?free/i,
        /carry-on.*?free/i,
      ];

      flights.forEach((flight, index) => {
        const baggageInfo: string[] = [];
        baggagePatterns.forEach(pattern => {
          const match = text.match(pattern);
          if (match) {
            baggageInfo.push(match[0]);
          }
        });

        if (baggageInfo.length > 0) {
          flights[index].baggageOptions = baggageInfo.join(' • ');
        }
      });
    }
  });

  return flights;
}

/**
 * Extract hotels from MOBX state
 */
function extractHotelsFromState(sections: any[], budget: any): WanderlogHotel[] {
  const hotels: WanderlogHotel[] = [];

  // Find the Hotel Options section
  const hotelSection = sections.find((s: any) => s.heading === 'Hotel Options' || s.heading?.includes('Hotel'));
  if (!hotelSection) return hotels;

  // Extract from place blocks
  hotelSection.blocks?.forEach((block: any) => {
    if (block.type === 'place' && block.place) {
      const place = block.place;

      // Extract room type and notes from the text block
      let roomType: string | undefined = undefined;
      let price = 0;
      let currency = 'CAD';

      if (block.text?.ops) {
        const text = extractTextFromQuillOps(block.text.ops) || '';

        // Extract price from text like "Total Price 558.79 CAD"
        const priceMatch = text.match(/Total\s+Price\s+(\d+(?:\.\d{2})?)\s*(CAD|USD)/i);
        if (priceMatch) {
          price = parseFloat(priceMatch[1]);
          currency = priceMatch[2];
        }

        // The room type is typically the first line before any notes
        // Remove the "Total Price" line and extract the description
        roomType = text.replace(/Total\s+Price\s+\d+(?:\.\d{2})?\s*(?:CAD|USD)/i, '').trim();
      }

      hotels.push({
        name: place.name,
        price: price,
        currency: currency,
        rating: place.rating,
        amenities: place.amenities ? Object.keys(place.amenities).filter(k => place.amenities[k]) : [],
        address: place.formatted_address,
        roomType: roomType,
      });
    }
  });

  // Override with budget prices if available (budget prices take precedence)
  const hotelExpenses = budget?.expenses?.filter((e: any) => e.category === 'lodging') || [];
  hotelExpenses.forEach((expense: any) => {
    // Match by name (partial match)
    const expenseDesc = expense.description?.toLowerCase() || '';
    const matchingHotel = hotels.find(h =>
      expenseDesc.includes(h.name.toLowerCase().substring(0, 15))
    );

    if (matchingHotel) {
      matchingHotel.price = expense.amount?.amount || matchingHotel.price;
      matchingHotel.currency = expense.amount?.currencyCode || matchingHotel.currency;
    }
  });

  return hotels;
}

/**
 * Extract car rentals from MOBX state
 * Checks both budget expenses and sections for car rental data
 */
function extractCarRentalsFromState(budget: any, sections: any[]): WanderlogCarRental[] {
  const carRentals: WanderlogCarRental[] = [];

  // Debug: Log all budget expenses to see what categories exist
  console.log('🔍 All budget expenses:', JSON.stringify(budget?.expenses?.map((e: any) => ({
    category: e.category,
    description: e.description,
    amount: e.amount
  })), null, 2));

  // 1. Get car rental expenses from budget
  const carRentalExpenses = budget?.expenses?.filter((e: any) =>
    e.category === 'carRental' ||
    e.category === 'car_rental' ||
    e.category === 'rental' ||
    e.category === 'transportation' ||
    e.description?.toLowerCase().includes('car') ||
    e.description?.toLowerCase().includes('rental') ||
    e.description?.toLowerCase().includes('budget') ||
    e.description?.toLowerCase().includes('avis') ||
    e.description?.toLowerCase().includes('enterprise') ||
    e.description?.toLowerCase().includes('hertz')
  ) || [];

  console.log(`✅ Found ${carRentalExpenses.length} car rental expenses in budget`);

  carRentalExpenses.forEach((expense: any) => {
    const description = expense.description || '';

    // More comprehensive company detection
    let company = 'Unknown';
    if (description.toLowerCase().includes('budget')) company = 'Budget';
    else if (description.toLowerCase().includes('avis')) company = 'Avis';
    else if (description.toLowerCase().includes('enterprise')) company = 'Enterprise';
    else if (description.toLowerCase().includes('hertz')) company = 'Hertz';
    else if (description.toLowerCase().includes('alamo')) company = 'Alamo';
    else if (description.toLowerCase().includes('national')) company = 'National';

    carRentals.push({
      company,
      vehicleType: description,
      pickupLocation: undefined,
      dropoffLocation: undefined,
      price: expense.amount?.amount,
      currency: expense.amount?.currencyCode || 'CAD',
    });
  });

  // 2. Also check sections for car rental blocks
  const carRentalSection = sections.find((s: any) =>
    s.heading?.toLowerCase().includes('car') ||
    s.heading?.toLowerCase().includes('rental')
  );

  if (carRentalSection) {
    console.log(`🚙 Found car rental section with ${carRentalSection.blocks?.length || 0} blocks`);

    carRentalSection.blocks?.forEach((block: any) => {
      if (block.type === 'note' && block.text?.ops) {
        const text = extractTextFromQuillOps(block.text.ops) || '';
        console.log(`📝 Parsing text block: "${text.substring(0, 150)}..."`);

        // Check if text mentions car rental companies
        const mentionsCarRental = /(budget|avis|enterprise|hertz|alamo|national)/i.test(text);
        if (!mentionsCarRental) {
          console.log('   ⏭️  Skipping - no car rental company mentioned');
          return;
        }

        // Extract company name
        const companyMatch = text.match(/(budget|avis|enterprise|hertz|alamo|national)/i);
        if (!companyMatch) return;

        const company = companyMatch[1].charAt(0).toUpperCase() + companyMatch[1].slice(1).toLowerCase();

        // Extract price - handles both "C$221.95" and "221.95 CAD" formats
        // Look for: C$ or US$ followed by number, OR number followed by CAD/USD
        const pricePattern = /(?:C\$|US\$|CAD\s*\$|USD\s*\$)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:CAD|USD)/i;
        const priceMatch = text.match(pricePattern);

        if (!priceMatch) {
          console.log(`   ⚠️  Found ${company} but no price match in text`);
          return;
        }

        const price = parseFloat((priceMatch[1] || priceMatch[2]).replace(',', ''));

        // Determine currency from text (look for C$ prefix or CAD suffix)
        let currency = 'CAD'; // Default to CAD
        if (text.match(/US\$|USD/i)) {
          currency = 'USD';
        }

        console.log(`   ✅ Found car rental: ${company} - $${price} ${currency}`);

        carRentals.push({
          company,
          vehicleType: text,
          pickupLocation: undefined,
          dropoffLocation: undefined,
          price,
          currency,
        });
      }
    });
  }

  console.log(`✅ Total car rentals found: ${carRentals.length}`);
  return carRentals;
}

/**
 * Generate engaging, specific descriptions based on place type (NO ADDRESSES)
 */
function generatePlaceDescription(place: any): string {
  const types = place.types || [];
  const name = place.name || '';
  const rating = place.rating || 0;

  // Enhanced descriptions with multiple variations for variety
  const typeDescriptions: { [key: string]: string[] } = {
    'science_museum': [
      'Hands-on science center with interactive exhibits exploring technology, nature, and the cosmos',
      'Educational science attraction featuring robotics, space exploration, and live demonstrations',
      'Interactive museum showcasing scientific wonders and discovery through engaging exhibits'
    ],
    'planetarium': [
      'Immersive planetarium experience with stunning star shows and astronomical exhibits',
      'Cosmic journey through space with state-of-the-art projection and educational programs'
    ],
    'museum': [
      'Cultural museum featuring curated collections of art, history, and heritage',
      'Museum showcasing regional history, artifacts, and cultural exhibitions',
      'Historical museum with fascinating exhibits and guided tours'
    ],
    'art_gallery': [
      'Contemporary art gallery featuring local and international artists',
      'Fine art gallery showcasing paintings, sculptures, and rotating exhibitions'
    ],
    'zoo': [
      'Wildlife sanctuary home to exotic animals from around the world with conservation programs',
      'Family-friendly zoo featuring diverse animal habitats and educational encounters',
      'Urban zoo showcasing wildlife species in naturalistic environments'
    ],
    'aquarium': [
      'Underwater adventure featuring marine life from oceans around the globe',
      'Aquarium experience with colorful fish, sharks, and interactive touch pools'
    ],
    'amusement_park': [
      'Theme park adventure with thrilling rides, games, and family entertainment',
      'Amusement park featuring roller coasters, attractions, and seasonal events'
    ],
    'park': [
      'Scenic park perfect for outdoor recreation, picnics, and nature walks',
      'Beautiful green space with walking trails, playgrounds, and natural scenery',
      'Urban park oasis offering peaceful escape and recreational activities'
    ],
    'botanical_garden': [
      'Stunning botanical garden with seasonal blooms, rare plants, and tranquil walking paths',
      'Horticultural paradise featuring themed gardens and educational plant collections'
    ],
    'tourist_attraction': [
      'Must-see landmark offering unique cultural experience and photo opportunities',
      'Popular destination showcasing local character and memorable experiences',
      'Iconic attraction capturing the essence of the region'
    ],
    'restaurant': [
      'Local dining spot serving fresh, flavorful cuisine in welcoming atmosphere',
      'Restaurant featuring regional specialties and seasonal menu selections',
      'Culinary destination known for quality ingredients and authentic flavors'
    ],
    'cafe': [
      'Cozy café serving artisan coffee, fresh pastries, and light fare',
      'Neighborhood café perfect for coffee breaks and casual meetups',
      'Charming coffee house with specialty drinks and homemade treats'
    ],
    'bar': [
      'Local bar offering craft cocktails and relaxed social atmosphere',
      'Casual pub with drinks, snacks, and friendly neighborhood vibe'
    ],
    'shopping_mall': [
      'Shopping center featuring diverse retail stores and dining options',
      'Large mall complex with shopping, entertainment, and family amenities'
    ],
    'movie_theater': [
      'Cinema showing latest films with comfortable seating and concessions',
      'Movie theater experience with multiple screens and premium viewing options'
    ],
    'spa': [
      'Relaxing spa retreat offering wellness treatments and rejuvenation',
      'Spa sanctuary featuring massages, facials, and therapeutic services'
    ],
    'gym': [
      'Fitness center with modern equipment and group exercise classes',
      'Gym facility offering training programs and wellness resources'
    ],
    'library': [
      'Public library with extensive book collections and community programs',
      'Modern library featuring reading spaces, digital resources, and events'
    ],
    'church': [
      'Historic church offering spiritual services and community gatherings',
      'Place of worship with beautiful architecture and peaceful atmosphere'
    ],
    'point_of_interest': [
      'Notable local landmark worth exploring and photographing',
      'Interesting site showcasing unique character and regional heritage'
    ],
    'establishment': [
      'Local establishment serving the community with quality service',
      'Well-regarded venue known for excellent experience and hospitality'
    ]
  };

  // Special handling for specific name patterns
  if (name.toLowerCase().includes('farm') || name.toLowerCase().includes('berry')) {
    return 'Working farm offering seasonal produce picking, fresh goods, and agricultural experiences';
  }

  if (name.toLowerCase().includes('market')) {
    return 'Vibrant market featuring local vendors, fresh produce, artisan goods, and community atmosphere';
  }

  if (name.toLowerCase().includes('sanctuary') || name.toLowerCase().includes('refuge')) {
    return 'Natural sanctuary providing habitat preservation and wildlife viewing opportunities';
  }

  if (name.toLowerCase().includes('viewpoint') || name.toLowerCase().includes('lookout')) {
    return 'Scenic viewpoint offering breathtaking panoramic vistas perfect for photography';
  }

  // Find the first matching type and return a random variation
  for (const type of types) {
    if (typeDescriptions[type]) {
      const variations = typeDescriptions[type];
      return variations[Math.floor(Math.random() * variations.length)];
    }
  }

  // Enhanced fallbacks based on rating
  if (rating >= 4.5) {
    return 'Highly-rated local attraction offering exceptional experience and memorable moments';
  } else if (rating >= 4.0) {
    return 'Popular destination featuring quality experience and welcoming atmosphere';
  } else {
    return 'Local venue offering unique character and authentic regional experience';
  }
}

/**
 * Extract activities from MOBX state
 */
function extractActivitiesFromState(sections: any[]): WanderlogActivity[] {
  const activities: WanderlogActivity[] = [];

  sections.forEach((section: any) => {
    // Skip non-day sections
    if (!section.heading || section.heading === 'Notes' || section.heading === 'Flight' || section.heading?.includes('Hotel') || section.heading?.includes('Car')) {
      return;
    }

    section.blocks?.forEach((block: any, index: number) => {
      if (block.type === 'place' && block.place) {
        const place = block.place;
        const images = place.photo_urls ? place.photo_urls.map((url: string, imgIndex: number) => ({
          url,
          alt: place.name,
          position: imgIndex,
        })) : [];

        activities.push({
          id: `activity-${Date.now()}-${index}`,
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
    // Skip sections without headings or with empty headings
    if (!section.heading || section.heading.trim() === '') {
      return;
    }

    // Skip known system sections (exact match or contains)
    const skipSections = ['Notes', 'Flight', 'Hotel Options', 'Car Rental'];
    const shouldSkip = skipSections.some(keyword =>
      section.heading === keyword || section.heading.includes('Hotel') || section.heading.includes('Car')
    );
    if (shouldSkip) {
      return;
    }

    // Skip standalone "Activities" section (intro section)
    if (section.heading === 'Activities') {
      return;
    }

    // Check if section has place blocks (actual activities)
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

    // Only add if it has activities
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
