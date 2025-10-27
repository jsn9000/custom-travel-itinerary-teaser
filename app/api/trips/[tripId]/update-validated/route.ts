/**
 * EXAMPLE: Validated API Route for Updating Trips
 *
 * This demonstrates how to create a secure API route for updating trip data
 * with proper validation, error handling, and authorization checks.
 *
 * Key features:
 * - Path parameter validation
 * - Request body validation
 * - Authorization (placeholder - implement based on your auth system)
 * - Optimistic locking (checks if trip exists before updating)
 * - Audit logging
 * - Type-safe responses
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  validateParams,
  validateBody,
  successResponse,
  withErrorHandling,
  NotFoundError,
  ForbiddenError,
} from '@/lib/utils/api-helpers';
import { getTripSchema, updateTripSchema } from '@/lib/validations/api-schemas';

/**
 * PATCH /api/trips/[tripId]/update-validated
 * Body: { title?, notes?, startDate?, endDate? }
 *
 * Updates trip metadata
 */
export const PATCH = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string }> }
  ) => {
    // 1. Validate path parameters
    const { tripId } = await validateParams(params, getTripSchema);

    // 2. Validate request body
    const updateData = await validateBody(request, updateTripSchema.omit({ tripId: true }));

    // 3. Authorization check (placeholder - implement based on your auth system)
    // const userId = await getUserIdFromRequest(request);
    // if (!userId) {
    //   throw new UnauthorizedError('Authentication required');
    // }

    // 4. Check if trip exists
    const { data: existingTrip, error: fetchError } = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (fetchError || !existingTrip) {
      throw new NotFoundError(`Trip with ID ${tripId} not found`);
    }

    // 5. Authorization: Check if user owns the trip (placeholder)
    // if (existingTrip.user_id !== userId) {
    //   throw new ForbiddenError('You do not have permission to update this trip');
    // }

    // 6. Validate date range if both dates are provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);

      if (end <= start) {
        throw new Error('End date must be after start date');
      }
    }

    // 7. Update trip in database
    const { data: updatedTrip, error: updateError } = await supabase
      .from('wanderlog_trips')
      .update({
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.notes && { notes: updateData.notes }),
        ...(updateData.startDate && { start_date: updateData.startDate }),
        ...(updateData.endDate && { end_date: updateData.endDate }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId)
      .select()
      .single();

    if (updateError || !updatedTrip) {
      throw new Error('Failed to update trip');
    }

    // 8. Audit log (optional - implement based on your needs)
    console.log(`Trip updated: ${tripId}`, {
      changes: updateData,
      timestamp: new Date().toISOString(),
      // userId,
    });

    // 9. Return success response
    return successResponse(
      {
        trip: {
          id: updatedTrip.id,
          title: updatedTrip.title,
          notes: updatedTrip.notes,
          startDate: updatedTrip.start_date,
          endDate: updatedTrip.end_date,
          updatedAt: updatedTrip.updated_at,
        },
        changes: updateData,
      },
      'Trip updated successfully'
    );
  }
);

/**
 * DELETE /api/trips/[tripId]/update-validated
 * Body: { confirmDelete: true }
 *
 * Deletes a trip and all related data
 */
export const DELETE = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ tripId: string }> }
  ) => {
    // 1. Validate path parameters
    const { tripId } = await validateParams(params, getTripSchema);

    // 2. Validate deletion confirmation
    const body = await request.json();
    if (body.confirmDelete !== true) {
      throw new Error('Must confirm deletion by setting confirmDelete: true');
    }

    // 3. Authorization check (placeholder)
    // const userId = await getUserIdFromRequest(request);
    // if (!userId) {
    //   throw new UnauthorizedError('Authentication required');
    // }

    // 4. Check if trip exists and user has permission
    const { data: existingTrip, error: fetchError } = await supabase
      .from('wanderlog_trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (fetchError || !existingTrip) {
      throw new NotFoundError(`Trip with ID ${tripId} not found`);
    }

    // 5. Authorization: Check if user owns the trip (placeholder)
    // if (existingTrip.user_id !== userId) {
    //   throw new ForbiddenError('You do not have permission to delete this trip');
    // }

    // 6. Delete related data first (due to foreign key constraints)
    // This ensures referential integrity
    const tables = [
      'wanderlog_images',
      'wanderlog_daily_schedules',
      'wanderlog_activities',
      'wanderlog_car_rentals',
      'wanderlog_hotels',
      'wanderlog_flights',
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('trip_id', tripId);

      if (error) {
        console.error(`Failed to delete ${table} for trip ${tripId}:`, error);
        throw new Error(`Failed to delete related data from ${table}`);
      }
    }

    // 7. Delete the trip itself
    const { error: deleteTripError } = await supabase
      .from('wanderlog_trips')
      .delete()
      .eq('id', tripId);

    if (deleteTripError) {
      throw new Error('Failed to delete trip');
    }

    // 8. Audit log
    console.log(`Trip deleted: ${tripId}`, {
      timestamp: new Date().toISOString(),
      tripTitle: existingTrip.title,
      // userId,
    });

    // 9. Return success response
    return successResponse(
      {
        deletedTripId: tripId,
        deletedTripTitle: existingTrip.title,
      },
      'Trip and all related data deleted successfully'
    );
  }
);
