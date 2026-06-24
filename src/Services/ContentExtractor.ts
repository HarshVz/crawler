import { type Page } from "playwright-core";

export interface BasicDetails {
  title: string;
  description: string | null;
  robots: string | null;
  googlebot: string | null;
  og: Record<string, string | null>;
  twitter: Record<string, string | null>;
}

export interface SelectorResult {
  selector: string;
  values: string[];
}

export interface ContentItem {
  tag: string;
  text: string;
  href?: string;
  src?: string;
  alt?: string;
}

const DEFAULT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, span, li, a, strong, em, code, pre, img, video, source, link";

class ContentExtractor {
  constructor(private page: Page) {}

  async getBasicDetails(): Promise<BasicDetails> {
    return {
      title: await this.page.title(),
      description: await this.page
        .$eval('meta[name="description"]', (el) => el.getAttribute("content"))
        .catch(() => null),
      robots: await this.page
        .$eval('meta[name="robots"]', (el) => el.getAttribute("content"))
        .catch(() => null),
      googlebot: await this.page
        .$eval('meta[name="googlebot"]', (el) => el.getAttribute("content"))
        .catch(() => null),
      og: await this.page
        .$$eval('meta[property^="og:"]', (metas) =>
          Object.fromEntries(
            metas.map((m) => [
              m.getAttribute("property"),
              m.getAttribute("content"),
            ]),
          ),
        )
        .catch(() => ({})),
      twitter: await this.page
        .$$eval('meta[name^="twitter:"]', (metas) =>
          Object.fromEntries(
            metas.map((m) => [
              m.getAttribute("name"),
              m.getAttribute("content"),
            ]),
          ),
        )
        .catch(() => ({})),
    };
  }

  async getContentBySelectors(selectors: string[]): Promise<SelectorResult[]> {
    const results: SelectorResult[] = [];
    for (const selector of selectors) {
      const values = await this.page.$$eval(selector, (els) =>
        els.map((el) => (el as any).innerText?.trim() || "").filter(Boolean),
      );
      results.push({ selector, values });
    }
    return results;
  }

  async getStructuredContent(customSelector?: string): Promise<ContentItem[]> {
    const selector = customSelector || DEFAULT_SELECTOR;

    return await this.page.$$eval(selector, (elements) =>
      elements
        .map((el) => {
          const tag = el.tagName.toLowerCase();
          const item: ContentItem = { tag, text: el.textContent?.trim() || "" };

          if (tag === "a" || tag === "link") {
            item.href = el.getAttribute("href") || undefined;
          }
          if (tag === "img") {
            item.src = el.getAttribute("src") || undefined;
            item.alt = el.getAttribute("alt") || undefined;
          }
          if (tag === "video" || tag === "source") {
            item.src = el.getAttribute("src") || undefined;
          }

          return item;
        })
        .filter((item) => item.text || item.href || item.src),
    ) as unknown as ContentItem[];
  }

  toJson(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }

  toMarkdown(metadata: BasicDetails, content: ContentItem[]): string {
    let md = `# ${metadata.title}\n\n`;
    md += `**URL:** ${this.page.url()}\n\n`;
    if (metadata.description) md += `**Description:** ${metadata.description}\n\n`;
    md += `---\n\n`;

    for (const item of content) {
      if (item.tag.startsWith("h")) {
        const level = parseInt(item.tag.charAt(1));
        md += `${"#".repeat(level)} ${item.text}\n\n`;
      } else if (item.tag === "p") {
        md += `${item.text}\n\n`;
      } else if (item.tag === "li") {
        md += `- ${item.text}\n`;
      } else if (item.tag === "a") {
        if (item.href) {
          md += `[${item.text}](${item.href})\n\n`;
        } else {
          md += `${item.text}\n\n`;
        }
      } else if (item.tag === "img") {
        if (item.src) {
          md += `![${item.alt || item.text || "image"}](${item.src})\n\n`;
        }
      } else if (item.tag === "code" || item.tag === "pre") {
        md += `\`${item.text}\`\n\n`;
      } else {
        md += `${item.text}\n`;
      }
    }

    return md;
  }

  toCsv(data: SelectorResult[] | ContentItem[]): string {
    if (data.length === 0) return "";
    const first = data[0]!;

    if ("selector" in first) {
      const rows = data as SelectorResult[];
      const lines = ['"selector","value"'];
      for (const row of rows) {
        for (const val of row.values) {
          lines.push(`"${row.selector}","${val.replace(/"/g, '""')}"`);
        }
      }
      return lines.join("\n");
    }

    const rows = data as ContentItem[];
    const lines = ['"tag","text","href","src","alt"'];
    for (const row of rows) {
      lines.push(
        `"${row.tag}","${(row.text || "").replace(/"/g, '""')}","${(row.href || "").replace(/"/g, '""')}","${(row.src || "").replace(/"/g, '""')}","${(row.alt || "").replace(/"/g, '""')}"`,
      );
    }
    return lines.join("\n");
  }
}

export default ContentExtractor;
