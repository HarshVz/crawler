# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - TBD

### Added
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

### Fixed
- Fixed typo: "Scrapping" → "Scraping" throughout the codebase

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
