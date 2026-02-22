/**
 * Wanderlog Import API Route
 * Uses Firecrawl MCP to scrape trip data from Wanderlog URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { getFirecrawlMCPClient } from '@/lib/mcp/client/firecrawl-client';
import type { WanderlogTripInsert } from '@/types/supabase';

interface WanderlogLocation {
  name: string;
  type: string;
  imageUrl?: string;
  description?: string;
}

interface WanderlogDay {
  day: string;
  date?: string;
  activities: string[];
}

interface WanderlogHotel {
  name: string;
  stars?: number;
  price?: number;
  description?: string;
  imageUrl?: string;
}

interface WanderlogFlight {
  name: string;
  price?: number;
  duration?: string;
  stops?: string;
  description?: string;
}

interface WanderlogTrip {
  title: string;
  dates: string;
  destination: string;
  description?: string; // Notes section from Wanderlog
  locations: WanderlogLocation[];
  itinerary: WanderlogDay[];
  images: string[];
  hotels: WanderlogHotel[];
  flights: WanderlogFlight[];
  rawData: any;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('wanderlog.com')) {
      return NextResponse.json(
        { error: 'Invalid Wanderlog URL. Please provide a valid wanderlog.com URL.' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting Firecrawl scrape for: ${url}`);

    // Initialize Firecrawl MCP client
    const firecrawlClient = getFirecrawlMCPClient();
    await firecrawlClient.connect();

    // Get Firecrawl tools
    const tools = await firecrawlClient.getTools();

    console.log(`🔧 Available tools:`, Object.keys(tools));

    // Find the scrape tool (it might be named differently)
    const scrapeTool = tools['firecrawl_scrape'] || tools['scrape'] || tools['firecrawl-scrape'];

    if (!scrapeTool) {
      console.error('❌ Available tools:', Object.keys(tools));
      throw new Error('Firecrawl scrape tool not available. Available tools: ' + Object.keys(tools).join(', '));
    }

    console.log(`🔧 Using Firecrawl scrape tool...`);

    // The tool object has an execute function
    const scrapeResult = await scrapeTool.execute({
      url,
      formats: ['markdown', 'html', 'links'],
      onlyMainContent: false, // Get full page content
    });

    console.log(`✅ Firecrawl scrape completed`);
    console.log(`📄 Scraped data keys:`, Object.keys(scrapeResult));

    // Check if scraping failed
    if (scrapeResult.isError) {
      throw new Error(`Firecrawl scraping failed: ${scrapeResult.content || 'Unknown error'}`);
    }

    // Firecrawl returns content as an array of objects with type and text
    // The text might be a JSON string containing the actual markdown
    let markdownText = '';
    if (Array.isArray(scrapeResult.content)) {
      const textContent = scrapeResult.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');

      // Try to parse as JSON first (Firecrawl might wrap it)
      try {
        const parsed = JSON.parse(textContent);
        markdownText = parsed.markdown || textContent;
      } catch {
        markdownText = textContent;
      }
    } else if (typeof scrapeResult.content === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(scrapeResult.content);
        markdownText = parsed.markdown || scrapeResult.content;
      } catch {
        markdownText = scrapeResult.content;
      }
    }

    console.log(`📝 Extracted markdown length: ${markdownText.length}`);
    console.log(`📝 First 500 chars:`, markdownText.substring(0, 500));

    // Log a sample of markdown around where Notes section should be
    const notesIndex = markdownText.toLowerCase().indexOf('notes');
    if (notesIndex >= 0) {
      const start = Math.max(0, notesIndex - 200);
      const end = Math.min(markdownText.length, notesIndex + 2000);
      console.log(`📋 Found "notes" at character ${notesIndex}, showing context (${start}-${end}):`, markdownText.substring(start, end));
    }

    // Look for "Edmonton Family Adventure" or "# Notes" heading later in the markdown
    const edmontonIndex = markdownText.toLowerCase().indexOf('edmonton family');
    if (edmontonIndex >= 0) {
      const start = Math.max(0, edmontonIndex - 500);
      const end = Math.min(markdownText.length, edmontonIndex + 1500);
      console.log(`🎯 Found "Edmonton Family" content at character ${edmontonIndex}, showing context (${start}-${end}):`, markdownText.substring(start, end));
    }

    // Find ALL occurrences of "# Notes"
    const notesHeadingPattern = /^# Notes$/gm;
    const notesHeadings = [...markdownText.matchAll(notesHeadingPattern)];
    console.log(`📌 Found ${notesHeadings.length} "# Notes" headings at positions:`, notesHeadings.map(m => m.index));

    const scrapedContent = {
      markdown: markdownText,
      html: '',
      links: [],
      metadata: scrapeResult.metadata || {},
    };

    // Parse the scraped data
    const tripData = parseFirecrawlData(scrapedContent, url);

    // Store in Supabase
    const supabase = createServerSupabaseClient();

    // Check if this URL already exists
    const { data: existingTrip, error: checkError } = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('source_url', url)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking for existing trip:', checkError);
      throw new Error(`Failed to check for existing trip: ${checkError.message}`);
    }

    let dbRecord: any;
    let tripId: string;

    if (existingTrip) {
      // Trip already exists - update it with fresh data
      console.log(`🔄 Trip already exists, updating with fresh data...`);

      const updateData: any = {
        trip_title: tripData.title,
        trip_dates: tripData.dates,
        destination: tripData.destination,
        status: 'ready' as const,
        metadata: {
          source: 'wanderlog',
          description: tripData.description,
          locations: tripData.locations,
          itinerary: tripData.itinerary,
          images: tripData.images,
          hotels: tripData.hotels,
          flights: tripData.flights,
          imported_at: new Date().toISOString(),
          firecrawl_data: {
            markdown_length: scrapedContent.markdown.length,
            scraped_at: new Date().toISOString(),
          },
        },
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRecord, error: updateError } = await (supabase
        .from('wanderlog_trips') as any)
        .update(updateData)
        .eq('id', (existingTrip as any).id)
        .select()
        .single();

      if (updateError || !updatedRecord) {
        console.error('❌ Update error:', updateError);
        throw new Error(`Failed to update trip data: ${updateError?.message || 'No data returned'}`);
      }

      dbRecord = updatedRecord;
      tripId = (dbRecord as any).id as string;
      console.log(`✅ Successfully updated trip: ${tripId}`);
    } else {
      // New trip - insert it
      const insertData: WanderlogTripInsert = {
        // Let Supabase generate the UUID automatically
        source_url: url,
        source_type: 'wanderlog',
        trip_title: tripData.title,
        trip_dates: tripData.dates,
        destination: tripData.destination,
        status: 'ready' as const,
        metadata: {
          source: 'wanderlog',
          description: tripData.description,
          locations: tripData.locations,
          itinerary: tripData.itinerary,
          images: tripData.images,
          hotels: tripData.hotels,
          flights: tripData.flights,
          imported_at: new Date().toISOString(),
          firecrawl_data: {
            markdown_length: scrapedContent.markdown.length,
            scraped_at: new Date().toISOString(),
          },
        },
      };

      const { data: insertedRecord, error: insertError } = await supabase
        .from('wanderlog_trips')
        .insert(insertData as any)
        .select()
        .single();

      if (insertError || !insertedRecord) {
        console.error('❌ Database error:', insertError);
        throw new Error(`Failed to save trip data: ${insertError?.message || 'No data returned'}`);
      }

      dbRecord = insertedRecord;
      tripId = (dbRecord as any).id as string;
      console.log(`✅ Successfully imported new trip: ${tripId}`);
    }

    return NextResponse.json({
      success: true,
      tripId,
      trip: dbRecord as any,
    });
  } catch (error) {
    console.error('💥 Import error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to import Wanderlog trip',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Parse Firecrawl scraped data to extract trip information
 */
