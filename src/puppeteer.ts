import puppeteer from "puppeteer-core";
import loadObscura from "obscura-node";
import { URL } from "node:url";
import type { Page } from "playwright-core";

const obscura = await loadObscura({ stealth: true });
const browser = await puppeteer.connect({ browserWSEndpoint: obscura.wsEndpoint });
const page = await browser.newPage();

// await page.goto('https://harshdarji.dev');  // <- add this

// const pageUrls = await page.evaluate(() => {
//   //   @ts-ignore
//   const urlArray = Array.from(document.links).map(link => link.href);
//   return [...new Set(urlArray)];
// });

// console.log(pageUrls); // Now you'll see links

class Scrapper {
  private origin: string;

  constructor(private baseUrl: string) {
    const url = new URL(baseUrl);
    this.origin = url.origin;
  }

  private getLinks = async (page: Page) => {
    const pageUrls = await page.evaluate(() => {
        //   @ts-ignore
        const urlArray = Array.from(document.links).map(link => link.href.trim());
        return [...new Set(urlArray)];
    });
    return pageUrls.filter(url => url.includes(this.origin));
  };

  async bfs(page: any) {
    const queue = [this.baseUrl];
    const visited = new Set<string>();

    while(queue.length > 0) {
        for(let i = 0; i < queue.length; i++) {
            const url = queue.shift();
            if(!url) break;
            if (visited.has(url)) continue;
            visited.add(url);

            try {
                await page.goto(url);
                console.log(`Visited: ${url}`);
                console.log(`Title: ${await page.title()}`);

                const links = await this.getLinks(page);
                for (const link of links) {
                    if (!visited.has(link) && !queue.includes(link)) {
                        queue.push(link);
                    }
                }
            } catch (err) {
                console.error(`Failed to visit ${url}:`, err);
            }
         }
        }
    }

  async dfs(page: any) {
    const stack = [this.baseUrl];
    const visited = new Set<string>();

    while (stack.length) {
      const url = stack.pop();
      if(!url) break;
      if (visited.has(url)) continue;
      visited.add(url);

      try {
        await page.goto(url);
        console.log(`Visited: ${url}`);
        console.log(`Title: ${await page.title()}`);

        const links = await this.getLinks(page);
        for (const link of links) {
          if (!visited.has(link) && !stack.includes(link)) {
            stack.push(link);
          }
        }
      } catch (err) {
        console.error(`Failed to visit ${url}:`, err);
      }
    }
  }
}

export default Scrapper;

const scrapper = new Scrapper("https://harshdarji.dev");
await scrapper.dfs(page);
await scrapper.bfs(page);
