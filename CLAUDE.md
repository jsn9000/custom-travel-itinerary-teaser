# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production app with Turbopack
- `pnpm start` - Start production server
- `pnpm tsc --noEmit` - Run TypeScript compiler to check for type errors

## Code Quality

**IMPORTANT**: Always run `pnpm tsc --noEmit` after writing or modifying any code to ensure there are no TypeScript errors before considering the task complete.

## Package Manager

This project strictly uses **pnpm**. Do not use npm or yarn.

## Wanderlog Web Scraping

**Flight Information Extraction:**

When scraping Wanderlog trip pages for flight information, the scraper must look for flight data in multiple places, not just dropdown menus:

1. **Airport Code Detection**: Look for 3-letter airport codes (e.g., LAX, JFK, YYC, YEG, SFO, ORD) in text content
   - Airport codes are typically in ALL CAPS
   - Common pattern: `ORIGIN-DESTINATION` (e.g., "LAX-JFK")
   - May appear as: `ORIGIN to DESTINATION` or `ORIGIN → DESTINATION`

2. **Flight-Related Keywords**: Search for these keywords in text paragraphs and sections:
   - `flight`, `flights`, `aircraft`, `airplane`, `plane`
   - `airline`, `airlines`, `carrier`
   - `departure`, `arrival`, `layover`, `connecting`
   - `terminal`, `gate`, `boarding`

3. **Flight Details to Extract**:
   - **Airline name**: Look for airline names near airport codes (e.g., "Delta Airlines", "Air Canada", "United")
   - **Route**: Origin and destination airport codes
   - **Price**: Look for currency symbols ($, CAD, USD) and numbers near flight keywords
   - **Times**: Departure and arrival times (e.g., "10:30 AM", "2:45 PM")
   - **Flight class**: Economy, Premium Economy, Business Class, First Class
   - **Baggage**: Carry-on, checked bags, weight limits

4. **Text Parsing Patterns**:
   - `[Airline] [ORIGIN]-[DESTINATION] [Price] [Currency]` (e.g., "Delta Airlines LAX-JFK 450.00 USD")
   - `[ORIGIN] to [DESTINATION] via [Airline]` (e.g., "LAX to JFK via Delta")
   - Flight details may be in note blocks, text sections, or embedded in descriptions
   - Look in sections with headings containing: "Flight", "Air Travel", "Transportation"

5. **Fallback Strategy**:
   - If no flight information is found in structured blocks, scan all text content for airport codes
   - Extract surrounding context (2-3 sentences) around airport codes
   - Look for price information within the same paragraph or nearby text
   - Check note blocks and description fields for flight-related content

**Implementation Locations**:
- Primary: `/app/api/wanderlog/import/route.ts` - Firecrawl-based importer with enhanced flight extraction (lines 530-616)
- Alternative: `lib/wanderlog-scraper.ts` - Browserbase-based scraper with `extractFlightsFromState()` function

The active import system uses Firecrawl MCP and extracts flights using multiple strategies to ensure comprehensive detection.

## Image Guidelines

**IMPORTANT - Image Priority Order:**
1. **ALWAYS use Wanderlog scraped images first** - Images from the scraped Wanderlog site should be the primary source
2. Only use fallback images when Wanderlog images are not available
3. The banner/header should ALWAYS default to using images scraped from the current Wanderlog trip
4. All images are stored in the `wanderlog_images` Supabase table after scraping

**Image Selection Logic:**
When adding or updating images for activities, dining venues, or other trip elements:

1. **First Priority - Wanderlog Images**:
   - Check if images exist in the `wanderlog_images` table for the activity
   - Verify that the Wanderlog images match the description and location of the activity
   - If Wanderlog images are appropriate and relevant, use them

2. **Second Priority - Reasoning for Appropriate Alternatives**:
   - If Wanderlog images don't exist OR don't match the description/place, use reasoning to select appropriate images
   - Consider the activity type, location, and description to choose contextually relevant images
   - Examples of reasoning:
     - "Whale shark watching" → Images showing whale sharks underwater, snorkeling with whale sharks, ocean wildlife
     - "Taoist Temple" → Images showing Chinese temple architecture, red pillars, traditional Asian temples (NOT underwater scenes, NOT clubbing)
     - "Beach resort" → Images showing tropical beach, white sand, palm trees (NOT desert landscapes, NOT yellow vans)
     - "Spa and massage" → Images showing spa treatments, massage stones, tranquil spa atmosphere (NOT unrelated activities)
   - Use high-quality stock images from Unsplash or similar sources that accurately represent the activity
   - NEVER use images that are clearly unrelated or misleading (e.g., desert van for whale shark watching)

