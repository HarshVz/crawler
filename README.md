![npm version](https://i.imgur.com/HGltGRl.jpeg)
# 🕷️ @harshvz/crawler

> A lightweight, stealthy web scraping tool powered by Obscura (headless browser) that crawls websites using BFS or DFS algorithms and extracts structured content.

[![npm version](https://img.shields.io/npm/v/@harshvz/crawler.svg)](https://www.npmjs.com/package/@harshvz/crawler)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [CLI Commands](#-cli-commands)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Output Structure](#-output-structure)
- [Examples](#-examples)
- [Limitations](#-limitations)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔍 **Intelligent Crawling**: Choose between BFS (Breadth-First Search) or DFS (Depth-First Search) algorithms
- 📝 **Content Extraction**: Extracts metadata, headings, paragraphs, links, images, and all text content
- 🎯 **Domain-Scoped**: Only crawls internal links within the same domain
- 🚀 **Interactive CLI**: User-friendly command-line interface with input validation
- 💾 **Multiple Output Formats**: Save as Markdown, JSON, or CSV
- 🏷️ **Custom Tag Selectors**: Limit extraction to specific HTML tags or CSS selectors
- ⏱️ **Configurable Delay**: Set delay between requests to avoid overwhelming servers
- 🕵️ **Stealth & Anti-Detection**: Masks automation flags, spoofs navigator properties, realistic User-Agent
- 🔒 **Tracker Blocking**: Blocks analytics domains and unnecessary resource types for faster, private crawling
- 🔄 **Duplicate Prevention**: Tracks visited URLs to avoid redundant scraping
- 🎨 **SEO Metadata**: Extracts Open Graph, Twitter Cards, and other meta tags
- ⏱️ **Timeout Handling**: Built-in timeout management for unresponsive pages
- 🪶 **Lightweight Browser**: Uses Obscura — a lightweight headless browser via CDP (no heavy Chromium download needed)

## 📦 Installation

### As a Global CLI Tool

```bash
npm install -g @harshvz/crawler
```

### As a Project Dependency

```bash
npm install @harshvz/crawler
```

### From Source

```bash
git clone https://github.com/harshvz/crawler.git
cd crawler
npm install
npm run build
npm install -g .
```

> **Note**: This package uses **Obscura** — a lightweight headless browser connected via CDP. It is significantly faster and smaller than Chromium. The only limitation is that it does not support screenshots (headless-only).

## 🚀 Usage

### CLI Mode (Interactive)

Simply run the command and follow the prompts:

```bash
# Primary command (recommended)
crawler

# Alternative (for backward compatibility)
scraper
```

You'll be prompted to enter:
1. **URL**: The website URL to scrape (e.g., `https://example.com`)
2. **Algorithm**: Choose between `bfs` or `dfs` (default: bfs)
3. **Format**: Output format — `md`, `json`, or `csv` (default: md)
4. **Depth**: Maximum crawl depth (-1 for infinite)
5. **Delay**: Milliseconds to wait between requests (0 for none)
6. **Tags**: Custom HTML tags or CSS selectors to extract (comma-separated, blank for all)
7. **Output Directory**: Custom save location (default: `~/knowledgeBase`)

### Command-Line Flags

```bash
# Show version
crawler --version
crawler -v

# Show help
crawler --help
crawler -h
```

> **Note**: Both `crawler` and `scraper` commands work identically. We recommend using `crawler` for new projects.

### Programmatic Usage

```typescript
import Scraper from '@harshvz/crawler';

const scraper = new Scraper('https://example.com', {
  depth: 2,
  format: 'md',
  delay: 500,
  tags: 'h1, p, a, img',
});

// Using BFS
const results = await scraper.bfs('/');

// Using DFS
const results = await scraper.dfs('/');

await scraper.close();
```

## 🛠️ CLI Commands

### Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build the project
npm run build

# Start the built version
npm start
```

## 📚 API Documentation

### `Scraper` (Main Orchestrator)

The main class that orchestrates crawling, content extraction, and file storage.

#### Constructor

```typescript
new Scraper(website: string, options?: ScraperOptions)
```

**Parameters:**
- `website` (string): The base URL of the website to scrape
- `options` (ScraperOptions, optional):
  - `depth` (number): Maximum depth relative to base URL (-1 = infinite, default: -1)
  - `format` ("md" | "json" | "csv"): Output format (default: "md")
  - `delay` (number): Milliseconds between requests (default: 0)
  - `outputPath` (string): Output directory (default: ~/knowledgeBase)
  - `tags` (string): Comma-separated tags/selectors to extract (default: all)
  - `selectors` (string[]): Additional CSS selectors for extra CSV output

#### Methods

##### `bfs(endpoint?: string): Promise<string[]>`
Crawls the website using Breadth-First Search algorithm.

##### `dfs(endpoint?: string): Promise<string[]>`
Crawls the website using Depth-First Search algorithm.

##### `close(): Promise<void>`
Closes the browser and cleans up all resources.

### `ContentExtractor`

Extracts structured content from a Playwright Page instance.

```typescript
import { ContentExtractor } from '@harshvz/crawler';

const extractor = new ContentExtractor(page);
const details = await extractor.getBasicDetails();
const content = await extractor.getStructuredContent('h1, p, a');
```

#### Methods
- `getBasicDetails()` — Returns title, description, robots, OG/Twitter metadata
- `getStructuredContent(customSelector?)` — Extracts all content with attributes (href on links, src/alt on images)
- `getContentBySelectors(selectors[])` — Extracts text from custom CSS selectors
- `toJson(data)` — Format as JSON string
- `toMarkdown(metadata, content)` — Format as Markdown string
- `toCsv(data)` — Format as CSV string

### `FileService`

Handles file output with automatic directory creation.

```typescript
import { FileService } from '@harshvz/crawler';

const fs = new FileService('./output');
fs.saveJson(url, endpoint, data);
fs.saveMarkdown(url, endpoint, content);
fs.saveCsv(url, endpoint, content);
```

## ⚙️ Configuration

### Output Format

Choose between `md`, `json`, or `csv`. Each format includes:
- **Markdown** (`.md`): Rich text with headings, links, and images
- **JSON** (`.json`): Full structured data with metadata and content arrays
- **CSV** (`.csv`): Tabular format with tag, text, href, src, and alt columns

### Custom Tags/Selectors

By default, all content tags are extracted (h1-h6, p, a, img, li, code, pre, etc.).
You can limit extraction to specific tags or CSS selectors:

```typescript
const scraper = new Scraper('https://example.com', {
  tags: 'h1, .product-title, a.product-link, img',
});
```

### Request Delay

Set a delay between requests to avoid rate-limiting:

```typescript
const scraper = new Scraper('https://example.com', {
  delay: 500, // 500ms between each page visit
});
```

### Depth Control

Depth is calculated **relative** to the base URL's pathname. If your base URL is `https://site.com/blog/post/`, then `/blog/post/1` is depth 1 and `/blog/post/1/2` is depth 2.

### Storage Location

By default, all scraped data is stored in:
```
~/knowledgeBase/
```

Each website gets its own folder based on its hostname.

## 📁 Output Structure

```
~/knowledgeBase/
└── examplecom/
    ├── home.md                  # Extracted content from homepage
    ├── home.json                # (if json format selected)
    ├── home.csv                 # (if csv format selected)
    ├── _about.md               # Extracted content from /about
    └── _contact.md             # Extracted content from /contact
```

### Content Details

Each file includes:
- Page title and URL
- Meta description
- Open Graph tags
- Twitter Card tags
- Extracted text content (with href on links and src/alt on images)
- Robots directives

## 📖 Examples

### Example 1: Basic Usage

```typescript
import Scraper from '@harshvz/crawler';

const scraper = new Scraper('https://docs.example.com');
await scraper.bfs('/');
await scraper.close();
```

### Example 2: Limited Depth Crawl with Delay

```typescript
const scraper = new Scraper('https://blog.example.com', {
  depth: 2,
  delay: 1000,
});
await scraper.dfs('/');
await scraper.close();
```

### Example 3: JSON Output with Custom Selectors

```typescript
const scraper = new Scraper('https://example.com', {
  format: 'json',
  tags: 'h1, h2, p, img',
});
await scraper.bfs('/');
await scraper.close();
```

### Example 4: Custom Output Directory

```typescript
const scraper = new Scraper('https://example.com', {
  depth: -1,
  outputPath: '/custom/output/path',
});
await scraper.bfs('/');
await scraper.close();
```

## ⚠️ Limitations

- **No screenshots**: Obscura is a lightweight headless-only browser — screenshot capture is not supported
- **Sequential crawling**: Pages are processed one at a time (concurrent crawling not yet implemented)
- **In-memory queue**: Queue is held in memory — very large crawls may exhaust available RAM

## 🔧 Development

### Prerequisites

- Node.js >= 16.x
- npm >= 7.x

### Setup

```bash
git clone https://github.com/harshvz/crawler.git
cd crawler
npm install
npm run dev
```

### Project Structure

```
crawler/
├── src/
│   ├── index.ts                    # CLI entry point
│   └── Services/
│       ├── Scraper.ts              # Main orchestrator (crawling logic)
│       ├── ContentExtractor.ts     # Page content extraction
│       ├── FileService.ts          # Output file storage
│       └── BrowserService.ts       # Browser lifecycle & stealth
├── dist/                           # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC © Harshvz

## 🙏 Acknowledgments

- Built with [Obscura](https://obscura.net/) — lightweight headless browser via CDP
- Browser automation by [Playwright](https://playwright.dev/)
- CLI powered by [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

---

**Made with ❤️ by [harshvz](https://github.com/harshvz)**
