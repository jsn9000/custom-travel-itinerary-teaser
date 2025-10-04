import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stop = searchParams.get("stop") || "1";
  const viewerTag = searchParams.get("viewer") || "preview";

  // Generate a watermarked SVG placeholder
  // In production, this could:
  // 1. Fetch actual image from Wanderlog/storage
  // 2. Apply blur/pixelation
  // 3. Add viewer-specific watermark for tracking
  // 4. Return optimized image

  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${stop}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(99,102,241);stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:rgb(168,85,247);stop-opacity:0.6" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      <!-- Background with gradient -->
      <rect width="400" height="300" fill="url(#grad${stop})" />

      <!-- Blurred content area (simulating obscured image) -->
      <rect x="50" y="50" width="300" height="200" fill="white" opacity="0.3" filter="url(#blur)" />

      <!-- Lock icon -->
      <g transform="translate(180, 120)">
        <rect x="10" y="15" width="20" height="18" rx="2" fill="white" opacity="0.9" />
        <path d="M 15 15 Q 15 8, 20 8 Q 25 8, 25 15" stroke="white" stroke-width="3" fill="none" opacity="0.9" />
      </g>

      <!-- Watermark -->
      <text x="200" y="280" font-family="Arial, sans-serif" font-size="12" fill="white" opacity="0.7" text-anchor="middle">
        PREVIEW ONLY • ${viewerTag.toUpperCase()}
      </text>

      <!-- Stop indicator -->
      <text x="200" y="260" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.9" text-anchor="middle" font-weight="bold">
        Stop #${stop}
      </text>

      <!-- Unlock message -->
      <text x="200" y="160" font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.95" text-anchor="middle" font-weight="bold">
        🔒 Unlock to Reveal
      </text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