3. **Image Validation**:
   - Before adding any image, verify it matches the activity description
   - Check that the image depicts the correct type of location, activity, or venue
   - Ensure images are contextually appropriate for the destination and activity

**CRITICAL - No Duplicate Images:**
- **DO NOT repeat any pictures on the teaser page unless the food or activity spot is exactly the same**
- Each unique activity or dining venue must have distinct, non-repeating images
- If showing the same restaurant/activity multiple times (e.g., different days), it's acceptable to reuse that specific venue's images
- Never use the same image for different activities, different restaurants, or different venues
- Ensure complete image variety across all cards on the page

**BANNED IMAGES - NEVER USE:**
- **ABSOLUTELY NO yellow bus/van pictures in mountains or deserts**
- NO generic vehicle images (buses, vans, cars) unless the activity is specifically about transportation
- NO desert landscapes for beach activities
- NO mountain/rocky terrain for ocean/beach activities
- These types of images are completely inappropriate and must never appear

**Activity Images:**
- Activity images should be displayed WITHOUT blur effect - they should be clear and crisp
- Each activity card must use a unique image - rotate through available database images to avoid duplicates
- If an activity has multiple images, use different images for different cards
- Include 6 diverse fallback images for activities without database images (only used when Wanderlog has no images)
- Images should be pulled from `wanderlog_images` table with `associated_section: 'activity'`
- **IMPORTANT**: Never reuse the same image for different activities - each activity must have its own distinct images

**Dining Images:**
- Dining venue images should be displayed WITHOUT blur effect - they should be clear and crisp, just like activity images
- Use database images from associated dining activities
- Include meal-specific fallback images (breakfast, lunch, dinner) only when Wanderlog images are unavailable
- **IMPORTANT**: Never reuse the same image for different restaurants - each dining venue must have its own distinct images

**Hotel/Flight Images:**
- Hotel and flight images should have a blur effect to maintain the teaser/paywalled aesthetic
- Pull from database when available, use Unsplash fallbacks otherwise
- **IMPORTANT**: Flight images must ALWAYS show commercial airplanes (not private jets, small planes, or other aircraft)
- Verify that flight images depict large commercial passenger aircraft before using them

**Header/Banner Images:**
- **DEFAULT**: Always use images scraped from the Wanderlog trip URL for the header banner
- Banner images are stored in `wanderlog_images` with `associated_section: 'header'`
- The scraper automatically identifies and uploads the best images from the trip page
- Only use destination-specific fallback images (like Edmonton images) when no Wanderlog images exist for that trip

**Adding New Images to Supabase:**
- When the user approves a new image for use in the application, it should be added to the Supabase `wanderlog_images` table
- Use the script pattern from `scripts/add-flight-image.mjs` as a template
- Images should be:
  1. Fetched from their source URL
  2. Converted to base64 data URLs for storage
  3. Inserted into `wanderlog_images` with appropriate metadata:
     - `trip_id`: UUID of the associated trip
     - `url`: Base64 data URL of the image
     - `associated_section`: Category ('activity', 'dining', 'hotel', 'flight', 'header', etc.)
     - `position`: Order/index for display
     - `alt`: Descriptive alt text
     - `caption`: Optional caption text
- Run the script with: `source .env.local && node scripts/your-script.mjs`
- Verify the image was added successfully before updating application code to use it

## Architecture and Design

This is a TypeScript Next.js 15 application with two main features:

