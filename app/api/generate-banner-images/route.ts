import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";

export async function POST() {
  try {
    const prompts = [
      "A stunning photograph of people dining at a seaside Mediterranean taverna during golden hour, crystal clear turquoise water in background, fresh seafood on table, warm sunset lighting, luxury travel photography style",
      "A breathtaking aerial view of a private boat sailing through crystal-clear Mediterranean waters between small islands, dramatic cliffs, vibrant blue and turquoise colors, professional travel photography",
      "A beautiful photograph of ancient Mediterranean architecture, white-washed buildings with blue domes, narrow cobblestone streets, bougainvillea flowers, sunny day, luxury travel magazine style",
      "A luxurious photograph of people wine tasting at a Mediterranean vineyard, rolling hills of grapevines, sunset golden hour lighting, elegant wine glasses, sophisticated travel photography style",
    ];

    const imageUrls: string[] = [];

    // Use OpenAI directly via fetch since @ai-sdk/openai doesn't expose image generation
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    for (let i = 0; i < prompts.length; i++) {
      console.log(`Generating image ${i + 1}/${prompts.length}...`);

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompts[i],
          n: 1,
          size: "1792x1024",
          quality: "hd",
          style: "natural",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Error generating image ${i + 1}:`, error);
        continue;
      }

      const data = await response.json();
      imageUrls.push(data.data[0].url);
      console.log(`Image ${i + 1} generated successfully`);
    }

    return NextResponse.json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
