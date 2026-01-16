# Quick Start Guide

## 🚀 For End Users

### Install the CLI Tool

```bash
npm install -g @harshvz/crawler
```

> **📥 Note**: During installation, Chromium browser (~300MB) will be automatically downloaded. This is required for scraping functionality and only needs to be done once.

### Run the Scraper

```bash
scraper
```

Follow the interactive prompts:
1. Enter the URL you want to scrape (e.g., `https://example.com`)
2. Choose the algorithm (`bfs` or `dfs`)
3. Wait for the scraping to complete

### View Results

All scraped content will be saved to:
```
~/knowledgeBase/<domain-name>/
```

Each page will have:
- A `.png` screenshot file
- A `.md` content file with metadata and text

---

## 💻 For Developers

### Install as a Dependency

```bash
npm install @harshvz/crawler
```

### Basic Usage

```typescript
import ScrapperServices from '@harshvz/crawler';

// Create a scraper instance
const scraper = new ScrapperServices('https://example.com');

// Start scraping using BFS
await scraper.bfsScrape('/');
```

### Advanced Usage

```typescript
import ScrapperServices from '@harshvz/crawler';

// Create a scraper with depth limit
const scraper = new ScrapperServices('https://example.com', 2);

// Custom timeout (default is 60000ms)
scraper.timeout = 30000;

// Track results
const results = [];
const visited = {};

// Start from a specific endpoint
await scraper.dfsScrape('/docs', results, visited);

console.log(`Scraped ${results.length} pages`);
console.log('Visited pages:', results);
```

---

## 🎯 Common Use Cases

### 1. Documentation Scraping

```typescript
const scraper = new ScrapperServices('https://docs.example.com', 3);
await scraper.bfsScrape('/');
```

### 2. Blog Archiving

```typescript
const scraper = new ScrapperServices('https://blog.example.com');
await scraper.dfsScrape('/');
```

### 3. Website Analysis

```typescript
const scraper = new ScrapperServices('https://example.com', 1);
const results = [];
const visited = {};
await scraper.bfsScrape('/', results, visited);

console.log('Total pages found:', results.length);
console.log('Pages crawled:', results);
```

---

## 🔧 Configuration Options

### Depth Limiting

```typescript
// Limit to 2 levels deep
const scraper = new ScrapperServices('https://example.com', 2);
```

**Depth levels:**
- `0` or not specified: Unlimited depth (crawls entire site)
- `1`: Only the starting page and its direct links
- `2`: Starting page + 2 levels of nested links
- `n`: Starting page + n levels of nested links

### Custom Timeout

```typescript
const scraper = new ScrapperServices('https://example.com');
scraper.timeout = 30000; // 30 seconds
```

### Custom Storage Location

Currently, files are saved to `~/knowledgeBase/`. To change this, modify the `path` property:

```typescript
const scraper = new ScrapperServices('https://example.com');
scraper.path = '/custom/path';
```

---

## ❓ FAQ

### Q: What's the difference between BFS and DFS?

**BFS (Breadth-First Search):**
- Crawls all pages at one level before moving deeper
- Better for discovering site structure
- More memory intensive

**DFS (Depth-First Search):**
- Follows each path to its end before backtracking
- Better for deep site exploration
- More efficient with memory

### Q: Where are the screenshots saved?

All data is saved to `~/knowledgeBase/<hostname>/`:
- Windows: `C:\Users\<YourName>\knowledgeBase\`
- Mac/Linux: `/home/<username>/knowledgeBase/`

### Q: Can I scrape external links?

No, the crawler only follows internal links within the same domain to prevent infinite crawling.

### Q: How do I handle authentication?

Currently, the crawler doesn't support authentication. This feature is planned for future releases.

### Q: What if a page takes too long to load?

The default timeout is 60 seconds. Pages that don't load within this time are skipped, and the crawler continues with other pages.

---

## 🛟 Troubleshooting

### Issue: "Command not found: scraper"

**Solution:**
```bash
# Reinstall globally
npm uninstall -g @harshvz/crawler
npm install -g @harshvz/crawler

# Verify installation
npm list -g @harshvz/crawler
```

### Issue: "Permission denied"

**Solution on Linux/Mac:**
```bash
sudo npm install -g @harshvz/crawler
```

**Solution on Windows:**
Run PowerShell or Command Prompt as Administrator.

### Issue: "Playwright browser not installed"

**Solution:**
```bash
npx playwright install chromium
```

### Issue: "Cannot find module"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm uninstall -g @harshvz/crawler
npm install -g @harshvz/crawler
```

---

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Check out the [API Documentation](./README.md#-api-documentation)
- Learn how to [publish updates](./PUBLISHING.md)
- View the [Changelog](./CHANGELOG.md)

---

**Need help? [Open an issue](https://github.com/harshvz/crawler/issues)**