1. **AI-powered travel agents** - Chat interfaces with AI agents (RAG, MCP tools, etc.)
2. **Paywalled itinerary teaser** - Visual teaser page for custom travel itineraries derived from Wanderlog data
3. **Website Design** - The website and header must be high quality. The site very visually appealing, including the font used.
4. **Header** - The header must contain pictures based on the destination the person will be visiting and be vibrant and eye catching. You can use images on the wanderlog url provided or create visually appealing images based on the destination of the client. always include a couple, single person, family with kids as well. there should be about 6 images provided. The landscape and surroundings should be based on well known or fun looking sites from the destination
   - **Edmonton Header Images**: For Edmonton trips, use the following images from `/app/images/edmonton/`:
     - `edmonton-skyline.jpeg` - Vibrant night skyline with colorful buildings
     - `edmonton-lights.jpeg` - Northern lights over Edmonton skyline
     - `edmonton-couple.jpeg` - Couple enjoying Edmonton
     - `edmonton-whitehouse.jpg` - Historic Edmonton landmark
   - Rotate through these images in the header carousel for a dynamic, engaging visual experience
5. **Trip Title & Subtitle** - The trip title should have a catchy subtitle underneath it that fits the destination, like "7 Days of Sun, Sea, and Unforgettable Memories". The subtitle should be derived from the trip notes if available (first sentence), otherwise generate one based on trip duration and destination.
6. **Sections** - Have in order the sections: catchy description of this trip, hotels, flights, and daily itinerary. Each card for the hotels the user will pick from should have the star ratings and prices. The card should have an image of the place that is available but it should be blurred a little. And the name of the site should not be the actual name of the flights or hotel but a description of the type of hotel and flight.
7. **Hotel Details** - Each hotel card must show: room type description (e.g., "Standard Room, 2 Queen Beds"), amenities, price per night with 2 decimal places, and total price for all nights. Use images from Supabase that were extracted from Wanderlog with `associated_section: 'hotel'`.
8. **Choices** - The card or options that are chosen should be active (opacity 100%, full color, scaled up) and the other options not chosen should be greyed out (opacity 60%, 50% grayscale filter).
9. **Price Formatting** - All prices must be formatted to 2 decimal places maximum using `.toFixed(2)`. This applies to hotel prices, flight prices, totals, and the unlock fee.
10. **Daily Itinerary Section** - Include a complete daily itinerary section showing each day with:
    - Day headers formatted as "Day X [Title]" where title is descriptive (e.g., "Arrival & Getting Started", "Full Day of Adventures")
    - The actual date shown below the day title in smaller text
    - Activity cards with images from Supabase database - **IMPORTANT: Activity images should NOT be blurred**
    - Each activity card must display a unique image - rotate through available images to avoid duplicates
    - If an activity has multiple images in the database, use different images for different cards
    - Include fallback images for activities without database images
    - Activities should ONLY be shown in the daily itinerary section, not as a separate standalone section
11. **Totals** - All the options that are chosen with prices should be totaled to show a total cost for the flight and hotel in a section at the bottom of the website.
12. **Trip Summary** - The trip summary section should display all trip components (hotels, flights, car rental, food budget) as separate line items. **IMPORTANT: The Trip Subtotal should include hotels + car rental + food budget, but NOT flight costs.** Flight costs should be displayed as a separate line item above the subtotal but excluded from the subtotal calculation. Do not display any unlock fee or additional charges in the trip summary.
13. **Always Check Images** - Always double check images to make sure they are truly representative of the destination. Correct and choose another image if necessary on initial setup. Use actual Wanderlog images stored in Supabase with proper associations.
14. **Wanderlog URL** - Always make sure to use the Wanderlog URL provided to pull the newest information for the generated page based on the template that is here.
15. **Buttons, Color, Theme** - The button and colors and themes must all be based on the Wanderlog url provided since it will have the destination and location of the visit.
16. **Dining Variety** - Each day must show THREE DIFFERENT dining venues for breakfast, lunch, and dinner. The same restaurant should NOT be shown for multiple meals on the same day. Venues should rotate across different days to provide variety throughout the trip.
17. **Airline Descriptions** - The airlines presented should not be the name of the actual airline, it should be a description such as if it's first class or economy etc. for example.
18. **Accommodation Descriptions** - Under Select your accommodations, the actual hotel, inn, suites and other living arrangements should be a description of the property not the actual name of the hotel.
19. **Card Hover Effects** - All activity cards and dining cards in the daily itinerary section must have interactive hover effects. When a user hovers over these cards, they should smoothly translate upward (hover:-translate-y-1), display a shadow effect (hover:shadow-lg), and have a smooth transition animation (transition-all duration-300). The cursor should change to pointer to indicate interactivity.

---

