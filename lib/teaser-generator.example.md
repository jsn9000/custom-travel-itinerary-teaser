# Teaser Generator Usage Examples

## Overview
The Teaser Generator transforms activities, dining, and airlines into non-identifying teasers. It only activates when `TEASER_MODE` is explicitly included in the prompt.

## Basic Usage

### Via API Endpoint

```typescript
// Example: Transform Supabase activity data
const response = await fetch('/api/teaser-transform', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'TEASER_MODE - Transform these activities into teasers',
    data: [
      {
        id: '1',
        name: 'TELUS World of Science - Edmonton',
        category: 'activity',
        type: 'science_museum',
        description: 'Science centre with hands-on exhibits on robots, the human body & more, plus a separate observatory.',
        rating: 4.3
      },
      {
        id: '2',
        name: 'Edmonton Valley Zoo',
        category: 'activity',
        type: 'zoo',
        description: 'Urban zoo featuring animals from around the world',
        rating: 4.0
      }
    ]
  })
});

const result = await response.json();
console.log(result);
// {
//   "success": true,
//   "teaserModeActive": true,
//   "data": [
//     {
//       "id": "1",
//       "title": "Interactive Science Center",
//       "headerEmoji": "🌌",
//       "teaser": "Step into a world where curiosity comes alive...",
//       "tone": "family_friendly",
//       "tags": ["hands-on", "indoors", "educational", "highly rated"]
//     },
//     {
//       "id": "2",
//       "title": "Urban Wildlife Haven",
//       "headerEmoji": "🦁",
//       "teaser": "Meet incredible creatures from around the world...",
//       "tone": "family_friendly",
//       "tags": ["wildlife", "outdoors", "family"]
//     }
//   ]
// }
```

### Direct Function Usage

```typescript
import { transformToTeaser, type TeaserInput } from '@/lib/teaser-generator';

const activity: TeaserInput = {
  id: '1',
  name: 'Ruth\'s Steakhouse',
  category: 'dining',
  type: 'restaurant',
  description: 'Upscale steakhouse offering prime cuts, seafood, and fine wines',
  rating: 4.8
};

const teaser = transformToTeaser(activity);
console.log(teaser);
// {
//   "id": "1",
//   "title": "Elegant Dining Experience",
//   "headerEmoji": "🍷",
//   "teaser": "An upscale retreat where expertly prepared dishes...",
//   "tone": "luxury",
//   "tags": ["fine dining", "evening", "upscale", "highly rated"]
// }
```

### Batch Transformation

```typescript
import { processWithTeaserMode } from '@/lib/teaser-generator';

const activities = [
  { id: '1', name: 'Activity A', category: 'activity', type: 'museum' },
  { id: '2', name: 'Restaurant B', category: 'dining', type: 'restaurant' },
  { id: '3', name: 'Hotel C', category: 'lodging', type: 'hotel' } // Not in scope
];

// With TEASER_MODE - transforms activities and dining
const teasers = processWithTeaserMode(
  activities,
  'TEASER_MODE - Transform these records'
);

// Without TEASER_MODE - returns unchanged
const unchanged = processWithTeaserMode(
  activities,
  'Regular mode'
);
```

## Scope

The transformer only processes records with these categories/types:
- `activity` / `activities`
- `dining` / `restaurant` / `food`
- `airline` / `flight`

All other categories (hotels, cars, etc.) are returned unchanged.

## Category Mappings

| Category | Descriptor | Emoji | Tone | Tags |
|----------|-----------|-------|------|------|
| science_museum | interactive science center | 🌌 | family_friendly | hands-on, indoors, educational |
| zoo | urban wildlife haven | 🦁 | family_friendly | wildlife, outdoors, family |
| garden | serene botanical paradise | 🌸 | romantic | nature, peaceful, beautiful |
| restaurant | hidden culinary gem | 🍽️ | culinary | dining, local, flavors |
| cafe | cozy corner café | ☕ | balanced | casual, coffee, cozy |
| fine_dining | elegant dining experience | 🍷 | luxury | fine dining, evening, upscale |
| airline | premium air carrier | ✈️ | travel | flight, comfortable, reliable |

## Integration with Teaser Page

```typescript
// In your teaser page component
useEffect(() => {
  async function loadTeaserData() {
    const response = await fetch('/api/teaser-transform', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'TEASER_MODE - Transform for public teaser page',
        data: tripData.activities
      })
    });

    const { data } = await response.json();
    setTeaserActivities(data);
  }

  if (showTeaser) {
    loadTeaserData();
  }
}, [tripData, showTeaser]);
```

## Testing

```bash
# Test the API endpoint
curl -X POST http://localhost:3000/api/teaser-transform \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "TEASER_MODE",
    "data": [{
      "id": "1",
      "name": "Test Activity",
      "category": "activity",
      "type": "museum"
    }]
  }'
```

## Guardrails

The transformer ensures:
- ✅ Never outputs actual names or addresses
- ✅ No links, prices, or CTAs
- ✅ No copied text - all paraphrased
- ✅ Tasteful generic copy if input is sparse
- ✅ Returns JSON only (no markdown when used via API)
