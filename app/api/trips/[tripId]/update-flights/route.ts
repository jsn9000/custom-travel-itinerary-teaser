import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    // Get flights for this trip
    const { data: flights, error: fetchError } = await supabaseAdmin
      .from('wanderlog_flights')
      .select('*')
      .eq('trip_id', tripId);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Update each flight
    const updates = flights?.map(async (flight) => {
      let newDescription = '';

      // Based on price, assign appropriate seating class
      if (flight.price >= 700) {
        newDescription = 'Premium Economy Seating';
      } else if (flight.price >= 500) {
        newDescription = 'Economy Plus Seating';
      } else if (flight.price >= 400) {
        newDescription = 'Standard Economy Seating';
      } else {
        newDescription = 'Basic Economy Seating';
      }

      const { error } = await supabaseAdmin
        .from('wanderlog_flights')
        .update({ airline: newDescription })
        .eq('id', flight.id);

      return { id: flight.id, error, oldName: flight.airline, newName: newDescription };
    });

    const results = await Promise.all(updates || []);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        message: 'Some updates failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'All flights updated successfully',
      updates: results
    });
  } catch (error) {
    console.error('Error updating flights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
