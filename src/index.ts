#!/usr/bin/env node
import Scraper from "./Services/Scraper.js";
import ContentExtractor from "./Services/ContentExtractor.js";
import FileService from "./Services/FileService.js";
import inquirer from "inquirer";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import os from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(`v${packageJson.version}`);
  process.exit(0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
@harshvz/crawler v${packageJson.version}

A powerful web scraping tool built with Playwright

Usage:
  scraper [options]

Options:
  -v, --version    Show version number
  -h, --help       Show help

Interactive Mode:
  Simply run 'scraper' and follow the prompts to:
  - Enter URL to scrape
  - Choose algorithm (BFS or DFS)
  - Choose format (md, json, csv)
  - Set delay between requests
  - Specify custom tags/selectors to extract (optional)
  - Specify output directory (optional)

Tag/Selector Guide:
  By default, all content tags are extracted (h1-h6, p, a, img, li, etc.).
  You can limit extraction to specific tags or CSS selectors:
    Enter as comma-separated values, e.g.: h1, p, a, img
    Or CSS selectors: .main-content, #title, a.product-link
  When custom tags are set, extracted links (a) include their href
  and images (img) include their src and alt attributes in the output.

Examples:
  scraper              Start interactive mode
  scraper --version    Show version
  scraper --help       Show this help message

For more information, visit:
https://github.com/harshvz/crawler
    `);
  process.exit(0);
}

inquirer
  .prompt([
    {
      type: "input",
      name: "url",
      message: "Enter URL to scrape: ",
      validate: (input) => {
        if (!input) {
          return "Please enter a URL";
        }
        try {
          new URL(input);
          return true;
        } catch {
          return "Please enter a valid URL";
        }
      },
    },
    {
      type: "input",
      name: "depth",
      message: "Enter depth to scrape (-1 for infinite): ",
      default: "-1",
      validate: (input) => {
        if (!input && typeof input !== "number") {
          return "Please enter a depth";
        }
        if (Number(input) < -1) {
          return "Please enter a valid depth";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "algo",
      message: "Enter algorithm to use (bfs or dfs): ",
      default: "bfs",
      validate: (input) => {
        if (!input) {
          return "Please enter an algorithm";
        }
        if (input !== "bfs" && input !== "dfs") {
          return 'Please enter either "bfs" or "dfs"';
        }
        return true;
      },
    },
    {
      type: "input",
      name: "format",
      message: "Enter format to use (md, json, or csv): ",
      default: "md",
      validate: (input) => {
        if (!input) {
          return "Please enter a format";
        }
        if (!["md", "json", "csv"].includes(input)) {
          return 'Please enter "md", "json", or "csv"';
        }
        return true;
      },
    },
    {
      type: "input",
      name: "delay",
      message: "Enter delay between requests in ms (0 for none): ",
      default: "0",
      validate: (input) => {
        if (isNaN(Number(input)) || Number(input) < 0) {
          return "Please enter a valid number";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "tags",
      message: "Enter tags/selectors to extract (comma-separated, blank for all): ",
      default: "",
    },
    {
      type: "input",
      name: "outputPath",
      message: "Enter output directory (press Enter for default): ",
      default: join(os.homedir(), "knowledgeBase"),
      validate: (input) => {
        if (!input) {
          return "Please enter a path or press Enter for default";
        }
        return true;
      },
    },
  ])
  .then(async (answers) => {
    console.log("-".repeat(20));
    console.log("Scraping started");
    console.log(`URL: ${answers.url}`);
    console.log(`Algorithm: ${answers.algo.toUpperCase()}`);
    console.log(`Format: ${answers.format.toUpperCase()}`);
    console.log(`Depth: ${answers.depth}`);
    console.log(`Delay: ${answers.delay}ms`);
    console.log(`Tags: ${answers.tags || "all"}`);
    console.log(`Output: ${answers.outputPath}`);
    console.log("-".repeat(20));

    const scraper = new Scraper(answers.url, {
      depth: Number(answers.depth),
      format: answers.format,
      delay: Number(answers.delay),
      outputPath: answers.outputPath,
      tags: answers.tags || undefined,
    });

    try {
      const url = new URL(answers.url);
      if (answers.algo === "bfs") await scraper.bfs(url.pathname);
      else await scraper.dfs(url.pathname);

      console.log("-".repeat(20));
      console.log("Scraping completed successfully!");
      console.log(`Files saved to: ${answers.outputPath}`);
      console.log("-".repeat(20));
      process.exit(0);
    } catch (e) {
      console.error(e);
      console.log("-".repeat(20));
      console.log("Scraping failed");
      console.log("-".repeat(20));
      process.exit(1);
    } finally {
      await scraper.close();
    }
  })
  .catch((error) => {
    console.error(error);
    console.log("-".repeat(20));
    console.log("❌ Prompt failed");
    console.log("-".repeat(20));
    process.exit(1);
  });

export { Scraper, ContentExtractor, FileService };
export default Scraper;
