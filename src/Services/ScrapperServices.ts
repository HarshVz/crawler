import { chromium, type Page } from "playwright";
import fs from 'fs';
import path from "path";
import os from "os";

class ScrapperServices {
    website: string;
    path: string;
    timeout: number;
    depth: number;

    constructor(website: string, depth: number = 0, customPath?: string) {
        this.website = website;
        this.path = customPath || path.join(os.homedir(), "knowledgeBase");
        this.timeout = 60000;
        this.depth = depth;

        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path, { recursive: true });
        }
    }

    buildFilePath = (endpoint: string) => {
        const safeName =
            endpoint === "/" ? "home" : endpoint.replace(/\//g, "_");

        const hostname = new URL(this.website).hostname;
        const folderName = hostname.replace(/[^a-zA-Z0-9]/g, "");
        // console.log(this.path);
        const screenshotsDir = path.join(this.path, folderName);
        // console.log(screenshotsDir);
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        const filePath = path.join(screenshotsDir, `${safeName}.png`);
        return filePath
    }

    buildContentPath = (endpoint: string) => {
        const safeName =
            endpoint === "/" ? "home" : endpoint.replace(/\//g, "_");

        const hostname = new URL(this.website).hostname;
        const folderName = hostname.replace(/[^a-zA-Z0-9]/g, "");

        const screenshotsDir = path.join(this.path, folderName);
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        const filePath = path.join(screenshotsDir, `${safeName}.md`);
        return filePath
    }

    writeFile = (filePath: string, data: string) => {
        try {
            fs.writeFileSync(filePath, data);
        } catch (error) {
            console.error(error);
        }
    }

    getLinks = async (page: Page): Promise<string[]> => {
        const links = await page.$$eval(
            "a[href]",
            (elements, website) => {
                const baseUrl = new URL(website);
                const uniquePaths = new Set<string>();

                elements.forEach(el => {
                    try {
                        const href = el.getAttribute('href');
                        if (!href) return;

                        const linkUrl = new URL(href, website);
                        if (linkUrl.href.includes(baseUrl.href)) {
                            let path = linkUrl.pathname;

                            if (path !== '/' && path.endsWith('/')) {
                                path = path.slice(0, -1);
                            }

                            uniquePaths.add(path);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                });

                return Array.from(uniquePaths);
            },
            this.website
        );
        return links;
    }

    countBackslashes = (path: string) => {
        return path.split('/').length - 1;
    }

    dfsScrape = async (
        endpoint: string = "/",
        results: string[] = [],
        visited: Record<string, boolean> = {}
    ) => {
        const stack = [endpoint];
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current) break;
            if (visited[current]) continue;
            visited[current] = true;

            const curr_depth = this.countBackslashes(current);
            if (this.depth != 0) {
                if (curr_depth > this.depth) continue;
            }

            console.log("   ".repeat(curr_depth) + `-> Processing ${current}`);
            results.push(current);

            const links = await this.useBrowser(current);
            for (const link of links) {
                if (!visited[link]) {
                    stack.push(link)
                }
            }

        }
    }

    bfsScrape = async (
        endpoint: string = "/",
        results: string[] = [],
        visited: Record<string, boolean> = {}
    ) => {
        const queue = [endpoint];
        while (queue.length > 0) {
            const size = queue.length;
            for (let i = 0; i < size; i++) {
                const current = queue.shift();
                if (!current) break;
                if (visited[current]) continue;
                visited[current] = true;

                const curr_depth = this.countBackslashes(current);
                if (this.depth != 0) {
                    if (curr_depth > this.depth) continue;
                }

                console.log("   ".repeat(curr_depth) + `-> Processing ${current}`);

                results.push(current);
                const links = await this.useBrowser(current);
                for (const link of links) {
                    if (!visited[link]) {
                        queue.push(link)
                    }
                }
            }
        }
    }

    useBrowser = async (
        endpoint: string = "/"
    ) => {
        let browser;
        try {
            browser = await chromium.launch();
        } catch (error: any) {
            console.error('\n❌ Error: Chromium browser not found!');
            console.error('Please install Playwright browsers by running:');
            console.error('  npx playwright install chromium\n');
            throw error;
        }

        const page = await browser.newPage();

        // Properly construct URL to avoid double slashes
        const originUrl = new URL(this.website).origin;
        const fullUrl = `${originUrl}${endpoint}`;

        try {
            await page.goto(fullUrl, {
                waitUntil: "networkidle",
                timeout: this.timeout
            });
        } catch (error: any) {
            console.error(`Failed to navigate to ${fullUrl}:`, error.message);
            await browser.close();
            return [];
        }

        // Extract metadata - using $eval to safely handle missing meta tags
        const metadata = {
            title: await page.title(),
            description: await page.$eval('meta[name="description"]', el => el.getAttribute("content")).catch(() => null),
            robots: await page.$eval('meta[name="robots"]', el => el.getAttribute("content")).catch(() => null),
            googlebot: await page.$eval('meta[name="googlebot"]', el => el.getAttribute("content")).catch(() => null),
            og: await page.$$eval('meta[property^="og:"]', metas =>
                Object.fromEntries(
                    metas.map(m => [m.getAttribute("property"), m.getAttribute("content")])
                )
            ).catch(() => ({})),
            twitter: await page.$$eval('meta[name^="twitter:"]', metas =>
                Object.fromEntries(
                    metas.map(m => [m.getAttribute("name"), m.getAttribute("content")])
                )
            ).catch(() => ({}))
        };

        const tags = page.locator("h1, h2, h3, h4, h5, h6, p, span");
        const texts = await tags.allTextContents();


        //2. build path and take screenshot.
        const filePath = this.buildFilePath(endpoint);
        // console.log(filePath)
        await page.screenshot({
            path: filePath,
            fullPage: true
        });

        const contentPath = this.buildContentPath(endpoint);
        this.writeFile(contentPath, JSON.stringify(metadata) + "\n" + texts.join("\n"));
        // console.log(`started scraping ${endpoint}`);

        //scrape current page Links;
        const links = await this.getLinks(page);
        await browser.close()
        // console.log(`completed scraping ${endpoint} - found ${links.length} unique internal links`);
        return links;
    }
}

export default ScrapperServices;