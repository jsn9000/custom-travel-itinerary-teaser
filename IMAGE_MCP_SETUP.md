# Remote Image MCP Server Setup

This document explains how to use remote MCP servers to pull location-based images for your travel itinerary app.

## Why Remote MCP Servers?

✅ **No local setup** - No need to install Python, uv, or other dependencies
✅ **Always available** - Cloud-hosted servers are always online
✅ **Automatic updates** - Server improvements happen automatically
✅ **Easy authentication** - OAuth flow built-in
✅ **Multiple APIs** - Access 2,900+ APIs through one server

## Configured Remote MCP Servers

### 1. Pipedream MCP Server ⭐ RECOMMENDED

**URL**: `https://mcp.pipedream.net/v2`

**What it provides**:
- Access to **2,900+ APIs** including Unsplash, Pexels, Pixabay
- **10,000+ prebuilt tools** for image search, download, and management
- Built-in authentication (no manual API key management)
- Support for multiple image APIs simultaneously

**Authentication**:
- OAuth-based authentication
- You'll authenticate when you first use the server in Claude Code
- Credentials are securely stored and isolated
- Can connect multiple image services (Unsplash, Pexels, etc.)

### 2. Supabase MCP Server (Already Configured)

**URL**: `https://mcp.supabase.com/mcp`

**What it provides**:
- Direct access to your Supabase database
- Store and retrieve images from your `wanderlog_images` table
- Query image metadata and associations

## How to Use Image MCP Servers

Once configured, you can ask Claude Code to search for images:

### Example 1: Search for Destination Images

```
Ask Claude Code:
"Search Unsplash for 6 landscape photos of Edmonton landmarks"
```

Claude Code will:
1. Connect to Pipedream MCP server
2. Authenticate with Unsplash (if not already done)
3. Search for Edmonton landmark photos
4. Return high-quality image URLs with attribution

### Example 2: Find Activity Images

```
Ask Claude Code:
"Find 3 photos of science museums in Edmonton from Pexels"
```

### Example 3: Get Hotel Images

```
Ask Claude Code:
"Search for luxury hotel room images in Edmonton"
```

### Example 4: Multi-Provider Search

```
Ask Claude Code:
"Search both Unsplash and Pexels for 'Edmonton nightlife' photos
and give me the 5 best results"
```

## Available Image APIs via Pipedream

Through the Pipedream MCP server, you have access to:

### Unsplash
- **Best for**: High-quality, artistic travel photos
- **Pros**: Excellent quality, diverse destinations, free to use
- **Search features**: Keywords, colors, orientation, location
- **Attribution**: Required (photographer name + Unsplash)

### Pexels
- **Best for**: Professional stock photos and videos
- **Pros**: Large library, consistent quality, videos available
- **Search features**: Keywords, orientation, size, color
- **Attribution**: Required (photographer name + Pexels)

### Pixabay
- **Best for**: Illustrations and diverse content
- **Pros**: Completely free, no attribution required
- **Search features**: Keywords, image type, orientation
- **Attribution**: Optional but appreciated

## Authentication Process

### First-Time Setup

1. **Start Claude Code** and ensure it's connected to the project
2. **Ask for an image search** (e.g., "Search Unsplash for Paris photos")
3. **Browser will open** for OAuth authentication
4. **Sign in to Pipedream** (or create free account)
5. **Authorize the MCP server** to access image APIs
6. **Connect your image API accounts** (Unsplash, Pexels, etc.)
7. **Done!** Credentials are securely stored

### Subsequent Uses

After first-time setup:
- No authentication needed
- Direct image searches
- Automatic token refresh
- Access to all connected APIs

## Image Search Best Practices

### For Travel Destinations

**Good queries**:
- ✅ "Edmonton skyline landscape photos"
- ✅ "Banff National Park mountain views"
- ✅ "Tokyo street food restaurant images"

**Poor queries**:
- ❌ "Edmonton" (too generic)
- ❌ "Images" (no context)
- ❌ "Good pictures" (subjective)

### Query Tips

1. **Be specific**: Include destination + category
   - "Paris Eiffel Tower sunset"
   - "New York City subway interior"

2. **Specify orientation**:
   - "landscape" for headers
   - "portrait" for profiles
   - "squarish" for cards

3. **Add descriptors**:
   - "aerial view of London"
   - "cozy cafe in Seattle"
   - "modern hotel lobby Dubai"

4. **Include activity type**:
   - "Edmonton river valley hiking"
   - "Venice gondola ride tourists"

## Integration with Your App

### Option 1: Use Claude Code Directly

Ask Claude Code to search and add images to your Supabase database:

```
"Search for 6 Edmonton header images and save them to the
wanderlog_images table with associated_section='header'
for trip ID xyz123"
```

### Option 2: API Routes

Use the helper functions in `lib/image-search.ts`:

```typescript
import { searchLocationImages } from '@/lib/image-search';

// Get header images for Edmonton
const images = await searchLocationImages({
  destination: 'Edmonton',
  category: 'landmark',
  count: 6,
  orientation: 'landscape'
});
```

**Note**: Direct API calls require API keys in `.env.local`, but using MCP servers through Claude Code doesn't require manual API key management.

### Option 3: Hybrid Approach

1. Use MCP servers during development to find good images
2. Save selected images to Supabase
3. Use Supabase images in production

## Common Use Cases

### 1. Generate Header Images for a Trip

