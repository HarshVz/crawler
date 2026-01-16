# Publishing Guide for @harshvz/crawler

This guide will help you publish your package to npm as both a library and a CLI tool.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **Scoped Package**: Since the package name is `@harshvz/crawler`, you need to be logged into npm with the `harshvz` username or organization account.

## Pre-Publishing Checklist

- [ ] Update version in `package.json`
- [ ] Test the build: `npm run build`
- [ ] Test locally: `npm install -g .`
- [ ] Test the CLI: `scraper`
- [ ] Update README.md if needed
- [ ] Commit all changes to git
- [ ] Create a git tag for the version

## Step-by-Step Publishing

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 2. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 3. Test Locally

Before publishing, test the package locally:

```bash
# Install globally from local directory
npm install -g .

# Test the CLI
scraper

# Uninstall after testing
npm uninstall -g @harshvz/crawler
```

### 4. Publish to npm

#### For Public Package (Free)

```bash
npm publish --access public
```

#### For Private Package (Requires Paid Plan)

```bash
npm publish
```

## Version Management

Before each publish, update the version:

```bash
# Patch version (1.0.0 -> 1.0.1) - for bug fixes
npm version patch

# Minor version (1.0.0 -> 1.1.0) - for new features
npm version minor

# Major version (1.0.0 -> 2.0.0) - for breaking changes
npm version major
```

This will:
- Update `package.json`
- Create a git commit
- Create a git tag

## Post-Publishing

### 1. Push to Git

```bash
git push
git push --tags
```

### 2. Verify Publication

```bash
# View package page
npm view @harshvz/crawler

# Install from npm to test
npm install -g @harshvz/crawler
scraper
```

### 3. Create GitHub Release (Optional)

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Select the version tag
4. Add release notes
5. Publish release

## Testing Installation

### As CLI Tool

```bash
# Install globally
npm install -g @harshvz/crawler

# Run CLI
scraper
```

### As Package Dependency

```bash
# In another project
npm install @harshvz/crawler
```

```typescript
// In your code
import ScrapperServices from '@harshvz/crawler';

const scraper = new ScrapperServices('https://example.com');
await scraper.bfsScrape('/');
```

## Troubleshooting

### Issue: "You do not have permission to publish"

**Solution**: Make sure you're logged in with the correct npm account:

```bash
npm whoami
npm logout
npm login
```

### Issue: "Package name too similar to existing package"

**Solution**: Change the package name in `package.json` to something unique.

### Issue: "403 Forbidden - You cannot publish over the previously published versions"

**Solution**: Increment the version number:

```bash
npm version patch
npm publish --access public
```

### Issue: CLI command not found after global install

**Solution**: Check that the bin field in package.json is correct and the dist/index.js file has the shebang:

```javascript
#!/usr/bin/env node
```

## Updating the Package

When you want to publish updates:

```bash
# Make your changes
git add .
git commit -m "Your changes"

# Bump version
npm version patch  # or minor, or major

# Build
npm run build

# Publish
npm publish --access public

# Push to git
git push
git push --tags
```

## Unpublishing (Use with Caution)

⚠️ **Warning**: Unpublishing can break projects that depend on your package.

To unpublish a specific version:

```bash
npm unpublish @harshvz/crawler@1.0.0
```

To unpublish all versions (only allowed within 72 hours of publishing):

```bash
npm unpublish @harshvz/crawler --force
```

## Best Practices

1. **Semantic Versioning**: Follow semver (major.minor.patch)
2. **Changelog**: Maintain a CHANGELOG.md file
3. **Tests**: Add tests before publishing
4. **Documentation**: Keep README.md up-to-date
5. **CI/CD**: Set up automated testing and publishing
6. **Git Tags**: Tag releases in git
7. **Beta Testing**: Use npm tags for beta versions:
   ```bash
   npm publish --tag beta
   npm install @harshvz/crawler@beta
   ```

## npm Scripts Quick Reference

```bash
npm run dev          # Development mode with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Run the built CLI
npm publish          # Publish to npm (runs prepublishOnly automatically)
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Commands](https://docs.npmjs.com/cli/v8/commands)
- [Publishing Scoped Packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
