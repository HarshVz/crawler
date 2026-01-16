# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [Unreleased]

### Planned Features
- [ ] Support for custom selectors
- [ ] JSON export format option
- [ ] Rate limiting configuration
- [ ] Proxy support
- [ ] Custom headers
- [ ] Authentication support
- [ ] Progress bar for CLI
- [ ] Sitemap.xml parsing
- [ ] robots.txt respect
- [ ] Concurrent page processing
- [ ] Resume failed crawls
- [ ] Custom output directory
- [ ] Headless/headful browser mode option
- [ ] Screenshot quality and format options

---

[1.0.0]: https://github.com/harshvz/crawler/releases/tag/v1.0.0
