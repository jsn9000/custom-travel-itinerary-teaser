import Browserbase from '@browserbasehq/sdk';
import { chromium } from 'playwright';

/**
 * Browserbase integration for Next.js
 *
 * This module provides utilities for browser automation using Browserbase
 * with Playwright for web scraping, testing, and automation tasks.
 */

interface BrowserbaseConfig {
  apiKey: string;
  projectId: string;
}

interface BrowserSessionOptions {
  timeout?: number;
  keepAlive?: boolean;
}

/**
 * Initialize Browserbase client with environment variables
 */
export function initBrowserbase(): Browserbase {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error(
      'Missing Browserbase credentials. Please set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID in .env.local'
    );
  }

  return new Browserbase({
    apiKey,
  });
}

/**
 * Create a browser session and return Playwright browser instance
 *
 * @param options - Optional session configuration
 * @returns Promise with browser instance and session ID
 */
export async function createBrowserSession(options?: BrowserSessionOptions) {
  const browserbase = initBrowserbase();
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('BROWSERBASE_PROJECT_ID is not set');
  }

  // Create a new session
  const session = await browserbase.sessions.create({
    projectId,
    keepAlive: options?.keepAlive ?? false,
  });

  console.log(`🌐 Browserbase session created: ${session.id}`);

  // Connect to the browser via CDP
  const browser = await chromium.connectOverCDP(session.connectUrl);

  return {
    browser,
    sessionId: session.id,
    connectUrl: session.connectUrl,
  };
}

/**
 * Example: Scrape a website using Browserbase
 *
 * @param url - The URL to scrape
 * @returns The page title and content
 */
export async function scrapeWebsite(url: string) {
  let browser;

  try {
    const { browser: browserInstance } = await createBrowserSession();
    browser = browserInstance;

    // Get the default context and page
    const context = browser.contexts()[0];
    const page = context.pages()[0];

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle' });

    // Extract data
    const title = await page.title();
    const content = await page.content();

    console.log(`✅ Successfully scraped: ${title}`);

    return {
      title,
      content,
      url,
    };
  } catch (error) {
    console.error('❌ Error scraping website:', error);
    throw error;
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Example: Take a screenshot of a website
 *
 * @param url - The URL to screenshot
 * @returns Buffer containing the screenshot
 */
export async function takeScreenshot(url: string): Promise<Buffer> {
  let browser;

  try {
    const { browser: browserInstance } = await createBrowserSession();
    browser = browserInstance;

    const context = browser.contexts()[0];
    const page = context.pages()[0];

    await page.goto(url, { waitUntil: 'networkidle' });

    const screenshot = await page.screenshot({ fullPage: true });

    console.log(`📸 Screenshot captured for: ${url}`);

    return screenshot;
  } catch (error) {
    console.error('❌ Error taking screenshot:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Example: Execute custom Playwright code in a Browserbase session
 *
 * @param callback - Function that receives page and context to execute custom logic
 * @returns Result from the callback function
 */
export async function executeBrowserTask<T>(
  callback: (page: any, context: any) => Promise<T>
): Promise<T> {
  let browser;

  try {
    const { browser: browserInstance } = await createBrowserSession();
    browser = browserInstance;

    const context = browser.contexts()[0];
    const page = context.pages()[0];

    const result = await callback(page, context);

    return result;
  } catch (error) {
    console.error('❌ Error executing browser task:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
