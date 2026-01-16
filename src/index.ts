#!/usr/bin/env node
import ScrapperServices from "./Services/ScrapperServices.js"
import inquirer from 'inquirer';

inquirer.prompt([
    {
        type: 'input',
        name: 'url',
        message: 'Enter URL to scrape',
        validate: (input) => {
            if (!input) {
                return 'Please enter a URL';
            }
            return true;
        }
    },
    {
        type: 'input',
        name: 'algo',
        message: 'Enter algorithm to use: either (bfs or dfs)',
        choices: ['bfs', 'dfs'],
        validate: (input) => {
            if (!input) {
                return 'Please enter an algorithm';
            }
            if (input !== 'bfs' && input !== 'dfs') {
                return 'Please enter a valid algorithm';
            }
            return true;
        }
    }

]).then(async (answers) => {
    console.log("-".repeat(20));
    console.log("Scrapping started");
    console.log("-".repeat(20));

    const scrapper = new ScrapperServices(answers.url);

    try {
        const url = new URL(answers.url);
        if (answers.algo === 'bfs') await scrapper.bfsScrape(url.pathname);
        else await scrapper.dfsScrape(url.pathname);

        console.log("-".repeat(20));
        console.log("Scrapping completed");
        console.log("-".repeat(20));
        process.exit(0);
    } catch (e) {
        console.error(e);
        console.log("-".repeat(20));
        console.log("Scrapping failed");
        console.log("-".repeat(20));
        process.exit(1);
    }

}).catch((error) => {
    console.error(error);
    console.log("-".repeat(20));
    console.log("Prompt failed");
    console.log("-".repeat(20));
    process.exit(1);
})

export default ScrapperServices;