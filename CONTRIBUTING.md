# Contributing to @harshvz/crawler

Thank you for your interest in contributing to @harshvz/crawler! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/crawler.git
   cd crawler
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/harshvz/crawler.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 16.x
- npm >= 7.x
- Git

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running in Development Mode

```bash
# Start development mode with auto-reload
npm run dev
```

### Building

```bash
# Compile TypeScript
npm run build
```

### Testing Locally

```bash
# Test the CLI locally
npm install -g .
scraper

# Uninstall after testing
npm uninstall -g @harshvz/crawler
```

## Making Changes

### 1. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clear, concise code
- Follow the existing code style
- Add comments where necessary
- Update documentation as needed

### 3. Test Your Changes

```bash
# Build the project
npm run build

# Test locally
npm install -g .
scraper

# Test programmatic usage
node -e "import ScrapperServices from './dist/index.js'; const s = new ScrapperServices('https://example.com'); console.log('OK');"
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add support for custom selectors"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Submitting Changes

### 1. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Choose your fork and branch
4. Fill in the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes you made and why
   - **Issue**: Link to related issue (if any)
   - **Screenshots**: If applicable

### 3. Code Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Avoid `any` types when possible
- Use proper type annotations

### Code Style

```typescript
// Good
async function scrapeWebsite(url: string, depth: number = 0): Promise<void> {
    const scraper = new ScrapperServices(url, depth);
    await scraper.bfsScrape('/');
}

// Bad
async function scrapeWebsite(url, depth) {
    let scraper = new ScrapperServices(url, depth);
    await scraper.bfsScrape('/');
}
```

### File Organization

```
src/
├── index.ts              # CLI entry point
└── Services/
    └── ScrapperServices.ts  # Main logic
```

### Error Handling

```typescript
// Always handle errors appropriately
try {
    await page.goto(url);
} catch (error) {
    console.error(`Failed to navigate: ${error.message}`);
    return [];
}
```

## Testing

### Manual Testing

Before submitting a PR, test these scenarios:

1. **CLI Installation**:
   ```bash
   npm run build
   npm install -g .
   scraper
   ```

2. **Programmatic Usage**:
   ```typescript
   import ScrapperServices from './dist/index.js';
   const scraper = new ScrapperServices('https://example.com');
   await scraper.bfsScrape('/');
   ```

3. **Different Websites**:
   - Test on various websites
   - Test with different depth limits
   - Test both BFS and DFS algorithms

4. **Edge Cases**:
   - Invalid URLs
   - Unreachable websites
   - Timeout scenarios
   - Empty link pages

### Future: Automated Testing

We plan to add:
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright Test
- CI/CD pipeline

## Documentation

### Update Documentation

When making changes, update relevant documentation:

- **README.md**: Main documentation
- **QUICKSTART.md**: Quick start guide
- **CHANGELOG.md**: Add your changes
- **API Documentation**: Update if API changes
- **Code Comments**: Add/update as needed

### Documentation Style

```typescript
/**
 * Scrapes a website using Breadth-First Search algorithm
 * 
 * @param endpoint - Starting path (default: "/")
 * @param results - Array to collect visited endpoints
 * @param visited - Object to track visited URLs
 * @returns Promise that resolves when scraping is complete
 */
async bfsScrape(
    endpoint: string = "/",
    results: string[] = [],
    visited: Record<string, boolean> = {}
): Promise<void> {
    // Implementation
}
```

## Feature Requests

Have an idea for a new feature? Great!

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear title
   - Detailed description
   - Use cases
   - Benefits
   - Potential implementation approach

## Bug Reports

Found a bug?

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Node.js version, npm version)
   - Error messages/screenshots

## Project Roadmap

### Planned Features

- [ ] Custom CSS selectors
- [ ] JSON export format
- [ ] Rate limiting
- [ ] Proxy support
- [ ] Authentication
- [ ] Progress indicators
- [ ] Resume failed crawls
- [ ] Concurrent processing
- [ ] robots.txt support
- [ ] Sitemap.xml parsing

Want to work on one? Comment on the issue or create one!

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Security issues**: Email directly (see README)

## Recognition

Contributors will be:
- Listed in the repository contributors
- Mentioned in release notes
- Given credit in CHANGELOG.md

---

Thank you for contributing to @harshvz/crawler! 🎉
