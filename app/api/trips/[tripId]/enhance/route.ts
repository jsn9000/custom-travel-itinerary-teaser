import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Activity {
  id: string;
  name: string;
  description?: string;
  address?: string;
  rating?: number;
  images?: Array<{ url: string; alt: string; position: number }>;
  [key: string]: any;
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
        { error: "OpenAI API key not configured" },
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

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch trip data
    const { data: trip, error: tripError } = await supabase
      .from("wanderlog_trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found", details: tripError?.message },
        { status: 404 }
      );
    }

    const metadata = trip.metadata as any || {};
    const activities = metadata.activities || [];
    const destination = metadata.creator || trip.destination || "this destination";

    if (activities.length === 0) {
      return NextResponse.json(
        { error: "No activities found to enhance" },
        { status: 400 }
      );
    }

    console.log(`📝 Enhancing ${activities.length} activities for ${destination}`);

    // Enhance descriptions using GPT-4o
    const enhancedActivities = await Promise.all(
      activities.map(async (activity: Activity, index: number) => {
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

          return {
            ...activity,
            description: enhancedDescription,
            originalDescription: activity.description, // Keep original for reference
            enhanced: true,
          };
        } catch (error) {
          console.error(`  ✗ Failed to enhance ${activity.name}:`, error);
          // Return original activity if enhancement fails
          return activity;
        }
      })
    );

    console.log(`✅ Enhanced ${enhancedActivities.filter((a: any) => a.enhanced).length}/${activities.length} activities`);

    // Update trip metadata with enhanced activities
    const updatedMetadata = {
      ...metadata,
      activities: enhancedActivities,
      lastEnhanced: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("wanderlog_trips")
      .update({ metadata: updatedMetadata })
      .eq("id", tripId);

    if (updateError) {
      console.error("❌ Failed to save enhancements:", updateError);
      return NextResponse.json(
        { error: "Failed to save enhancements", details: updateError.message },
        { status: 500 }
      );
    }

    console.log("🎉 Enhancements saved successfully!");

    return NextResponse.json({
      success: true,
      message: "Trip descriptions enhanced successfully",
      stats: {
        totalActivities: activities.length,
        enhancedCount: enhancedActivities.filter((a: any) => a.enhanced).length,
        destination,
      },
      enhancedActivities: enhancedActivities.slice(0, 3), // Return sample
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
