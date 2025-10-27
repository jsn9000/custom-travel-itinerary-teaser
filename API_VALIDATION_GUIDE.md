## API Validation Guide

This guide explains how to implement proper API validation in the travel itinerary project using Zod schemas and helper utilities.

## Why API Validation?

Without proper validation, your API is vulnerable to:
- **Invalid data** causing database errors
- **SQL injection** and other attacks
- **Unexpected crashes** from malformed input
- **Inconsistent error messages** confusing users
- **Type mismatches** breaking TypeScript safety

## Architecture

```
┌─────────────────┐
│  API Request    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validation      │ ◄── Zod Schema
│ (api-helpers.ts)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Business Logic  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Formatted       │
│ Response        │
└─────────────────┘
```

## Files Structure

```
lib/
├── validations/
│   └── api-schemas.ts       # Zod validation schemas
└── utils/
    └── api-helpers.ts        # Validation & error handling utilities

app/api/
├── scrape-validated/         # Example: validated scrape endpoint
│   └── route.ts
└── trips/[tripId]/
    └── update-validated/     # Example: validated update endpoint
        └── route.ts
```

## Step-by-Step Implementation

### 1. Define Your Schema

Create a Zod schema in `lib/validations/api-schemas.ts`:

```typescript
import { z } from 'zod';

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format'),
  notes: z.string().max(5000).optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
```

### 2. Use Validation Helpers

In your API route (`app/api/trips/create/route.ts`):

```typescript
import { NextRequest } from 'next/server';
import {
  validateBody,
  successResponse,
  withErrorHandling,
} from '@/lib/utils/api-helpers';
import { createTripSchema } from '@/lib/validations/api-schemas';

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Validates and returns typed data
  const tripData = await validateBody(request, createTripSchema);

  // tripData is now typed as CreateTripInput
  const newTrip = await createTrip(tripData);

  return successResponse(newTrip, 'Trip created successfully', 201);
});
```

### 3. Handle Different Input Types

#### Query Parameters

```typescript
import { validateQuery } from '@/lib/utils/api-helpers';
import { paginationSchema } from '@/lib/validations/api-schemas';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { page, limit } = validateQuery(request, paginationSchema);

  const trips = await getTrips({ page, limit });

  return successResponse(trips);
});
```

#### Path Parameters

```typescript
import { validateParams } from '@/lib/utils/api-helpers';
import { getTripSchema } from '@/lib/validations/api-schemas';

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string }> }
  ) => {
    const { tripId } = await validateParams(params, getTripSchema);

    const trip = await fetchTrip(tripId);

    return successResponse(trip);
  }
);
```

## Common Patterns

### Pattern 1: Simple GET Endpoint

```typescript
// GET /api/trips/[tripId]
export const GET = withErrorHandling(
  async (request, { params }) => {
    const { tripId } = await validateParams(params, getTripSchema);

    const trip = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (!trip.data) {
      throw new NotFoundError('Trip not found');
    }

    return successResponse(trip.data);
  }
);
```

### Pattern 2: POST with Validation

```typescript
// POST /api/trips
export const POST = withErrorHandling(async (request) => {
  const tripData = await validateBody(request, createTripSchema);

  const { data, error } = await supabase
    .from('wanderlog_trips')
    .insert(tripData)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create trip');
  }

  return successResponse(data, 'Trip created', 201);
});
```

### Pattern 3: PATCH with Partial Updates

```typescript
// PATCH /api/trips/[tripId]
export const PATCH = withErrorHandling(
  async (request, { params }) => {
    const { tripId } = await validateParams(params, getTripSchema);
    const updates = await validateBody(request, updateTripSchema.partial());

    // Check ownership/permissions
    const existing = await getTrip(tripId);
    if (!existing) {
      throw new NotFoundError('Trip not found');
    }

    const { data } = await supabase
      .from('wanderlog_trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();

    return successResponse(data, 'Trip updated');
  }
);
```

### Pattern 4: DELETE with Confirmation

