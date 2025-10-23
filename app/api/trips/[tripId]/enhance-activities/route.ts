import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Activity {
  id: string;
  name: string;
  description?: string;
  address?: string;
  rating?: number;
  original_description?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Create OpenAI provider with API key from environment
    const apiKey = process.env.OPENAI_API_KEY || '';

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.error('❌ OPENAI_API_KEY not configured properly');
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const openai = createOpenAI({
      apiKey,
    });

    const { tripId } = await params;

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    console.log(`🎨 Starting enhancement for trip: ${tripId}`);

    // Fetch trip data to get destination
    const { data: trip, error: tripError } = await supabaseAdmin
      .from("wanderlog_trips")
      .select("title, destination")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found", details: tripError?.message },
        { status: 404 }
      );
    }

    const destination = trip.destination || trip.title || "this destination";

    // Fetch activities from wanderlog_activities table
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from("wanderlog_activities")
      .select("*")
      .eq("trip_id", tripId);

    if (activitiesError || !activities) {
      return NextResponse.json(
        { error: "Failed to fetch activities", details: activitiesError?.message },
        { status: 500 }
      );
    }

    if (activities.length === 0) {
      return NextResponse.json(
        { error: "No activities found to enhance" },
        { status: 400 }
      );
    }

    console.log(`📝 Enhancing ${activities.length} activities for ${destination}`);

    // Enhance descriptions using GPT-4o
    let enhancedCount = 0;
    const errors: string[] = [];

    for (const activity of activities) {
      try {
        console.log(`  ↳ Enhancing: ${activity.name}`);

        const prompt = `You are a travel expert writing enticing descriptions for activities and dining experiences in ${destination}.

Activity: ${activity.name}
Current Description: ${activity.description || "No description"}
Address: ${activity.address || "Unknown location"}
Rating: ${activity.rating || "N/A"} stars

Task: Write a compelling, enticing 2-3 sentence description that makes travelers excited to visit.

IMPORTANT RULES:
1. If this is a restaurant, cafe, bar, or dining venue, MUST mention the type of cuisine/food (e.g., "Italian cuisine", "farm-to-table dishes", "authentic sushi", etc.)
2. Use sensory language that helps travelers imagine the experience
3. Highlight what makes this place unique or special
4. Keep it concise but evocative (2-3 sentences max)
5. Don't use generic phrases like "quality experience" or "welcoming atmosphere"
6. Be specific about what travelers will see, do, taste, or feel

Return ONLY the description text, nothing else.`;

        const result = await generateText({
          model: openai("gpt-4o"),
          prompt,
          temperature: 0.8, // More creative
        });

        const enhancedDescription = result.text.trim();

        // Update the activity in database
        const { error: updateError } = await supabaseAdmin
          .from("wanderlog_activities")
          .update({
            description: enhancedDescription,
            original_description: activity.original_description || activity.description
          })
          .eq("id", activity.id);

        if (updateError) {
          console.error(`  ✗ Failed to update ${activity.name}:`, updateError);
          errors.push(`${activity.name}: ${updateError.message}`);
        } else {
          enhancedCount++;
          console.log(`  ✓ Enhanced: ${activity.name}`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to enhance ${activity.name}:`, error);
        errors.push(`${activity.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Enhanced ${enhancedCount}/${activities.length} activities`);

    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`);
    }

    return NextResponse.json({
      success: true,
      message: `Enhanced ${enhancedCount} out of ${activities.length} activities`,
      stats: {
        totalActivities: activities.length,
        enhancedCount,
        failedCount: errors.length,
        destination,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ Error enhancing trip:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
