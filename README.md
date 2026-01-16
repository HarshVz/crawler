# 🕷️ @harshvz/crawler

> A powerful web scraping tool built with Playwright that crawls websites using BFS or DFS algorithms, captures screenshots, and extracts content.

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
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔍 **Intelligent Crawling**: Choose between BFS (Breadth-First Search) or DFS (Depth-First Search) algorithms
- 📸 **Full Page Screenshots**: Automatically captures full-page screenshots of each visited page
- 📝 **Content Extraction**: Extracts metadata, headings, paragraphs, and text content
- 🎯 **Domain-Scoped**: Only crawls internal links within the same domain
- 🚀 **Interactive CLI**: User-friendly command-line interface with input validation
- 💾 **Organized Storage**: Saves screenshots and content in a structured directory format
- 🔄 **Duplicate Prevention**: Tracks visited URLs to avoid redundant scraping
- 🎨 **SEO Metadata**: Extracts Open Graph, Twitter Cards, and other meta tags
- ⏱️ **Timeout Handling**: Built-in timeout management for unresponsive pages

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

## 🚀 Usage

### CLI Mode (Interactive)

Simply run the command and follow the prompts:

```bash
scraper
```

You'll be prompted to enter:
1. **URL**: The website URL to scrape (e.g., `https://example.com`)
2. **Algorithm**: Choose between `bfs` or `dfs`

### Programmatic Usage

```typescript
import ScrapperServices from '@harshvz/crawler';

const scraper = new ScrapperServices('https://example.com', 2); // depth limit of 2

// Using BFS
await scraper.bfsScrape('/');

// Using DFS
await scraper.dfsScrape('/');
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

### `ScrapperServices`

Main class for web scraping operations.

#### Constructor

```typescript
new ScrapperServices(website: string, depth?: number)
```

**Parameters:**
- `website` (string): The base URL of the website to scrape
- `depth` (number, optional): Maximum depth to crawl (0 = unlimited, default: 0)

#### Methods

##### `bfsScrape(endpoint?: string, results?: string[], visited?: Record<string, boolean>): Promise<void>`

Crawls the website using Breadth-First Search algorithm.

**Parameters:**
- `endpoint` (string): Starting path (default: "/")
- `results` (string[]): Array to collect visited endpoints
- `visited` (Record<string, boolean>): Object to track visited URLs

##### `dfsScrape(endpoint?: string, results?: string[], visited?: Record<string, boolean>): Promise<void>`

Crawls the website using Depth-First Search algorithm.

**Parameters:**
- `endpoint` (string): Starting path (default: "/")
- `results` (string[]): Array to collect visited endpoints
- `visited` (Record<string, boolean>): Object to track visited URLs

##### `buildFilePath(endpoint: string): string`

Generates a file path for storing screenshots.

##### `buildContentPath(endpoint: string): string`

Generates a file path for storing extracted content.

##### `getLinks(page: Page): Promise<string[]>`

Extracts all internal links from the current page.

## ⚙️ Configuration

### Timeout

The default timeout for page navigation is **60 seconds**. You can modify this by editing the `timeout` property in the `ScrapperServices` class:

```typescript
const scraper = new ScrapperServices('https://example.com');
scraper.timeout = 30000; // 30 seconds
```

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
    ├── home.png                 # Screenshot of homepage
    ├── home.md                  # Extracted content from homepage
    ├── _about.png              # Screenshot of /about page
    ├── _about.md               # Extracted content from /about
    ├── _contact.png            # Screenshot of /contact page
    └── _contact.md             # Extracted content from /contact
```

### Content File Format (.md)

Each `.md` file contains:
1. **JSON metadata** (first line):
   - Page title
   - Meta description
   - Robots directives
   - Open Graph tags
   - Twitter Card tags
2. **Extracted text content** (subsequent lines):
   - All text from h1-h6, p, and span elements

## 📖 Examples

### Example 1: Basic Usage

```typescript
import ScrapperServices from '@harshvz/crawler';

const scraper = new ScrapperServices('https://docs.example.com');
await scraper.bfsScrape('/');
```

### Example 2: Limited Depth Crawl

```typescript
const scraper = new ScrapperServices('https://blog.example.com', 2);
await scraper.dfsScrape('/');
// Only crawls 2 levels deep from the starting page
```

### Example 3: Custom Endpoint

```typescript
const scraper = new ScrapperServices('https://example.com');
const results = [];
const visited = {};
await scraper.bfsScrape('/docs', results, visited);
console.log(`Scraped ${results.length} pages`);
```

## 🔧 Development

### Prerequisites

- Node.js >= 16.x
- npm >= 7.x

### Setup

```bash
# Clone the repository
git clone https://github.com/harshvz/crawler.git

# Navigate to directory
cd crawler

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Project Structure

```
crawler/
├── src/
│   ├── index.ts                    # CLI entry point
│   └── Services/
│       └── ScrapperServices.ts     # Main scraping logic
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

- Built with [Playwright](https://playwright.dev/)
- CLI powered by [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

---

**Made with ❤️ by [harshvz](https://github.com/harshvz)**