```typescript
// DELETE /api/trips/[tripId]
export const DELETE = withErrorHandling(
  async (request, { params }) => {
    const { tripId } = await validateParams(params, getTripSchema);
    const { confirmDelete } = await validateBody(request, deleteTripSchema);

    if (!confirmDelete) {
      throw new Error('Must confirm deletion');
    }

    await supabase
      .from('wanderlog_trips')
      .delete()
      .eq('id', tripId);

    return successResponse({ deleted: tripId }, 'Trip deleted');
  }
);
```

## Error Handling

All errors are automatically caught and formatted by `withErrorHandling`:

### Custom Error Types

```typescript
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  RateLimitError,
} from '@/lib/utils/api-helpers';

// 404
throw new NotFoundError('Trip not found');

// 401
throw new UnauthorizedError('Please log in');

// 403
throw new ForbiddenError('You cannot access this trip');

// 400
throw new ValidationError('Invalid input', errors);

// 429
throw new RateLimitError('Too many requests');

// 500 (generic)
throw new Error('Something went wrong');
```

### Error Response Format

All errors return a consistent format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

## Rate Limiting

Protect your endpoints from abuse:

```typescript
import { checkRateLimit } from '@/lib/utils/api-helpers';

export const POST = withErrorHandling(async (request) => {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  // 10 requests per minute
  checkRateLimit(clientIp, 10, 60000);

  // ... rest of handler
});
```

**Note**: The built-in rate limiter is in-memory. For production, use:
- Redis with `ioredis`
- Upstash Rate Limit
- Vercel Rate Limit (for Vercel deployments)

## Security Best Practices

### 1. Always Validate Input

```typescript
// ❌ Bad - No validation
const { tripId } = await params;
const trip = await supabase.from('trips').select('*').eq('id', tripId);

// ✅ Good - Validated
const { tripId } = await validateParams(params, getTripSchema);
const trip = await supabase.from('trips').select('*').eq('id', tripId);
```

### 2. Use Specific Error Messages

```typescript
// ❌ Bad - Reveals internal details
throw new Error(`Database query failed: ${dbError.message}`);

// ✅ Good - Generic user-facing message
console.error('DB Error:', dbError);
throw new Error('Failed to fetch trip data');
```

### 3. Check Authorization

```typescript
// ✅ Always check if user can access resource
const userId = await getUserFromSession(request);
const trip = await getTrip(tripId);

if (trip.ownerId !== userId) {
  throw new ForbiddenError('Access denied');
}
```

### 4. Sanitize Outputs

```typescript
// ✅ Don't expose sensitive data
return successResponse({
  id: user.id,
  email: user.email,
  // Don't return: password, tokens, internal IDs
});
```

## Testing Your API

### Test Invalid Input

```bash
# Missing required field
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'

# Response: 400
# {
#   "error": "Validation failed",
#   "details": [...]
# }
```

### Test Rate Limiting

```bash
# Make 11 requests quickly
for i in {1..11}; do
  curl http://localhost:3001/api/scrape?url=...
done

# 11th request returns 429
# {
#   "error": "Rate limit exceeded..."
# }
```

## Migration Guide

To migrate existing routes to the validated pattern:

### Before

```typescript
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const data = await scrapeTrip(url);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### After

```typescript
import { withErrorHandling, validateQuery, successResponse } from '@/lib/utils/api-helpers';
import { scrapeWanderlogSchema } from '@/lib/validations/api-schemas';

export const GET = withErrorHandling(async (request) => {
  const { url } = validateQuery(request, scrapeWanderlogSchema);

  const data = await scrapeTrip(url);

  return successResponse(data, 'Trip scraped successfully');
});
```

## Benefits Summary

✅ **Type Safety**: Zod schemas provide compile-time types
✅ **Consistent Errors**: All errors follow the same format
✅ **Better DX**: Less boilerplate, clearer code
✅ **Security**: Prevents injection attacks and invalid data
✅ **Maintainability**: Schemas are reusable and testable
✅ **Documentation**: Schemas serve as API documentation

## Next Steps

1. Review the example routes in:
   - `/app/api/scrape-validated/route.ts`
   - `/app/api/trips/[tripId]/update-validated/route.ts`

2. Start migrating your existing routes one at a time

3. Add authentication middleware when ready

4. Consider adding request logging and monitoring

5. Implement production-grade rate limiting with Redis

## Resources

- [Zod Documentation](https://zod.dev/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
