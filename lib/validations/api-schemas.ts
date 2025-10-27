/**
 * API Validation Schemas
 *
 * Zod schemas for validating API requests across the application.
 * These schemas ensure type safety and proper input validation.
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL format');

/**
 * Wanderlog URL validation schema
 */
export const wanderlogUrlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    (url) => url.includes('wanderlog.com'),
    'URL must be a wanderlog.com URL'
  );

/**
 * Date string validation (ISO 8601)
 */
export const dateStringSchema = z.string().datetime('Invalid date format');

/**
 * Currency code validation (ISO 4217)
 */
export const currencySchema = z
  .string()
  .length(3, 'Currency code must be 3 characters')
  .toUpperCase();

/**
 * Price validation (positive number with max 2 decimal places)
 */
export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .multipleOf(0.01, 'Price can have at most 2 decimal places');

// ============================================================================
// Trip Schemas
// ============================================================================

/**
 * Schema for scraping a Wanderlog trip
 * Used in: /api/scrape
 */
export const scrapeWanderlogSchema = z.object({
  url: wanderlogUrlSchema,
  force: z.boolean().optional().default(false),
});

/**
 * Schema for getting a trip by ID
 * Used in: /api/trips/[tripId]
 */
export const getTripSchema = z.object({
  tripId: uuidSchema,
});

/**
 * Schema for updating trip metadata
 * Used in: /api/trips/[tripId] (PATCH)
 */
export const updateTripSchema = z.object({
  tripId: uuidSchema,
  title: z.string().min(1, 'Title is required').max(255).optional(),
  notes: z.string().max(5000).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});

/**
 * Schema for deleting a trip
 * Used in: /api/trips/[tripId] (DELETE)
 */
export const deleteTripSchema = z.object({
  tripId: uuidSchema,
  confirmDelete: z.literal(true).refine((val) => val === true, {
    message: 'Must confirm deletion',
  }),
});

// ============================================================================
// Flight Schemas
// ============================================================================

/**
 * Schema for updating flight information
 * Used in: /api/trips/[tripId]/update-flights
 */
export const updateFlightSchema = z.object({
  tripId: uuidSchema,
  flightId: uuidSchema,
  airline: z.string().min(1).max(100).optional(),
  departureAirport: z.string().length(3).optional(),
  arrivalAirport: z.string().length(3).optional(),
  departureTime: dateStringSchema.optional(),
  arrivalTime: dateStringSchema.optional(),
  price: priceSchema.optional(),
  currency: currencySchema.optional(),
});

/**
 * Schema for creating a new flight
 */
export const createFlightSchema = z.object({
  tripId: uuidSchema,
  airline: z.string().min(1, 'Airline is required').max(100),
  departureAirport: z.string().length(3, 'Must be 3-letter airport code'),
  arrivalAirport: z.string().length(3, 'Must be 3-letter airport code'),
  departureTime: dateStringSchema,
  arrivalTime: dateStringSchema,
  price: priceSchema,
  currency: currencySchema,
  baggageOptions: z.string().optional(),
});

// ============================================================================
// Hotel Schemas
// ============================================================================

/**
 * Schema for updating hotel information
 */
export const updateHotelSchema = z.object({
  tripId: uuidSchema,
  hotelId: uuidSchema,
  name: z.string().min(1).max(255).optional(),
  address: z.string().max(500).optional(),
  roomType: z.string().max(100).optional(),
  price: priceSchema.optional(),
  currency: currencySchema.optional(),
  rating: z.number().min(0).max(5).optional(),
  amenities: z.array(z.string()).optional(),
});

/**
 * Schema for creating a new hotel
 */
export const createHotelSchema = z.object({
  tripId: uuidSchema,
  name: z.string().min(1, 'Hotel name is required').max(255),
  address: z.string().max(500).optional(),
  roomType: z.string().max(100),
  price: priceSchema,
  currency: currencySchema,
  rating: z.number().min(0).max(5).optional(),
  amenities: z.array(z.string()).optional(),
});

// ============================================================================
// Activity Schemas
// ============================================================================

/**
 * Schema for enhancing activity descriptions
 * Used in: /api/trips/[tripId]/enhance-activities
 */
export const enhanceActivitiesSchema = z.object({
  tripId: uuidSchema,
  activityIds: z.array(uuidSchema).optional(), // If empty, enhance all activities
});

/**
 * Schema for updating activity information
 */
export const updateActivitySchema = z.object({
  tripId: uuidSchema,
  activityId: uuidSchema,
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  hours: z.string().max(255).optional(),
  rating: z.number().min(0).max(5).optional(),
  address: z.string().max(500).optional(),
  contact: z.string().max(255).optional(),
});

// ============================================================================
// Payment Schemas
// ============================================================================

/**
 * Schema for checkout request
 * Used in: /api/checkout
 */
export const checkoutSchema = z.object({
  tripId: uuidSchema,
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().min(1, 'Name is required').max(255),
  selectedFlightId: uuidSchema.optional(),
  selectedHotelId: uuidSchema.optional(),
  amount: priceSchema,
  currency: currencySchema,
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Schema for pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Schema for listing trips with filters
 * Used in: /api/trips/list
 */
export const listTripsSchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  sortBy: z.enum(['created_at', 'start_date', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type ScrapeWanderlogInput = z.infer<typeof scrapeWanderlogSchema>;
export type GetTripInput = z.infer<typeof getTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type DeleteTripInput = z.infer<typeof deleteTripSchema>;
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;
export type CreateFlightInput = z.infer<typeof createFlightSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type EnhanceActivitiesInput = z.infer<typeof enhanceActivitiesSchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ListTripsInput = z.infer<typeof listTripsSchema>;
