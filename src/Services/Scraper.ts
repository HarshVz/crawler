import { type Page } from "playwright-core";
import { BrowserService } from "./BrowserService.js";
import ContentExtractor from "./ContentExtractor.js";
import FileService from "./FileService.js";

export interface ScraperOptions {
  depth?: number;
  format?: "md" | "json" | "csv";
  delay?: number;
  outputPath?: string;
  selectors?: string[];
  tags?: string;
}

class Scraper {
  private website: string;
  private baseSegments: number;
  private depth: number;
  private format: "md" | "json" | "csv";
  private delay: number;
  private selectors: string[];
  private tags: string | undefined;
  private fileService: FileService;
  private browserService: BrowserService;

  constructor(website: string, options?: ScraperOptions) {
    this.website = website;
    const url = new URL(website);
    const basePath = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
    this.baseSegments = basePath === "/" ? 0 : basePath.split("/").filter(Boolean).length;
    this.depth = options?.depth ?? -1;
    this.format = options?.format ?? "md";
    this.delay = options?.delay ?? 0;
    this.selectors = options?.selectors ?? [];
    this.tags = options?.tags || undefined;
    this.fileService = new FileService(options?.outputPath);
    this.browserService = new BrowserService();
  }

  private relativeDepth(path: string): number {
    const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
    if (normalized === "/") return 0;
    const segments = normalized.split("/").filter(Boolean).length;
    return segments - this.baseSegments;
  }

  private async processPage(page: Page, endpoint: string): Promise<string[]> {
    const originUrl = new URL(this.website).origin;
    const fullUrl = `${originUrl}${endpoint}`;

    await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 60000 });

    const extractor = new ContentExtractor(page);
    const basicDetails = await extractor.getBasicDetails();
    const structuredContent = await extractor.getStructuredContent(this.tags);

    if (this.selectors.length > 0) {
      const selectorContent = await extractor.getContentBySelectors(this.selectors);
      this.fileService.saveCsv(this.website, endpoint, extractor.toCsv(selectorContent));
    }

    if (this.format === "json") {
      this.fileService.saveJson(this.website, endpoint, {
        metadata: basicDetails,
        content: structuredContent,
      });
    } else if (this.format === "csv") {
      this.fileService.saveCsv(this.website, endpoint, extractor.toCsv(structuredContent));
    } else {
      this.fileService.saveMarkdown(
        this.website,
        endpoint,
        extractor.toMarkdown(basicDetails, structuredContent),
      );
    }

    const links = await page.$$eval("a[href]", (elements, website) => {
      const baseUrl = new URL(website);
      const uniquePaths = new Set<string>();
      for (const el of elements) {
        try {
          const href = el.getAttribute("href");
          if (!href) continue;
          const linkUrl = new URL(href, website);
          if (linkUrl.href.includes(baseUrl.href)) {
            let path = linkUrl.pathname;
            if (path !== "/" && path.endsWith("/")) path = path.slice(0, -1);
            uniquePaths.add(path);
          }
        } catch {}
      }
      return Array.from(uniquePaths);
    }, this.website);

    return links;
  }

  async bfs(endpoint: string = "/"): Promise<string[]> {
    const visited: Record<string, boolean> = {};
    const results: string[] = [];
    const queue = [endpoint];

    while (queue.length > 0) {
      const size = queue.length;
      for (let i = 0; i < size; i++) {
        const current = queue.shift();
        if (!current || visited[current]) continue;
        if (this.depth !== -1 && this.relativeDepth(current) > this.depth) continue;

        visited[current] = true;
        results.push(current);

        const page = await this.browserService.getPage();
        try {
          const links = await this.processPage(page, current);
          queue.push(...links.filter((l) => !visited[l]));
        } finally {
          await this.browserService.closePage(page);
        }

        if (this.delay > 0) await new Promise((r) => setTimeout(r, this.delay));
      }
    }

    return results;
  }

  async dfs(endpoint: string = "/"): Promise<string[]> {
    const visited: Record<string, boolean> = {};
    const results: string[] = [];
    const stack = [endpoint];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited[current]) continue;
      if (this.depth !== -1 && this.relativeDepth(current) > this.depth) continue;

      visited[current] = true;
      results.push(current);

      const page = await this.browserService.getPage();
      try {
        const links = await this.processPage(page, current);
        stack.push(...links.filter((l) => !visited[l]).reverse());
      } finally {
        await this.browserService.closePage(page);
      }

      if (this.delay > 0) await new Promise((r) => setTimeout(r, this.delay));
    }

    return results;
  }

  async close(): Promise<void> {
    await this.browserService.closeAll();
  }
}

export default Scraper;
