import { NextResponse } from 'next/server';
import { processWithTeaserMode, type TeaserInput } from '@/lib/teaser-generator';

/**
 * POST /api/teaser-transform
 *
 * Transforms activities, dining, and airlines into non-identifying teasers
 * when TEASER_MODE is included in the prompt.
 *
 * Body:
 * {
 *   "data": TeaserInput[],
 *   "prompt": string (must include "TEASER_MODE" to activate)
 * }
 *
 * Returns: Transformed data or original data if TEASER_MODE not present
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, prompt } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of objects.' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt. Expected string.' },
        { status: 400 }
      );
    }

    // Process with TEASER_MODE check
    const result = processWithTeaserMode(data as TeaserInput[], prompt);

    return NextResponse.json({
      success: true,
      teaserModeActive: prompt.includes('TEASER_MODE'),
      data: result
    });
  } catch (error) {
    console.error('Teaser transform error:', error);
    return NextResponse.json(
      { error: 'Failed to transform data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
