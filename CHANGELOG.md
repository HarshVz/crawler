# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-24

### Added

#### New Services
- **`ContentExtractor`**: Dedicated class for page content extraction with support for basic metadata, structured content, and custom CSS selectors. Includes format converters for Markdown, JSON, and CSV
- **`FileService`**: Storage service that handles file output with automatic directory creation and configurable base path
- **`BrowserService`**: Browser lifecycle management with comprehensive security and stealth features
- **`Scraper`**: New orchestrator class that connects all services, replacing the monolithic `ScrapperServices`

#### New Features
- **CSV output format**: Export extracted content as CSV with tag, text, href, src, and alt columns
- **Custom tag/selector extraction**: Limit content extraction to specific HTML tags or CSS selectors (comma-separated)
- **Configurable request delay**: Set milliseconds between requests to avoid rate-limiting
- **Relative depth calculation**: Depth is now measured from the base URL's pathname, not from root
- **Stealth & anti-detection**: Masks `navigator.webdriver`, `navigator.plugins`, and `navigator.languages`. Spoofs `hardwareConcurrency` and `deviceMemory`
- **Realistic browser fingerprint**: Custom User-Agent (Chrome 128 / Windows 10), desktop viewport (1920×1080), `en-US` locale, `America/New_York` timezone
- **Resource blocking**: Blocks images, fonts, stylesheets, media, XHR, fetch, websocket, and other resource types for faster page loads
- **Analytics tracker blocking**: Blocks 16 known analytics/tracking domains (Google Analytics, Facebook, DoubleClick, Hotjar, etc.)
- **Enriched content extraction**: `<a>` elements include `href`, `<img>` elements include `src` and `alt`, `<video>`/`<source>` include `src`
- **Markdown link/image rendering**: Links rendered as `[text](href)`, images as `![alt](src)`
- **Obscura browser**: Switched from Chromium to Obscura — a significantly lighter and faster headless browser connected via CDP
- **Page-context isolation**: Each page gets its own isolated `BrowserContext`, properly cleaned up on close
- **Browser cleanup on exit**: `scraper.close()` called in `finally` block to ensure browser resources are freed
- **CLI prompts for delay and custom tags**: New interactive prompts for delay and comma-separated tag/selector input

#### Development Improvements
- Switched from `nodemon` + `ts-node` to `tsx watch` for faster dev mode
- Added `tsx` dev dependency
- Stronger TypeScript types — `Browser` type instead of `any` in `BrowserService`

### Changed
- **Architecture**: Monolithic `ScrapperServices` class split into modular services — `Scraper` (orchestrator), `ContentExtractor`, `FileService`, `BrowserService`
- **Browser engine**: Chromium (`chromium.launch()`) → Obscura (`chromium.connectOverCDP()` via `obscura-node`)
- **Format selection**: Added `csv` as a valid format option
- **Help text**: Updated to document new features — format selection, delay, custom tags, and tag/selector guide
- **Project exports**: Now exports `Scraper`, `ContentExtractor`, and `FileService` alongside the default export
- **README**: Fully rewritten to reflect the new architecture, features, and limitations
- **tsconfig.json**: Added `exclude` for `old/`, `node_modules`, and `dist`

### Removed
- **`ScrapperServices.ts`**: Replaced by the modular architecture (`Scraper.ts`, `ContentExtractor.ts`, `FileService.ts`, `BrowserService.ts`)
- **Screenshot support**: Obscura is headless-only and does not support screenshots
- **`postinstall` script**: No longer automatically downloads Chromium (Obscura handles the browser)
- **Deprecated `buildFilePath()` / `buildContentPath()` methods**: Replaced by `FileService`

### Fixed
- **Memory leak**: Pages are now properly closed after each crawl step (via `page.close()` / `context.close()`)
- **Browser crash on navigation error**: Browser is no longer killed when a page fails to load
- **`getBrowser()` assignment**: Browser instance is now properly stored after initialization
- **BFS queue performance**: Uses index pointer instead of `Array.shift()` (O(n) → O(1))

### Security
- Automation detection masked (webdriver, plugins, languages)
- Bot fingerprinting resistance (viewport, UA, hardware specs)
- Analytics/tracker request blocking
- Unnecessary resource type blocking

## [1.2.0] - TBD

### Added
- `crawler` command as primary CLI command (recommended)
- Both `crawler` and `scraper` commands work identically (backward compatibility)
- `--version` / `-v` flag to display package version
- `--help` / `-h` flag to display usage information
- Custom output directory support via interactive prompt
- URL validation in interactive prompts
- Better user experience with emojis and clearer messages
- Default values for algorithm (bfs) and output path

### Changed
- Improved prompt messages for better clarity
- Enhanced error messages with visual indicators (✅, ❌)
- Updated ScrapperServices constructor to accept optional `customPath` parameter
- Documentation now recommends `crawler` over `scraper`

### Fixed
- Fixed typo: "Scrapping" → "Scraping" throughout the codebase

## [1.1.0] - 2026-01-16

### Added
- Added features from v1.0.2 to v1.1.0

## [1.0.1] - 2026-01-16

### Fixed
- Minor UI improvement to prompt message formatting

## [1.0.0] - 2026-01-16

### Added
- Initial release of @harshvz/crawler
- BFS (Breadth-First Search) crawling algorithm
- DFS (Depth-First Search) crawling algorithm
- Full-page screenshot capture
- Content extraction (headings, paragraphs, text)
- SEO metadata extraction (Open Graph, Twitter Cards)
- Interactive CLI with inquirer.js
- Depth limiting for crawls
- Duplicate URL prevention
- Organized storage in ~/knowledgeBase/
- Domain-scoped crawling (only internal links)
- Timeout handling for unresponsive pages
- TypeScript support
- CLI tool via npm bin
- Programmatic API usage
- **Automatic Chromium browser installation** via postinstall script
- Better error messages for missing browser installations

### Features
- **ScrapperServices class**: Main scraping service
  - `bfsScrape()`: Breadth-first crawling
  - `dfsScrape()`: Depth-first crawling
  - `getLinks()`: Extract all internal links
  - `buildFilePath()`: Generate screenshot paths
  - `buildContentPath()`: Generate content file paths
  - `writeFile()`: Save extracted content
  - `useBrowser()`: Browser automation with Playwright

### Technical Details
- Built with Playwright for browser automation
- TypeScript for type safety
- Node.js ESM modules
- Supports Node.js >= 16.0.0

### Documentation
- Comprehensive README.md
- API documentation
- Usage examples
- Publishing guide

---

[1.0.0]: https://github.com/harshvz/crawler/releases/tag/v1.0.0