# Teaser Generator (Activities, Dining & Airlines Only)
**Activation:** Only apply this section **when the user prompt explicitly includes**: `TEASER_MODE`.  
If `TEASER_MODE` is not present, **ignore this section entirely**.

## Purpose
Transform raw data for **activities**, **dining**, and **airlines** into short, enticing teaser descriptions that **do not reveal** exact names or addresses. These teasers are public-facing; real names/locations are revealed only after purchase.

If a record is **not** one of those categories (e.g., hotels, cars, trips, etc.), or if `TEASER_MODE` is not present, **return data unchanged** and follow the rest of this file as usual.

## Scope
Apply transformation **only** when:
- The record/table/category/type includes one of: `activity`, `activities`, `dining`, `restaurant`, `food`, `airline`, `flight`
- **AND** the current request includes the literal activation phrase `TEASER_MODE`

Otherwise, skip transformation.

## Input (from Supabase)
Example structure:
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string | null",
  "city": "string | null",
  "region": "string | null",
  "country": "string | null",
  "description": "string | null",
  "category": "string | null",
  "type": "string | null",
  "hours": "string | null",
  "seasonality": "string | null",
  "notes": "string | null",
  "rating": 4.6
}
```
> When in `TEASER_MODE` for scoped categories, the model must **never** output `name`, `address`, or any identifying terms.

## Output (for scoped categories in TEASER_MODE)
Return an **array** with:
```json
[
  {
    "id": "uuid",
    "title": "string",
    "headerEmoji": "string",
    "teaser": "string",
    "tone": "string",
    "tags": ["string"]
  }
]
```
If input is not in scope or `TEASER_MODE` is absent, return the input unchanged.

**Important:** In `TEASER_MODE`, output **JSON only** (no markdown fences, no extra commentary).

## Writing Guidelines (in TEASER_MODE)
- Focus on **experience** — what travelers see, feel, or taste.  
- **Strictly remove** names, addresses, and brands.  
- Replace specifics with **generic descriptors**.

| Type              | Example Replacement              |
|-------------------|----------------------------------|
| Science Museum    | “interactive science center”     |
| Zoo               | “urban wildlife haven”           |
| Garden            | “serene botanical paradise”      |
| Heritage Park     | “living history village”         |
| Farm              | “seasonal berry patch”           |
| Restaurant        | “hidden culinary gem”            |
| Café/Bistro       | “cozy corner café”               |
| Fine Dining       | “elegant dining experience”      |
| Airline           | “premium air carrier”            |

- Keep teasers **2–4 sentences** (~35–80 words).  
- Mention seasonality/uniqueness briefly; avoid exact dates/times.  
- End softly: “perfect for food lovers,” “great for families,” “ideal for explorers.”

## Tone Modes
Use one of: `family_friendly`, `adventure`, `romantic`, `luxury`, `balanced`, `culinary`, `travel`.

## Examples (for TEASER_MODE)

### Activity Example
**Input**
```json
{
  "id":"1",
  "name":"TELUS World of Science - Edmonton",
  "category":"activity",
  "description":"Science centre with hands-on exhibits on robots, the human body & more, plus a separate observatory."
}
```

**Output**
```json
{
  "id":"1",
  "title":"Interactive Science Adventure",
  "headerEmoji":"🌌",
  "teaser":"Step into a world where curiosity comes alive — tinker with robotics, explore the marvels of the human body, and peer through telescopes that bring distant galaxies within reach. A fun, educational outing for families and explorers alike.",
  "tone":"family_friendly",
  "tags":["hands-on","indoors","stargazing","educational"]
}
```

### Dining Example
**Input**
```json
{
  "id":"2",
  "name":"Ruth’s Steakhouse",
  "category":"dining",
  "description":"Upscale steakhouse offering prime cuts, seafood, and fine wines in a sophisticated setting."
}
```

**Output**
```json
{
  "id":"2",
  "title":"Elegant Dining Experience",
  "headerEmoji":"🍷",
  "teaser":"An upscale retreat where expertly grilled dishes meet impeccable service and ambiance. Expect soft lighting, refined flavors, and a touch of indulgence — perfect for a memorable evening out.",
  "tone":"luxury",
  "tags":["steak","wine","fine dining","evening"]
}
```

### Airline Example
**Input**
```json
{
  "id":"3",
  "name":"Air Canada",
  "category":"airline",
  "description":"Major airline offering domestic and international flights with a focus on comfort and reliability."
}
```

**Output**
```json
{
  "id":"3",
  "title":"Premier Air Journey",
  "headerEmoji":"✈️",
  "teaser":"Experience a smooth, well-connected journey with a trusted international carrier known for comfort and care. From takeoff to landing, every detail is designed to make travel feel effortless.",
  "tone":"travel",
  "tags":["flight","comfort","international","reliable"]
}
```

## Transformation Steps (in TEASER_MODE)
1. Parse each record.  
2. If category/table/type ≠ activity/dining/airline → return unchanged.  
3. Else:
   - Derive a non-identifying `title` and `headerEmoji`.
   - Write a 2–4 sentence `teaser` (no names/addresses).
   - Pick a `tone` and 2–5 general `tags`.
4. Return **JSON only** (no markdown, no commentary).

## Guardrails (in TEASER_MODE)
- Never output names, addresses, brands.  
- No links, prices, or CTAs.  
- No copied text — paraphrase only.  
- If input is sparse, generate tasteful generic copy from `category`.

## How to Invoke (example prompt)
> **TEASER_MODE** — Using the Teaser Generator section in `CLAUDE.md`, transform these Supabase rows. Only apply rules to activities, dining, or airlines. Return JSON only, no identifying info.

---

# Activity & Dining Description Enhancement

## Overview
The application includes an AI-powered enhancement feature that improves activity and dining descriptions to make them more enticing and detailed. This feature is available after importing a Wanderlog trip.

## Features
- **Enhanced Descriptions**: Uses GPT-4o to generate compelling, sensory-rich descriptions for all activities
- **Dining Details**: Automatically identifies and mentions cuisine types for restaurants and cafes
- **Preserves Original Data**: Keeps original descriptions for reference while updating with enhanced versions

## How It Works

### API Endpoint
`POST /api/trips/[tripId]/enhance`

This endpoint:
1. Fetches the trip data from Supabase
2. For each activity, generates an enhanced description using GPT-4o
3. Updates the trip metadata with enhanced data
4. Preserves original descriptions in `originalDescription` field

### Enhancement Rules
The AI enhancement follows these guidelines:
1. **Dining venues** MUST mention cuisine type (e.g., "Italian cuisine", "farm-to-table", "authentic sushi")
2. Uses sensory language to help travelers imagine the experience
3. Highlights unique features or what makes the place special
4. Keeps descriptions concise but evocative (2-3 sentences)
5. Avoids generic phrases like "quality experience" or "welcoming atmosphere"
6. Focuses on what travelers will see, do, taste, or feel

### Usage

#### From Import Page
After importing a trip, click the **"Enhance Descriptions"** button before creating the teaser page.

The button shows:
- **Default state**: "Enhance Descriptions" with magic wand icon
- **Loading state**: "Enhancing descriptions... (30-60s)" with spinner
- **Success state**: "Descriptions Enhanced!" with checkmark

#### Programmatically
```typescript
const response = await fetch(`/api/trips/${tripId}/enhance`, {
  method: 'POST',
});

const data = await response.json();
// {
//   success: true,
//   message: "Trip descriptions enhanced successfully",
//   stats: {
//     totalActivities: 28,
//     enhancedCount: 28,
//     destination: "Edmonton"
//   },
//   enhancedActivities: [...]
// }
```

## Environment Variables

### Required
```bash
# OpenAI API key for description enhancement
OPENAI_API_KEY=sk-proj-...your-actual-key-here...
```

**IMPORTANT**: The `.env.local` file must contain a **valid OpenAI API key** for the enhancement feature to work. Placeholder values like `your_openai_api_key_here` will cause all enhancements to fail silently.

## Files
- `/app/api/trips/[tripId]/enhance/route.ts` - Enhancement API endpoint
- `/app/import/page.tsx` - Import page with enhancement button

## Example Enhanced Description

**Original**: "Hands-on science center with interactive exhibits exploring technology, nature, and the cosmos"

**Enhanced**: "Step into a world where science comes alive through hands-on discovery. From cosmic planetarium shows to interactive technology exhibits, every corner sparks curiosity and wonder for all ages. This isn't just observation—it's immersive learning that makes complex concepts tangible and thrilling."
