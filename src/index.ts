#!/usr/bin/env node
import ScrapperServices from "./Services/ScrapperServices.js"
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

// Check for --version or -v flag
if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(`v${packageJson.version}`);
    process.exit(0);
}

// Check for --help or -h flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
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
  - Specify output directory (optional)

Examples:
  scraper              Start interactive mode
  scraper --version    Show version
  scraper --help       Show this help message

For more information, visit:
https://github.com/harshvz/crawler
    `);
    process.exit(0);
}

inquirer.prompt([
    {
        type: 'input',
        name: 'url',
        message: 'Enter URL to scrape: ',
        validate: (input) => {
            if (!input) {
                return 'Please enter a URL';
            }
            try {
                new URL(input);
                return true;
            } catch {
                return 'Please enter a valid URL';
            }
        }
    },
    {
        type: 'input',
        name: 'algo',
        message: 'Enter algorithm to use (bfs or dfs): ',
        default: 'bfs',
        validate: (input) => {
            if (!input) {
                return 'Please enter an algorithm';
            }
            if (input !== 'bfs' && input !== 'dfs') {
                return 'Please enter either "bfs" or "dfs"';
            }
            return true;
        }
    },
    {
        type: 'input',
        name: 'outputPath',
        message: 'Enter output directory (press Enter for default): ',
        default: join(os.homedir(), 'knowledgeBase'),
        validate: (input) => {
            if (!input) {
                return 'Please enter a path or press Enter for default';
            }
            return true;
        }
    }

]).then(async (answers) => {
    console.log("-".repeat(20));
    console.log("Scraping started");
    console.log(`URL: ${answers.url}`);
    console.log(`Algorithm: ${answers.algo.toUpperCase()}`);
    console.log(`Output: ${answers.outputPath}`);
    console.log("-".repeat(20));

    const scrapper = new ScrapperServices(answers.url, 0, answers.outputPath);

    try {
        const url = new URL(answers.url);
        if (answers.algo === 'bfs') await scrapper.bfsScrape(url.pathname);
        else await scrapper.dfsScrape(url.pathname);

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
    }

}).catch((error) => {
    console.error(error);
    console.log("-".repeat(20));
    console.log("❌ Prompt failed");
    console.log("-".repeat(20));
    process.exit(1);
})

export default ScrapperServices;