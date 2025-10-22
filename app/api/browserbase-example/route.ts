import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, takeScreenshot, executeBrowserTask } from '@/lib/browserbase';

/**
 * Example API route demonstrating Browserbase usage
 *
 * GET /api/browserbase-example?url=https://example.com&action=scrape
 *
 * Actions:
 * - scrape: Scrape the website and return title and content
 * - screenshot: Take a screenshot of the website
 * - custom: Execute custom browser task (example)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const action = searchParams.get('action') || 'scrape';

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'scrape': {
        const data = await scrapeWebsite(url);
        return NextResponse.json({
          success: true,
          data,
        });
      }

      case 'screenshot': {
        const screenshot = await takeScreenshot(url);
        return new NextResponse(Buffer.from(screenshot), {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="screenshot-${Date.now()}.png"`,
          },
        });
      }

      case 'custom': {
        // Example: Get all links on the page
        const result = await executeBrowserTask(async (page) => {
          await page.goto(url, { waitUntil: 'networkidle' });

          const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
              .map((a) => ({
                text: a.textContent?.trim(),
                href: a.href,
              }))
              .filter((link) => link.text && link.href);
          });

          return {
            url,
            linkCount: links.length,
            links: links.slice(0, 10), // Return first 10 links
          };
        });

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: scrape, screenshot, or custom' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Browserbase API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute browser task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