```
"For my Edmonton trip (ID: abc123), search Unsplash for:
- 2 landmark photos
- 2 cityscape photos
- 1 nature/outdoor photo
- 1 people/tourism photo
All landscape orientation, save to wanderlog_images with
associated_section='header'"
```

### 2. Add Activity Images

```
"For the 'TELUS World of Science' activity in my Edmonton trip,
find 3 images showing science museums, interactive exhibits,
and save them associated with activity ID xyz789"
```

### 3. Find Hotel Images

```
"Search for 4 luxury hotel room images in Edmonton and
associate them with the hotel section of trip abc123"
```

### 4. Bulk Image Generation

```
"For trip abc123, generate images for all activities that
don't have images yet. Use the activity name and location
to search for relevant photos."
```

## Troubleshooting

### MCP Server Not Connecting

1. Check Claude Code is running and connected
2. Verify `.mcp.json` syntax is correct
3. Restart Claude Code
4. Check internet connection

### Authentication Failed

1. Clear Claude Code cache
2. Re-authenticate through OAuth flow
3. Check Pipedream account status
4. Verify API account connections in Pipedream dashboard

### No Images Returned

1. **Try different search terms**: Be more specific
2. **Check API quotas**: Free tiers have limits
3. **Try different providers**: Unsplash vs Pexels vs Pixabay
4. **Verify API connection**: Check Pipedream dashboard

### Image Quality Issues

1. **Specify orientation**: landscape/portrait/squarish
2. **Add quality descriptors**: "high quality", "professional"
3. **Try Unsplash first**: Generally highest quality
4. **Filter by color**: Match your site's color scheme

## Rate Limits & Quotas

### Unsplash (Free Tier)
- 50 requests per hour
- Good for development and moderate use

### Pexels (Free Tier)
- 200 requests per hour
- Excellent for production use

### Pixabay (Free Tier)
- 100 requests per minute
- Great for high-volume searches

### Pipedream (Free Tier)
- 100 requests per day across all APIs
- Upgrade to Pro for unlimited

## Security & Compliance

### Image Licensing

All images from these APIs are:
- ✅ **Free to use** for commercial projects
- ✅ **No licensing fees** required
- ✅ **Modification allowed**

**Attribution Requirements**:
- Unsplash: Required
- Pexels: Required
- Pixabay: Optional

### Credential Security

Through Pipedream MCP:
- ✅ Credentials stored securely in Claude Code
- ✅ Never exposed to AI models
- ✅ Isolated per user
- ✅ Revocable access
- ✅ No manual API key management

### Privacy

- Image searches are logged by the API providers
- No personal data sent to APIs
- Search queries may be cached
- Follow each provider's Terms of Service

## Production Recommendations

### For Your Travel App

1. **Development Phase**:
   - Use MCP servers through Claude Code
   - Find and curate images for destinations
   - Save selected images to Supabase

2. **Production Phase**:
   - Serve images from Supabase storage
   - Cache frequently used images
   - Consider paid API tiers for higher limits
   - Implement image CDN (Cloudflare, CloudFront)

3. **Best Practice**:
   - Don't fetch images on every page load
   - Pre-generate images during trip import
   - Store in Supabase with proper associations
   - Use MCP servers for new destinations only

## Cost Comparison

### Using MCP Servers (Recommended)
- **Pipedream Free**: 100 requests/day - $0/month
- **Pipedream Pro**: Unlimited requests - $29/month
- **API costs**: Free with attribution

### Direct API Integration
- **Unsplash**: Free with limits
- **Pexels**: Free with limits
- **Pixabay**: Free with limits
- **Implementation**: You manage API keys, error handling, rate limits

**Winner**: MCP servers for ease of use, direct APIs for high volume

## Getting API Keys (Optional)

If you want to use the direct API helper functions in `lib/image-search.ts`:

### Unsplash
1. Visit https://unsplash.com/oauth/applications
2. Create new application
3. Copy Access Key to `.env.local` as `UNSPLASH_ACCESS_KEY`

### Pexels
1. Visit https://www.pexels.com/api/
2. Sign up and generate API key
3. Copy to `.env.local` as `PEXELS_API_KEY`

### Pixabay
1. Visit https://pixabay.com/api/docs/
2. Sign up and get API key
3. Copy to `.env.local` as `PIXABAY_API_KEY`

## Summary

You now have access to powerful image search capabilities through:

✅ **Remote MCP servers** - No local setup required
✅ **Multiple APIs** - Unsplash, Pexels, Pixabay via Pipedream
✅ **Easy authentication** - OAuth through Claude Code
✅ **Helper functions** - `lib/image-search.ts` for direct API calls
✅ **Production ready** - Store images in Supabase for fast access

**Next Steps**:
1. Try searching for images through Claude Code
2. Authenticate with Pipedream when prompted
3. Connect Unsplash and Pexels accounts
4. Start adding location-based images to your trips!

## Example Commands to Try

```
1. "Search Unsplash for 6 Edmonton landmark photos in landscape orientation"

2. "Find images for these categories in Edmonton: landmark, food, hotel, nightlife.
   Get 2 images per category from Pexels."

3. "For trip abc123, generate header images using a mix of
   cityscape, landmark, and nature photos of the destination"

4. "Search for 'TELUS World of Science Edmonton' and save the
   top 3 images to my database"

5. "Compare images from Unsplash and Pexels for 'Edmonton river valley'
   and show me the URLs of the best 5"
```

Have fun adding beautiful, location-specific images to your travel itineraries! 🎨📸
