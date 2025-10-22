# Import Wanderlog Trips - UI Guide

## How to Use the Import Feature

### Step 1: Start your development server

```bash
pnpm dev
```

Your app will be available at http://localhost:3000

### Step 2: Navigate to the Import Page

You have two ways to get there:

**Option A: From the Homepage**
1. Go to http://localhost:3000
2. Click the **"Import Trip"** button on the homepage

**Option B: Direct URL**
- Go directly to http://localhost:3000/import

### Step 3: Import a Wanderlog Trip

1. **Paste the Wanderlog URL** in the input field
   - Example: `https://wanderlog.com/view/znjfochocj/trip-to-edmonton`

2. **(Optional) Check "Force re-import"** if you want to re-scrape a trip that already exists

3. **Click the "Import Trip" button**

4. **Wait 30-60 seconds** while the system:
   - Opens the Wanderlog page in a cloud browser
   - Extracts all trip data
   - Downloads and associates images
   - Stores everything in Supabase

5. **View the results!**
   - See trip details (title, dates, creator)
   - View statistics (flights, hotels, activities, images)
   - Get the Supabase Trip ID

## What the UI Shows

### Before Import
- Clean, simple input field with URL placeholder
- "Force re-import" checkbox for overriding existing trips
- Big, obvious "Import Trip" button
- Information card explaining what gets imported

### During Import
- Loading spinner
- "Importing... This may take 30-60 seconds" message
- Disabled input field and button

### After Import (Success)
- ✅ Green success card with checkmark
- Trip details:
  - Title
  - Creator
  - Dates
  - Trip ID in Supabase
- Beautiful statistics grid showing:
  - Number of flights (blue)
  - Number of hotels (purple)
  - Number of activities (green)
  - Number of car rentals (orange)
  - Number of days (pink)
  - Number of images (cyan)
- Image association breakdown
- Processing duration

### After Import (Error)
- ❌ Red error card with X icon
- Error message explaining what went wrong
- Helpful hints for resolution

### After Import (Already Exists)
- ⚠️ Warning that trip already exists
- Shows existing trip ID
- Hint to use "Force re-import" checkbox

## Features

### Smart Duplicate Detection
The system automatically checks if a trip has already been imported. If it has, you'll get a friendly message instead of creating a duplicate.

To override this, check the **"Force re-import"** checkbox before clicking Import.

### Keyboard Shortcuts
- Press **Enter** in the URL field to trigger import (same as clicking the button)

### Responsive Design
The UI looks great on:
- Desktop computers
- Tablets
- Mobile phones

### Dark Mode Support
The UI automatically adapts to your system's dark mode preference.

## Example Workflow

1. User visits http://localhost:3000
2. Sees two options: "New Trip Request" or "Import from Wanderlog"
3. Clicks "Import Trip"
4. Pastes: `https://wanderlog.com/view/znjfochocj/trip-to-edmonton`
5. Clicks "Import Trip" button
6. Waits ~45 seconds
7. Sees success message with:
   - Trip: "Trip to Edmonton"
   - Dates: Sun 7/13 - Sat 7/19
   - 2 flights, 3 hotels, 15 activities, 25 images
8. Can now paste another URL to import more trips

## Troubleshooting

### "Failed to connect to server"
**Solution**: Make sure your dev server is running (`pnpm dev`)

### "Invalid URL"
**Solution**: Make sure you're pasting a full Wanderlog URL that includes `wanderlog.com`

### Import takes too long or fails
**Solution**:
- Check your Browserbase credentials in `.env.local`
- Check your Supabase credentials
- Look at the terminal logs for detailed error messages
- The Wanderlog page might be temporarily unavailable

### Database connection errors
**Solution**:
- Verify you've run the SQL schema in Supabase (`supabase-schema.sql`)
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local`

## Pages Created

```
/                           # Homepage with two options
├── /questionnaire          # Original travel questionnaire
└── /import                 # NEW: Import from Wanderlog
    └── API: /api/scrape-wanderlog
```

## Navigation Flow

```
Homepage
  ├─► Start Questionnaire → /questionnaire
  └─► Import Trip → /import
       └─► Back to Home → /
```

## UI Components Used

- **Button** - Primary action buttons
- **Input** - URL input field
- **Card** - Container cards for sections
- **Icons** - Lucide React icons (Download, Link, CheckCircle, etc.)
- **Responsive Grid** - 2-column layout on desktop, stacks on mobile

## Pro Tips

1. **Keep the URL list handy**: If you're importing multiple trips, keep a list of URLs in `wanderlog-urls.txt` and copy-paste them one by one

2. **Watch the statistics**: The stats tell you if the import captured everything correctly

3. **Image associations matter**: Check the "X images associated" count - this tells you how many images were successfully linked to activities

4. **Use Force re-import sparingly**: Only use it when you need to update an existing trip with new data

5. **Check Supabase**: After importing, you can view all the data in your Supabase dashboard

## What's Next?

After importing trips, you can:
- Query the data from Supabase in your app
- Display trip itineraries to users
- Generate AI images for activities without photos
- Build trip comparison features
- Create personalized recommendations based on imported trips

Enjoy importing trips with the new UI! 🚀