function parseFirecrawlData(scrapeResult: any, url: string): WanderlogTrip {
  const markdown = scrapeResult.markdown || '';
  const html = scrapeResult.html || '';
  const links = scrapeResult.links || [];

  console.log(`📊 Parsing scraped data...`);
  console.log(`📝 Markdown length: ${markdown.length}`);
  console.log(`🔗 Links found: ${links.length}`);

  // Extract title from metadata or markdown
  let title = scrapeResult.metadata?.title || 'Wanderlog Trip';

  // Clean up title (remove " - Wanderlog" suffix)
  title = title.replace(/\s*-\s*Wanderlog\s*$/i, '').trim();

  // Extract destination from URL or title
  const urlParts = url.split('/');
  const destination = urlParts[urlParts.length - 1]
    ?.replace(/-/g, ' ')
    ?.split(' ')
    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
    ?.join(' ') || 'Unknown Destination';

  // Extract dates from markdown
  const datePattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:st|nd|rd|th)?(?:,?\s+\d{4})?/gi;
  const dateMatches = markdown.match(datePattern) || [];

  let dates = 'Dates not specified';
  if (dateMatches.length > 0) {
    // Add year to dates if missing
    const addYearToDates = (dateStr: string): string => {
      // If date already has a year, return as is
      if (/\d{4}/.test(dateStr)) {
        return dateStr;
      }

      // Parse the date and add current year or next year
      const monthMatch = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+)/i);
      if (monthMatch) {
        const [, month, day] = monthMatch;
        const currentYear = new Date().getFullYear();
        const testDate = new Date(`${month} ${day}, ${currentYear}`);

        // If the date has passed this year, use next year
        if (testDate < new Date()) {
          return `${month} ${day}, ${currentYear + 1}`;
        }
        return `${month} ${day}, ${currentYear}`;
      }

      return dateStr;
    };

    if (dateMatches.length === 1) {
      dates = addYearToDates(dateMatches[0]);
    } else {
      // For date ranges, add year to both dates
      const startDate = addYearToDates(dateMatches[0]);
      const endDate = addYearToDates(dateMatches[dateMatches.length - 1]);
      dates = `${startDate} - ${endDate}`;
    }
  }

  console.log(`📅 Extracted dates: "${dates}"`);

  // Extract Notes/Overview section with the subtitle
  let description = '';

  // First, let's log the markdown structure to understand what we're working with
  const notesSection = markdown.match(/#{1,2}\s*(?:Notes|Overview)[\s\S]{0,2000}/i);
  if (notesSection) {
    console.log(`📋 Found Notes section, first 500 chars:`, notesSection[0].substring(0, 500));
  } else {
    console.log(`⚠️ No Notes/Overview section found in markdown`);
    console.log(`📋 Markdown headings:`, markdown.match(/^#{1,3}\s+.+$/gm)?.slice(0, 10));
  }

  // Try multiple patterns to find the notes/description
  // Pattern 1: Notes or Overview section (level 1 or 2 heading) with potential subtitle
  let notesMatch = markdown.match(/#{1,2}\s*(?:Notes|Overview)\s*\n+((?:###?\s+[^\n]+\n+)?[\s\S]*?)(?=\n#{1,2}\s+(?!###)|$)/i);

  // Pattern 2: Content after the trip title but before first day/section
  if (!notesMatch) {
    notesMatch = markdown.match(/^#\s+[^\n]+\n+([\s\S]*?)(?=\n#{1,2}\s+|$)/);
  }

  if (notesMatch && notesMatch[1]) {
    const rawMatch = notesMatch[1];
    console.log(`🎯 Raw match length: ${rawMatch.length}, first 300 chars:`, rawMatch.substring(0, 300));

    // Clean up the notes text - keep paragraph structure but remove markdown
    // Be less aggressive with filtering
    description = rawMatch
      .trim()
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images ![alt](url)
      .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove linked images [![alt](img)](link)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links [text](url) to just text
      .replace(/###\s+/g, '') // Remove h3 markers but keep the text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/\n{3,}/g, '\n\n'); // Collapse multiple newlines to double

    console.log(`🧹 After initial cleanup (${description.length} chars):`, description.substring(0, 200));

    // Split into lines and filter more carefully
    const lines = description.split('\n');
    console.log(`📄 Total lines before filtering: ${lines.length}`);

    const filteredLines = lines.filter((line: string) => {
      const trimmed = line.trim();
      // Keep empty lines for paragraph breaks
      if (trimmed === '') return true;
      // Remove exact matches of navigation words
      if (trimmed.match(/^(About|Reviews|Photos|Mentions|Share|Edit|Print|Save)$/i)) return false;
      // Remove lines with only spaces/bullets
      if (trimmed.match(/^[\s\-•]+$/)) return false;
      // Keep everything else
      return true;
    });

    console.log(`📄 Lines after filtering: ${filteredLines.length}`);

    description = filteredLines
      .join('\n')
      .replace(/\b(?:About|Reviews|Photos|Mentions|Share|Edit|Print|Save)\b[\s\-•]*/gi, '') // Remove navigation words inline
      .trim();

    console.log(`✅ Final description length: ${description.length}`);

    // Only keep description if it has actual content (not just whitespace/formatting)
    if (description.length < 10) {
      console.log(`⚠️ Description too short (${description.length} chars), discarding`);
      description = '';
    } else {
      description = description.substring(0, 1000); // Limit to 1000 chars
    }
  }

  // If no notes section, try to find description in the page content
  if (!description) {
    // Look for paragraphs that aren't just navigation or headers
    const paragraphs = markdown
      .split(/\n\n+/)
      .filter((p: string) => !p.startsWith('#'))
      .filter((p: string) => !p.includes('wanderlog.com/assets'))
      .filter((p: string) => !p.match(/^(About|Reviews|Photos|Mentions|Share|Edit)/i))
      .filter((p: string) => p.length > 50)
      .map((p: string) => p
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\b(?:About|Reviews|Photos|Mentions|Share|Edit|Print|Save)\b[\s\-•]*/gi, '')
        .trim()
      );

    if (paragraphs.length > 0) {
      description = paragraphs[0].substring(0, 1000);
    }
  }

  if (description) {
    console.log(`📝 Description extracted (${description.length} chars): "${description.substring(0, 150)}..."`);
  } else {
    console.log(`⚠️ No description found in markdown`);
  }

  // Extract locations from markdown headings and content
  const locations: WanderlogLocation[] = [];

  // Match location patterns like "## Location Name" or "### Activity Name"
  const locationPattern = /^#{2,3}\s+(.+?)$/gm;
  const locationMatches = markdown.matchAll(locationPattern);

  for (const match of locationMatches) {
    const name = match[1].trim();
    // Skip common non-location headings
    if (!name.match(/^(Overview|Itinerary|Notes|Hotels?|Flights?|Transportation|Day \d+)$/i)) {
      locations.push({
        name,
        type: 'attraction',
      });
    }
  }

  // Extract image URLs from links (Wanderlog image patterns)
  const images = links.filter((link: string) =>
    link.match(/\.(jpg|jpeg|png|webp)$/i) ||
    link.includes('images.wanderlog.com') ||
    link.includes('cloudfront.net')
  );

  // Extract itinerary by days
  const itinerary: WanderlogDay[] = [];
  const dayPattern = /^#{2,3}\s+((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|Day)\s+.+?)$/gm;
  const dayMatches = [...markdown.matchAll(dayPattern)];

  dayMatches.forEach((match, index) => {
    const dayTitle = match[1].trim();

    // Get content between this day heading and the next
    const startIdx = match.index! + match[0].length;
    const endIdx = dayMatches[index + 1]?.index || markdown.length;
    const dayContent = markdown.substring(startIdx, endIdx);

    // Extract activities from this day's content (bullet points or numbered lists)
    const activityPattern = /^[\*\-\d\.]\s+(.+?)$/gm;
    const activities = [...dayContent.matchAll(activityPattern)]
      .map(m => m[1].trim())
      .filter(a => a.length > 3); // Filter out very short items

    if (activities.length > 0) {
      itinerary.push({
        day: dayTitle,
        activities: activities.slice(0, 10), // Limit to 10 activities per day
      });
    }
  });

  // If no structured itinerary found, create basic structure from locations
  if (itinerary.length === 0 && locations.length > 0) {
    const locationsPerDay = 3;
    for (let i = 0; i < Math.min(5, Math.ceil(locations.length / locationsPerDay)); i++) {
      const dayLocations = locations.slice(i * locationsPerDay, (i + 1) * locationsPerDay);
      itinerary.push({
        day: `Day ${i + 1}`,
        activities: dayLocations.map(loc => loc.name),
      });
    }
  }

  // Extract hotel/accommodation information with comprehensive patterns
  const hotels: WanderlogHotel[] = [];

  console.log('\n\n🏨 ========= EXTRACTING HOTEL INFORMATION =========');

  // Strategy 1: Look for accommodation keywords followed by names
  const accommodationPatterns = [
    // Broad accommodation types
    /(?:Hotel|Resort|Inn|Lodge|Hostel|Guesthouse|Guest House|Airbnb|Apartment|Villa|Cottage|Bungalow|Homestay|B&B|Bed and Breakfast|Motel|Suites?)\s+[A-Z][^\n]{5,80}/gi,
    // Major hotel chains
    /(?:Hampton Inn|Sandman|Best Western|Hilton|Marriott|Hyatt|Holiday Inn|Sheraton|Radisson|Comfort Inn|Crowne Plaza|Doubletree|Embassy Suites|Four Seasons|Ritz-Carlton|Westin|Renaissance|Courtyard|Fairfield|SpringHill)[^\n]{0,60}/gi,
  ];

  const foundAccommodations = new Set<string>();

  accommodationPatterns.forEach(pattern => {
    const matches = markdown.match(pattern) || [];
    matches.forEach((match: string) => {
      // Clean up the match
      const cleanName = match
        .split(/[\n\r]/)[0]
        .trim()
        .replace(/^(Hotel|Resort|Inn|Lodge|Hostel|Guesthouse|Guest House|Airbnb|Apartment|Villa)\s+/i, '$1 ');

      if (cleanName.length > 5 && !foundAccommodations.has(cleanName)) {
        foundAccommodations.add(cleanName);

        // Try to find price near this accommodation
        const contextStart = Math.max(0, markdown.indexOf(match) - 200);
        const contextEnd = Math.min(markdown.length, markdown.indexOf(match) + match.length + 200);
        const context = markdown.substring(contextStart, contextEnd);

        const priceMatch = context.match(/(?:Total Price|Price|Cost|Rate)?\s*\$?\s*(\d+(?:,\d+)?(?:\.\d{2})?)\s*(?:CAD|USD|\$|per night|\/night)?/i);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : undefined;

        // Estimate star rating from keywords
        let stars = 3; // Default
        if (cleanName.match(/luxury|five star|5[\-\s]star|deluxe|premium|ritz|four seasons/i)) stars = 5;
        else if (cleanName.match(/four star|4[\-\s]star|upscale/i)) stars = 4;
        else if (cleanName.match(/hostel|budget|economy/i)) stars = 2;

        console.log(`  Found: ${cleanName} ${price ? `($${price})` : '(no price)'}`);

        hotels.push({
          name: cleanName.substring(0, 100),
          price,
          stars,
        });
      }
    });
  });

  // Strategy 2: Look for "Lodging" or "Accommodation" sections
  const lodgingSectionPattern = /#{2,3}\s*(?:Lodging|Accommodation|Hotels?|Where to Stay)[^\n]*\n([\s\S]{0,1500}?)(?=\n#{2,3}|\n\n\n|$)/gi;
  const lodgingSections = [...markdown.matchAll(lodgingSectionPattern)];

  lodgingSections.forEach(section => {
    const sectionContent = section[1];
    // Look for bullet points or lines with names and prices
    const lines = sectionContent.split('\n').filter((line: string) => line.trim().length > 10);

    lines.forEach((line: string) => {
      // Skip if already found
      if ([...foundAccommodations].some(name => line.includes(name))) return;

      // Look for patterns like "* Hotel Name - $123"
      const lineMatch = line.match(/[\*\-]\s*([A-Z][^\$\n]{10,80})[\s\-]*\$?\s*(\d+(?:,\d+)?(?:\.\d{2})?)?/);
      if (lineMatch) {
        const name = lineMatch[1].trim();
        const price = lineMatch[2] ? parseFloat(lineMatch[2].replace(',', '')) : undefined;

        if (!foundAccommodations.has(name)) {
          foundAccommodations.add(name);
          console.log(`  Found in lodging section: ${name} ${price ? `($${price})` : '(no price)'}`);

          hotels.push({
            name: name.substring(0, 100),
            price,
            stars: 3,
          });
        }
      }
    });
  });

  console.log(`✅ Total hotels/accommodations found: ${hotels.length}`);

  // Extract flight information with enhanced airport code detection
  const flights: WanderlogFlight[] = [];

  console.log('\n\n🔍 ========= EXTRACTING FLIGHT INFORMATION =========');
  console.log(`📝 Total markdown length: ${markdown.length} characters`);
  console.log(`📝 Markdown sample (first 3000 chars):\n${markdown.substring(0, 3000)}\n`);

  // Check for "LAX" specifically to verify it's in the markdown
  const hasLAX = markdown.includes('LAX');
  const hasMYR = markdown.includes('MYR');
  const hasBHM = markdown.includes('BHM');
  console.log(`🔍 Airport codes found in markdown: LAX=${hasLAX}, MYR=${hasMYR}, BHM=${hasBHM}`);

  // Strategy 1: Look for airport codes (3-letter codes like LAX, MYR, BHM)
  // More flexible pattern - just look for airport codes first
  const simpleAirportPattern = /\b([A-Z]{3})\s*(?:to|→|-|->)\s*([A-Z]{3})\b/gi;
  const simpleMatches = [...markdown.matchAll(simpleAirportPattern)];
  console.log(`✈️  Found ${simpleMatches.length} simple airport code patterns`);

  simpleMatches.forEach((match, idx) => {
    console.log(`   Match ${idx + 1}: ${match[1]} → ${match[2]} at position ${match.index}`);
    // Show context around the match
    const start = Math.max(0, match.index! - 100);
    const end = Math.min(markdown.length, match.index! + 300);
    console.log(`   Context: ${markdown.substring(start, end)}`);
  });

  // Now extract full flight details from context
  const airportMatches: any[] = [];
  simpleMatches.forEach((match) => {
    const departure = match[1];
    const arrival = match[2];

    // Get 500 characters of context around the match to find airline and price
    const start = Math.max(0, match.index! - 200);
    const end = Math.min(markdown.length, match.index! + 500);
    const context = markdown.substring(start, end);

    // Look for airline name in context
    const airlineMatch = context.match(/(American Airlines?|Delta|Southwest|United|Spirit|Alaska|JetBlue|Frontier|Allegiant|Air Canada|WestJet)/i);

    // Look for price in context - multiple patterns
    const priceMatch = context.match(/(?:Total Price\s+)?\$?\s*(\d+(?:,\d+)?(?:\.\d{2})?)\s*(?:via|CAD|USD)?/) ||
                      context.match(/\$\s*(\d+(?:,\d+)?(?:\.\d{2})?)/);

    if (airlineMatch || priceMatch) {
      airportMatches.push({
        departure,
        arrival,
        airline: airlineMatch?.[1] || 'Airline',
        price: priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : undefined,
        context: context.substring(0, 150)
      });
    }
  });

  console.log(`✈️  Extracted ${airportMatches.length} flights with details`);

  airportMatches.forEach((match, idx) => {
    const { departure, arrival, airline, price, context } = match;

    // Extract times if present in context
    const timeMatch = context.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))[^\d]+(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    const duration = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : undefined;

    console.log(`  Flight ${idx + 1}: ${departure} → ${arrival} via ${airline} ($${price})`);

    flights.push({
      name: `${airline} ${departure}-${arrival}`,
      price,
      duration,
      description: `${departure} to ${arrival} via ${airline}`,
    });
  });

  // Strategy 2: Look for airline names with prices (fallback)
  if (flights.length === 0) {
    console.log('🔍 No airport codes found, looking for airline names...');
    const airlineMatches = markdown.match(/(American Airlines?|Delta|Southwest|United|Spirit|Alaska|JetBlue|Frontier|Allegiant|Air Canada|WestJet|Flair)[^\n]{0,300}/gi) || [];

    airlineMatches.forEach((flightText: string, idx: number) => {
      const priceMatch = flightText.match(/(?:\$|Total Price\s+)?(\d+(?:,\d+)?(?:\.\d{2})?)\s*(?:CAD|USD|\$)?/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : undefined;
      const timeMatch = flightText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))[^\d]+(\d{1,2}:\d{2}\s*(?:AM|PM))/);
      const duration = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : undefined;

      // Extract airport codes if present
      const airportMatch = flightText.match(/([A-Z]{3})\s*(?:to|→|-)\s*([A-Z]{3})/);
      const route = airportMatch ? `${airportMatch[1]}-${airportMatch[2]}` : '';

      console.log(`  Flight ${idx + 1}: ${flightText.substring(0, 50)}... ($${price})`);

      flights.push({
        name: flightText.split(/[\n\r]/)[0].trim().substring(0, 100),
        price,
        duration,
        stops: flightText.toLowerCase().includes('non-stop') || flightText.toLowerCase().includes('direct') ? 'Nonstop' : undefined,
        description: route,
      });
    });
  }

  // Strategy 3: Look for "Total Price" mentions with flight keywords
  if (flights.length === 0) {
    console.log('🔍 Looking for "Total Price" flight mentions...');
    const totalPricePattern = /Total Price\s+\$?(\d+(?:,\d+)?(?:\.\d{2})?)[^\n]{0,300}(?:flight|airline|aircraft)/gi;
    const priceMatches = [...markdown.matchAll(totalPricePattern)];

    priceMatches.forEach((match, idx) => {
      const price = parseFloat(match[1].replace(',', ''));
      const context = match[0];

      // Try to extract airport codes from context
      const airportMatch = context.match(/([A-Z]{3})\s*(?:to|→|-)\s*([A-Z]{3})/);
      const route = airportMatch ? `${airportMatch[1]} to ${airportMatch[2]}` : 'Flight';

      console.log(`  Flight ${idx + 1}: ${route} ($${price})`);

      flights.push({
        name: route,
        price,
        description: context.substring(0, 100),
      });
    });
  }

  console.log(`✅ Parsed: ${locations.length} locations, ${itinerary.length} days, ${images.length} images, ${hotels.length} hotels, ${flights.length} flights`);
  if (description) {
    console.log(`📝 Description extracted (${description.length} chars)`);
  }

  return {
    title,
    dates,
    destination,
    description: description || undefined,
    locations: locations.slice(0, 30), // Limit to 30 locations
    itinerary: itinerary.slice(0, 10), // Limit to 10 days
    images: images.slice(0, 50), // Limit to 50 images
    hotels: hotels.slice(0, 10), // Limit to 10 hotels
    flights: flights.slice(0, 10), // Limit to 10 flights
    rawData: {
      metadata: scrapeResult.metadata,
      linksCount: links.length,
      markdownLength: markdown.length,
    },
  };
}
