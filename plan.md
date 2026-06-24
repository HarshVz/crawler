# Improvement Plan for @harshvz/crawler v1.3.0

## 1. Critical Fixes

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1.1 | **Memory leak**: Pages created via `browser.newPage()` are never closed | `ScrapperServices.ts:226` | Add `page.close()` after processing each URL, or use `page.close()` in a `finally` block |
| 1.2 | **Browser closed on navigation error**: `await browser.close()` on line 239 kills the shared singleton, crashing subsequent pages | `ScrapperServices.ts:239` | Remove `await browser.close()` — just return `[]`; error recovery should not destroy the shared browser |
| 1.3 | **Source/dist mismatch**: `src/index.ts` has `closeBrowser()` commented out in `finally` block; `dist/index.js` has it active | `src/index.ts:162` | Add `import { closeBrowser }` and uncomment `await closeBrowser()` in source; rebuild |
| 1.4 | **`getBrowser()` doesn't assign to module-level `browser`**: After creating the browser, `browser` (module-level) stays `undefined`, so subsequent calls create a new connection | `ScrapperServices.ts:19` | Assign result: `browser = await chromium.connectOverCDP(...)` |
| 1.5 | **Screenshots claimed but never taken**: README and docs describe screenshot capture, but `page.screenshot()` is commented out | `ScrapperServices.ts:282-285` | Either re-enable screenshots with a config option, or remove the `.png` paths and update docs |

## 2. Code Quality & Maintenance

| # | Item | Detail |
|---|------|--------|
| 2.1 | **Remove dead code**: `BrowserService.ts` and `types/index.ts` appear to be an abandoned refactoring — never imported anywhere | Delete both files, or integrate them into ScrapperServices |
| 2.2 | **Remove unused dependencies**: `yargs`, `@types/yargs`, `nodemon`, `ts-node` are installed but never used | `npm uninstall` all four |
| 2.3 | **Fix BFS queue inefficiency**: `queue.shift()` is O(n) per dequeue | Replace with a linked-list based queue or use index pointer (e.g., `let idx = 0; while (idx < queue.length) { const current = queue[idx++]; ... }`) |
| 2.4 | **Improve TypeScript types**: `any` used extensively for `metadata`, `structuredContent`, `browser`, `obscura` | Add proper interfaces for metadata, content items, browser types |
| 2.5 | **Move module-level state into class**: `browser` and `obscura` are module-level singletons shared across instances | Make them class-level static members or use the existing `BrowserService` class |
| 2.6 | **Add linting/formatting config**: No ESLint or Prettier config exists | Add `.eslintrc` and `.prettierrc` with standard TS rules |
| 2.7 | **Restructure project**: `src/index.ts` is both CLI entry and library export — this dual role is confusing | Split into `src/cli.ts` (entry point) and `src/index.ts` (library exports) |

## 3. Performance Efficiencies

| # | Item | Detail |
|---|------|--------|
| 3.1 | **Add concurrency**: Currently processes one page at a time | Add configurable concurrency (e.g., 3-5 concurrent pages) using a `Promise.all` pool or `p-limit` |
| 3.2 | **Add request delay**: Can overwhelm target servers | Add configurable `delay` (ms) between requests (good citizens crawl) |
| 3.3 | **URL normalization**: Fragments (`#section`) and query parameter ordering create duplicate URLs | Strip fragments, sort query params, lowercase scheme/host before dedup |
| 3.4 | **Avoid redundant `new URL()` calls**: `buildFilePath` and `buildContentPath` parse `this.website` on every call | Parse once in constructor and store as `URL` object |
| 3.5 | **Add crawl timeout**: No hard limit on total crawl duration | Add optional `maxCrawlTime` config that stops after N seconds |

## 4. New Features

| # | Feature | Description |
|---|---------|-------------|
| 4.1 | **CLI flags (non-interactive mode)**: `--url`, `--algo`, `--depth`, `--format`, `--output` | Replace manual `process.argv` parsing with `yargs` (already installed!) so users can run `crawler --url https://example.com --algo bfs --depth 2 --format json --output ./data` |
| 4.2 | **Screenshots (re-enable as optional)** | Add `screenshot?: boolean` constructor option; re-enable `page.screenshot()` when true |
| 4.3 | **Progress bar** | Add a real-time progress indicator showing pages crawled / total discovered |
| 4.4 | **Resume / save-state** | Periodically save visited URLs and queue state to disk; allow resuming interrupted crawls |
| 4.5 | **`robots.txt` respect** | Fetch and parse `/robots.txt` before crawling; respect `Disallow` and `Crawl-delay` |
| 4.6 | **`sitemap.xml` support** | Discover and seed initial URLs from sitemaps |
| 4.7 | **User-agent customization** | Allow setting a custom `User-Agent` header |
| 4.8 | **Custom CSS selectors for content extraction** | Let users specify which selectors to extract (instead of the fixed `h1-h6, p, span, li, ...`) |
| 4.9 | **Rate limiting** | Configurable requests per second to avoid IP bans |
| 4.10 | **Test suite** | Add Vitest unit tests for `ScrapperServices` methods (link extraction, URL normalization, markdown generation) and Playwright E2E test for the CLI |

## Implementation Order

### Phase 1 — Fixes & Cleanup (1.1–1.5, 2.1–2.3)
- Fix memory leak, browser crash on error, and source/dist sync
- Remove dead code and unused deps
- Fix BFS queue performance
- Rebuild

### Phase 2 — Code Quality (2.4–2.7)
- Stronger types, class-level browser state
- Linting config
- Project restructure

### Phase 3 — Performance (3.1–3.5)
- Concurrency, delays, URL normalization
- Crawl timeout

### Phase 4 — Features (4.1–4.10)
- CLI flags (non-interactive mode)
- Screenshot option, progress bar
- Robots.txt, sitemap.xml
- Test suite
