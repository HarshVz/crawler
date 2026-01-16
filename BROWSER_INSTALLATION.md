# Browser Installation Explained

## How It Works

When users install your package, here's what happens:

### For Global Installation

```bash
npm install -g @harshvz/crawler
```

1. ✅ npm downloads and installs `@harshvz/crawler`
2. ✅ npm installs dependencies (playwright, inquirer, yargs)
3. ✅ **postinstall script runs**: `playwright install chromium`
4. ✅ Chromium browser (~300MB) is downloaded automatically
5. ✅ Users can immediately run `scraper` command

### For Project Dependency

```bash
npm install @harshvz/crawler
```

Same process as above - the postinstall script ensures browsers are installed.

## What We Added

### 1. Postinstall Script (package.json)

```json
"scripts": {
    "postinstall": "playwright install chromium"
}
```

- **Runs automatically** after `npm install`
- Downloads only Chromium (not Firefox or WebKit)
- Size: ~300MB
- Only happens once per installation

### 2. Better Error Handling (ScrapperServices.ts)

```typescript
try {
    browser = await chromium.launch();
} catch (error: any) {
    console.error('\n❌ Error: Chromium browser not found!');
    console.error('Please install Playwright browsers by running:');
    console.error('  npx playwright install chromium\n');
    throw error;
}
```

If somehow the browser isn't installed, users get a **clear, helpful error message** instead of a cryptic error.

## User Experience

### Successful Installation

```
$ npm install -g @harshvz/crawler

> @harshvz/crawler@1.0.0 postinstall
> playwright install chromium

Downloading Chromium 130.0.6723.31 (playwright build v1140)
...
Chromium 130.0.6723.31 (playwright build v1140) downloaded to /Users/home/.cache/ms-playwright/chromium-1140

added 123 packages in 45s
```

Users see the browser download happening and know it's working.

### If Browser Missing (Fallback)

If the postinstall somehow fails or is skipped:

```
$ scraper

❌ Error: Chromium browser not found!
Please install Playwright browsers by running:
  npx playwright install chromium
```

Users get clear instructions on how to fix it.

## Important Notes

### Pros ✅

- **Zero configuration** - works out of the box
- **Better UX** - users don't need to manually install browsers
- **Clear errors** - if something fails, users know exactly what to do

### Cons ⚠️

- **Larger install size** - ~300MB for Chromium
- **Longer install time** - can take 30-60 seconds depending on internet speed
- **Corporate firewalls** - some environments may block the download

### When Postinstall Won't Run

The postinstall script will be **skipped** in these cases:

1. **npm install with `--ignore-scripts`**:
   ```bash
   npm install -g @harshvz/crawler --ignore-scripts
   ```

2. **CI/CD environments** with strict security policies

3. **Offline installations**

In these cases, users will need to manually run:
```bash
npx playwright install chromium
```

But our error handling will guide them!

## Alternative Approaches (Not Recommended)

### Option 1: Don't Auto-Install (Manual Installation Required)

**Pros**: Smaller package, faster install
**Cons**: Users must read docs and manually install browsers - bad UX

### Option 2: Use playwright-core + Browser CDN

**Pros**: No postinstall needed
**Cons**: Complex setup, unreliable browser access

### Option 3: Bundle Chromium in Package

**Pros**: Everything included
**Cons**: HUGE package size (~300MB), violates npm best practices

## Our Solution is Best Because:

1. ✅ **Just works** for 99% of users
2. ✅ **Clear error messages** for the 1% edge cases
3. ✅ **Standard practice** for Playwright packages
4. ✅ **Only downloads what's needed** (just Chromium, not all browsers)

## Testing the Installation

### Test Locally

```bash
# Build your package
npm run build

# Install globally
npm install -g .

# The postinstall will run and you'll see:
# > playwright install chromium
# Downloading Chromium...

# Test it works
scraper
```

### Test Published Package

After publishing to npm:

```bash
npm install -g @harshvz/crawler
# Should see browser download
# Then immediately works:
scraper
```

## Documentation Updated

We've updated these docs to mention browser installation:

- ✅ **README.md** - Installation section notes automatic download
- ✅ **QUICKSTART.md** - Explains ~300MB download during install
- ✅ **CHANGELOG.md** - Lists this as a feature
- ✅ **PUBLISH_READY.md** - Will update next

## Summary

**Yes, Chromium will be automatically installed** when users install your package! 🎉

The postinstall script handles this seamlessly, and if it fails, users get clear error messages on how to fix it.

Your package is now truly **zero-configuration** and ready to use out of the box!
