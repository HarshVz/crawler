import { chromium, type Page } from "playwright";
import type { Browser } from "playwright";
import { NodeHtmlMarkdown } from "node-html-markdown";
import fs from "fs";
import path from "path";
import os from "os";

class ScrapperServices {
  website: string;
  path: string;
  timeout: number;
  depth: number;
  format: string;
  screenshots: boolean;
  browser: Browser | null = null;
  selectors: string[];

  constructor(
    website: string,
    depth: number = -1,
    customPath?: string,
    format: string = "md",
    screenshots: boolean = false,
    selectors: string[] = [],
  ) {
    this.website = website;
    this.path = customPath || path.join(os.homedir(), "knowledgeBase");
    this.timeout = 60000;
    this.depth = depth;
    this.format = format;
    this.screenshots = screenshots;
    this.selectors = selectors;

    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path, { recursive: true });
    }
  }

  async launchBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch();
    }
    return this.browser;
  }

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await this.launchBrowser();
    }
    return this.browser;
  }

  buildFilePath = (endpoint: string) => {
    const safeName =
      endpoint === "/" ? "home" : endpoint.replace(/[^a-zA-Z0-9]/g, "_");

    const hostname = new URL(this.website).hostname;
    const folderName = hostname.replace(/[^a-zA-Z0-9]/g, "");
    const screenshotsDir = path.join(this.path, folderName);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const filePath = path.join(screenshotsDir, `${safeName}.png`);
    return filePath;
  };

  buildContentPath = (endpoint: string) => {
    const safeName =
      endpoint === "/" ? "home" : endpoint.replace(/[^a-zA-Z0-9]/g, "_");

    const hostname = new URL(this.website).hostname;
    const folderName = hostname.replace(/[^a-zA-Z0-9]/g, "");

    const screenshotsDir = path.join(this.path, folderName);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const filePath = path.join(screenshotsDir, `${safeName}.md`);
    return filePath;
  };

  writeFile = (filePath: string, data: string) => {
    try {
      fs.writeFileSync(filePath, data);
    } catch (error) {
      console.error(error);
    }
  };

  getLinks = async (page: Page): Promise<string[]> => {
    const links = await page.$$eval(
      "a[href]",
      (elements, website) => {
        const baseUrl = new URL(website);
        const uniquePaths = new Set<string>();

        elements.forEach((el) => {
          try {
            const href = el.getAttribute("href");
            if (!href) return;

            // skip invalid links
            if (
              href.startsWith("#") ||
              href.startsWith("javascript:") ||
              href.startsWith("mailto:") ||
              href.startsWith("tel:")
            ) {
              return;
            }

            const linkUrl = new URL(href, website);

            // same domain only
            if (linkUrl.origin !== baseUrl.origin) return;

            // skip files
            const skipExtensions = [
              ".pdf",
              ".jpg",
              ".jpeg",
              ".png",
              ".gif",
              ".svg",
              ".zip",
              ".rar",
              ".doc",
              ".docx",
              ".xls",
              ".xlsx",
            ];

            const pathname = linkUrl.pathname.toLowerCase();

            if (skipExtensions.some((ext) => pathname.endsWith(ext))) {
              return;
            }

            // normalize path
            let path = linkUrl.pathname;

            // remove trailing slash
            if (path !== "/" && path.endsWith("/")) {
              path = path.slice(0, -1);
            }

            // normalize query params (sorted)
            const params = new URLSearchParams(linkUrl.search);
            params.sort();

            const normalizedSearch = params.toString();
            if (normalizedSearch) {
              path += `?${normalizedSearch}`;
            }

            uniquePaths.add(path);
          } catch (e) {}
        });

        return Array.from(uniquePaths);
      },
      this.website,
    );

    return links;
  };

  countBackslashes = (path: string) => {
    return path.split("/").length - 1;
  };

  /**
   * Extracts structured content from the page with tag names and text
   * @param page - Playwright Page object
   * @returns Array of objects with tag name and text content
   */
  extractStructuredContent = async (
    page: Page,
  ): Promise<Array<{ tag: string; text: string }>> => {
    const structuredData = await page.$$eval(
      "h1, h2, h3, h4, h5, h6, p, span, li, a, strong, em, code, pre",
      (elements) => {
        return elements
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.trim() || "",
          }))
          .filter((item) => item.text.length > 0); // Filter out empty elements
      },
    );
    return structuredData;
  };

  dfsScrape = async (
    endpoint: string = "/",
    results: string[] = [],
    visited: Record<string, boolean> = {},
  ) => {
    const stack = [endpoint];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) break;
      if (visited[current]) continue;
      visited[current] = true;

      const curr_depth = this.countBackslashes(current);
      if (this.depth != -1) {
        if (curr_depth > this.depth) continue;
      }

      console.log("   ".repeat(curr_depth) + `-> Processing ${current}`);
      results.push(current);

      const links = await this.extractEntirePage(current);
      for (const link of links) {
        if (!visited[link]) {
          stack.push(link);
        }
      }
    }
  };

  bfsScrape = async (
    endpoint: string = "/",
    results: string[] = [],
    visited: Record<string, boolean> = {},
  ) => {
    const queue = [endpoint];
    while (queue.length > 0) {
      const size = queue.length;
      for (let i = 0; i < size; i++) {
        const current = queue.shift();
        if (!current) break;
        if (visited[current]) continue;
        visited[current] = true;

        const curr_depth = this.countBackslashes(current);
        if (this.depth != -1) {
          if (curr_depth > this.depth) continue;
        }

        console.log("   ".repeat(curr_depth) + `-> Processing ${current}`);

        results.push(current);
        const links = await this.extractEntirePage(current);
        for (const link of links) {
          if (!visited[link]) {
            queue.push(link);
          }
        }
      }
    }
  };

  // extractHTML = async (page: Page) => {
  //   const selectors = ["#dept-content", ".container"];

  //   for (const selector of selectors) {
  //     const loc = page.locator(selector).first();
  //     if (await loc.count()) {
  //       return await loc.evaluate((el) => el.outerHTML);
  //     }
  //   }

  //   return await page.content(); // fallback full HTML
  // };

  extractHTML = async (page: Page): Promise<string> => {
    const results: string[] = [];

    for (const rule of this.selectors) {
      const extractAll = rule.startsWith("*");
      const selector = extractAll ? rule.slice(1).trim() : rule.trim();

      if (extractAll) {
        // extract ALL matching elements
        const htmlArray = await page
          .locator(selector)
          .evaluateAll((els) => els.map((el) => el.outerHTML));

        results.push(...htmlArray);
      } else {
        // extract FIRST matching element
        const loc = page.locator(selector).first();

        if (await loc.count()) {
          const html = await loc.evaluate((el) => el.outerHTML);
          results.push(html);
        }
      }
    }

    if (results.length > 0) {
      return results.join("\n");
    }

    return await page.content(); // fallback
  };

  // extractEntirePage = async (endpoint: string = "/") => {
  //   const browser = await this.getBrowser();
  //   const page = await browser.newPage();

  //   // Properly construct URL to avoid double slashes
  //   const originUrl = new URL(this.website).origin;
  //   const fullUrl = `${originUrl}${endpoint}`;

  //   try {
  //     await page.goto(fullUrl, {
  //       waitUntil: "networkidle",
  //       timeout: this.timeout,
  //     });
  //   } catch (error: any) {
  //     console.error(`Failed to navigate to ${fullUrl}:`, error.message);
  //     await browser.close();
  //     return [];
  //   }
  //   // Extract structured content
  //   const html = await this.extractHTML(page);
  //   const structuredContent = NodeHtmlMarkdown.translate(html);

  //   //2. build path and take screenshot.
  //   const filePath = this.buildFilePath(endpoint);
  //   if (this.screenshots) {
  //     await page.screenshot({
  //       path: filePath,
  //       fullPage: true,
  //     });
  //   }

  //   // Save structured data as JSON
  //   const contentPath = this.buildContentPath(endpoint);
  //   const jsonPath = contentPath.replace(".md", ".json");

  //   const fullData = {
  //     content: structuredContent,
  //   };

  //   if (this.format === "json")
  //     this.writeFile(jsonPath, JSON.stringify(fullData, null, 2));

  //   if (this.format === "md") this.writeFile(contentPath, structuredContent);

  //   //scrape current page Links;
  //   const links = await this.getLinks(page);
  //   return links;
  // };

  extractEntirePage = async (endpoint: string = "/") => {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    const originUrl = new URL(this.website).origin;
    const fullUrl = `${originUrl}${endpoint}`;

    try {
      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded", // better than networkidle
        timeout: this.timeout,
      });
    } catch (error: any) {
      console.error(`Failed to navigate to ${fullUrl}:`, error.message);

      await page.close(); // ✅ close only page
      return []; // ✅ skip and continue crawling
    }

    try {
      // Extract metadata - using $eval to safely handle missing meta tags
      const deptTitle = await page
        .$eval(".dept-title", (el) => el.textContent?.trim())
        .catch(() => null);

      const sourceMeta = {
        url: page.url(),
        pathname: new URL(page.url()).pathname,
        domain: new URL(page.url()).origin,
        visitedTime: new Date().toISOString(),
        title: deptTitle || (await page.title()),
      };

      // Extract HTML
      const html = await this.extractHTML(page);
      const structuredContent = NodeHtmlMarkdown.translate(html);

      // Build file path
      const filePath = this.buildFilePath(endpoint);

      if (this.screenshots) {
        await page.screenshot({
          path: filePath,
          fullPage: true,
        });
      }

      // Save content
      const contentPath = this.buildContentPath(endpoint);
      const jsonPath = contentPath.replace(".md", ".json");

      const fullData = {
        metadata: sourceMeta,
        content: structuredContent,
      };

      if (this.format === "json") {
        this.writeFile(jsonPath, JSON.stringify(fullData, null, 2));
      }

      if (this.format === "md") {
        const finalMarkdownData = this.generateMarkdown(
          structuredContent,
          sourceMeta,
        );
        this.writeFile(contentPath, finalMarkdownData);
      }

      // Extract links
      const links = await this.getLinks(page);
      await page.close(); // ✅ always close page after work

      return links;
    } catch (error: any) {
      console.error(`Failed processing ${fullUrl}:`, error.message);

      await page.close(); // ✅ safe cleanup
      return [];
    }
  };

  generateMarkdown(content: string, metadata: any): string {
    const frontmatter = `---
        url: ${metadata.url}
        pathname: ${metadata.pathname}
        domain: ${metadata.domain}
        title: ${metadata.title}
        visitedTime: ${metadata.visitedTime}
        crawledAt: ${new Date().toISOString()}
        ---

        `;
    return frontmatter + content;
  }

  // useBrowser = async (endpoint: string = "/") => {
  //   let browser;
  //   try {
  //     browser = await chromium.launch();
  //   } catch (error: any) {
  //     console.error("\n❌ Error: Chromium browser not found!");
  //     console.error("Please install Playwright browsers by running:");
  //     console.error("  npx playwright install chromium\n");
  //     throw error;
  //   }

  //   const page = await browser.newPage();

  //   // Properly construct URL to avoid double slashes
  //   const originUrl = new URL(this.website).origin;
  //   const fullUrl = `${originUrl}${endpoint}`;

  //   try {
  //     await page.goto(fullUrl, {
  //       waitUntil: "networkidle",
  //       timeout: this.timeout,
  //     });
  //   } catch (error: any) {
  //     console.error(`Failed to navigate to ${fullUrl}:`, error.message);
  //     await browser.close();
  //     return [];
  //   }

  //   // Extract metadata - using $eval to safely handle missing meta tags
  //   const metadata = {
  //     title: await page.title(),
  //     description: await page
  //       .$eval('meta[name="description"]', (el) => el.getAttribute("content"))
  //       .catch(() => null),
  //     robots: await page
  //       .$eval('meta[name="robots"]', (el) => el.getAttribute("content"))
  //       .catch(() => null),
  //     googlebot: await page
  //       .$eval('meta[name="googlebot"]', (el) => el.getAttribute("content"))
  //       .catch(() => null),
  //     og: await page
  //       .$$eval('meta[property^="og:"]', (metas) =>
  //         Object.fromEntries(
  //           metas.map((m) => [
  //             m.getAttribute("property"),
  //             m.getAttribute("content"),
  //           ]),
  //         ),
  //       )
  //       .catch(() => ({})),
  //     twitter: await page
  //       .$$eval('meta[name^="twitter:"]', (metas) =>
  //         Object.fromEntries(
  //           metas.map((m) => [
  //             m.getAttribute("name"),
  //             m.getAttribute("content"),
  //           ]),
  //         ),
  //       )
  //       .catch(() => ({})),
  //   };

  //   // Extract structured content
  //   const structuredContent = await this.extractStructuredContent(page);

  //   //2. build path and take screenshot.
  //   const filePath = this.buildFilePath(endpoint);
  //   await page.screenshot({
  //     path: filePath,
  //     fullPage: true,
  //   });

  //   // Save structured data as JSON
  //   const contentPath = this.buildContentPath(endpoint);
  //   const jsonPath = contentPath.replace(".md", ".json");

  //   const fullData = {
  //     metadata,
  //     content: structuredContent,
  //   };

  //   if (this.format === "json")
  //     this.writeFile(jsonPath, JSON.stringify(fullData, null, 2));

  //   // Also save a formatted markdown version
  //   let markdownContent = this.toMarkdown(
  //     metadata,
  //     endpoint,
  //     structuredContent,
  //   );
  //   if (this.format === "md") this.writeFile(contentPath, markdownContent);

  //   //scrape current page Links;
  //   const links = await this.getLinks(page);
  //   await browser.close();
  //   return links;
  // };

  // toMarkdown(metadata: any, endpoint: string, structuredContent: any) {
  //   // Also save a formatted markdown version
  //   let markdownContent = `# ${metadata.title}\n\n`;
  //   markdownContent += `**URL:** ${endpoint}\n\n`;
  //   if (metadata.description) {
  //     markdownContent += `**Description:** ${metadata.description}\n\n`;
  //   }
  //   markdownContent += `---\n\n`;

  //   // Format structured content as markdown
  //   structuredContent.forEach((item: any) => {
  //     if (item.tag.startsWith("h")) {
  //       const level = parseInt(item.tag.charAt(1));
  //       markdownContent += `${"#".repeat(level)} ${item.text}\n\n`;
  //     } else if (item.tag === "p") {
  //       markdownContent += `${item.text}\n\n`;
  //     } else if (item.tag === "li") {
  //       markdownContent += `- ${item.text}\n`;
  //     } else if (item.tag === "code" || item.tag === "pre") {
  //       markdownContent += `\`${item.text}\`\n\n`;
  //     } else {
  //       markdownContent += `${item.text}\n`;
  //     }
  //   });

  //   return markdownContent;
  // }
}

export default ScrapperServices;
