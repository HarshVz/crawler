import {
  chromium,
  type Browser,
  type Page,
  type BrowserContext,
} from "playwright-core";
import loadObscura from "obscura-node";
import type { IBrowserService } from "../types/index.js";

const STEALTH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const BLOCKED_RESOURCE_TYPES = [
  "image",
  "font",
  "stylesheet",
  "media",
  "xhr",
  "fetch",
  "websocket",
  "other",
];

const ANALYTICS_DOMAINS = [
  "google-analytics.com",
  "googletagmanager.com",
  "facebook.net",
  "facebook.com",
  "doubleclick.net",
  "hotjar.com",
  "newrelic.com",
  "mixpanel.com",
  "amplitude.com",
  "scorecardresearch.com",
  "adsrvr.org",
  "adservice.google.com",
  "analytics.tiktok.com",
  "bat.bing.com",
  "pixel.quantserve.com",
  "static.zdassets.com",
];

export class BrowserService implements IBrowserService {
  private browser: Browser | null = null;
  private obscura: any;
  private pageContextMap = new Map<Page, BrowserContext>();

  async getPage(): Promise<Page> {
    if (!this.browser) {
      this.obscura = await loadObscura({ stealth: true });
      this.browser = await chromium.connectOverCDP(this.obscura.endpoint);
    }

    const context = await this.browser.newContext({
      userAgent: STEALTH_UA,
      viewport: { width: 1920, height: 1080 },
      locale: "en-US",
      timezoneId: "America/New_York",
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5] as unknown as any,
      });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      Object.defineProperty(navigator, "hardwareConcurrency", {
        get: () => 8,
      });
      Object.defineProperty(navigator, "deviceMemory", {
        get: () => 8,
      });
    });

    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      const url = route.request().url();

      if (BLOCKED_RESOURCE_TYPES.includes(type)) {
        return route.abort();
      }

      try {
        const hostname = new URL(url).hostname;
        if (ANALYTICS_DOMAINS.some((d) => hostname.includes(d))) {
          return route.abort();
        }
      } catch {}

      return route.continue();
    });

    this.pageContextMap.set(page, context);
    return page;
  }

  async closePage(page: Page): Promise<void> {
    const context = this.pageContextMap.get(page);
    if (context) {
      await context.close();
      this.pageContextMap.delete(page);
    } else {
      await page.close();
    }
  }

  async closeAll(): Promise<void> {
    if (this.browser) await this.browser.close();
    if (this.obscura) await this.obscura.close();
    this.browser = null;
    this.obscura = undefined;
    this.pageContextMap.clear();
  }
}
