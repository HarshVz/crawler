# Changes from v1.3.0

## New Files

### `src/Services/ContentExtractor.ts`
Dedicated class for page content extraction that takes a Playwright `Page` instance:
- `getBasicDetails()` — extracts title, meta description, robots, googlebot, OG tags, Twitter Card tags
- `getStructuredContent(customSelector?)` — extracts all structured content (h1-h6, p, span, li, a, strong, em, code, pre, img, video, source, link). Accepts an optional custom CSS selector string to limit which elements are extracted. For `<a>`/`<link>` elements, includes the `href` attribute. For `<img>` includes `src` and `alt`. For `<video>`/`<source>` includes `src`
- `getContentBySelectors(selectors[])` — extracts text from arbitrary CSS selectors passed as an array
- `toJson()` / `toMarkdown()` / `toCsv()` — format the extracted data in the desired output format

### `src/Services/FileService.ts`
Storage service that handles file output:
- Uses the simple path pattern — `{basePath}/{sanitized_hostname}/{safeName}.{ext}`
- Creates directories automatically
- `saveJson()`, `saveMarkdown()`, `saveCsv()` convenience methods
- Configurable base path (defaults to `~/knowledgeBase`)

### `src/Services/BrowserService.ts`
Browser lifecycle management with security and stealth features:
- **Typed browser** — `Browser` type instead of `any`
- **Obscura stealth** — connects through `obscura-node` with `stealth: true` for anti-fingerprinting and tracker blocking
- **Realistic User-Agent** — Chrome 128 on Windows 10
- **Desktop viewport** — 1920×1080, no touch, no mobile
- **Locale & timezone** — `en-US` locale, `America/New_York` timezone
- **`navigator.webdriver` override** — hides Playwright automation flag
- **`navigator.plugins` / `languages` masking** — fake plugin list and language preferences
- **`hardwareConcurrency` / `deviceMemory` spoofing** — reports 8 cores and 8GB memory
- **Resource blocking** — blocks `image`, `font`, `stylesheet`, `media`, `xhr`, `fetch`, `websocket`, `other` for faster page loads
- **Analytics blocklist** — blocks requests to 16 known analytics/tracking domains (Google Analytics, Facebook, DoubleClick, Hotjar, etc.)
- **Page-context isolation** — each page gets its own isolated `BrowserContext`, properly cleaned up on close

### `src/Services/Scraper.ts`
New orchestrator class that connects all services:
- Uses `BrowserService` for browser management
- Uses `ContentExtractor` for per-page content extraction
- Uses `FileService` for saving output
- Configurable `delay` between requests (in ms)
- Configurable format — `md`, `json`, or `csv`
- Configurable custom tags/selectors for content extraction
- Configurable depth (infinite by default)
- **Relative depth calculation** — depth is measured from the base URL's pathname, not from root. For example, if the base URL is `https://site.com/blog/post/`, a link to `/blog/post/1` is depth 1
- `bfs()` and `dfs()` crawl methods
- `close()` method to clean up browser resources

### `plan.md`
Project improvement plan documenting fixes, efficiencies, and new features across 4 implementation phases.

---

## Modified Files

### `src/index.ts`
Restructured to use the new `Scraper` class instead of the old `ScrapperServices`:
- Imports `Scraper`, `ContentExtractor`, `FileService` instead of just `ScrapperServices`
- **CSV format support** — added `csv` as a valid format option alongside `md` and `json`
- **Delay prompt** — users can now set a delay between requests in milliseconds
- **Tag selector prompt** — users can specify custom tags/selectors (comma-separated) to limit content extraction, or leave blank for all
- **Browser cleanup** — `scraper.close()` is now called in the `finally` block to ensure browser resources are freed
- **Updated help text** — documents the new format options, tag/selector guide, and delay feature
- **Exports** — now exports `Scraper`, `ContentExtractor`, and `FileService` alongside the default export
- Switched to `tsx` for dev mode (`tsx watch src/index.ts`) instead of `nodemon` + `ts-node`

### `tsconfig.json`
- Added `"exclude": ["old", "node_modules", "dist"]` to prevent compilation errors from files outside `src/`

### `package.json`
- Changed dev script from `nodemon --watch src --exec node --loader ts-node/esm src/index.ts` to `tsx watch src/index.ts`
- Added `tsx` as a dev dependency
- Added dependencies: `obscura-node`, `playwright-core`, `puppeteer-core`

---

## Deleted Files

### `src/Services/ScrapperServices.ts`
The original monolithic service was replaced by the modular architecture:
- **Browser management** → `BrowserService.ts`
- **Content extraction** → `ContentExtractor.ts`
- **File storage** → `FileService.ts`
- **Orchestration** → `Scraper.ts`

Key improvements over the original:
- Pages are now properly closed after use (memory leak fix)
- Browser is not killed on navigation errors
- Screenshot code removed (was commented out but `.png` paths were still generated)
- `getBrowser()` properly assigns to the module-level variable (was a bug)
- BFS queue no longer uses O(n) `Array.shift()` internally

---

## Feature Comparison

| Feature | Original | Current |
|---------|----------|---------|
| Browser launch | `chromium.launch()` | Obscura CDP proxy + stealth |
| Screenshots | Yes (active) | Removed (was commented out) |
| Formats | md, json | md, json, csv |
| Request delay | No | Yes (configurable) |
| Concurrency | Sequential | Sequential |
| Depth calculation | Absolute (path segments from root) | Relative to base URL pathname |
| Custom tags/selectors | No | Yes (comma-separated) |
| Browser memory cleanup | Pages never closed | Proper page/context cleanup |
| Headless detection | None | webdriver, plugins, languages, UA masked |
| Resource blocking | None | Images, fonts, stylesheets, media, XHR, fetch, websocket, analytics |
| Stealth | None | Obscura stealth + spoofed navigator properties |
| Architecture | Single monolithic class | Modular: ContentExtractor, FileService, BrowserService, Scraper |
