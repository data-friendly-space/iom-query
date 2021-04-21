const fs = require('fs').promises;
const { listToGroupList } = require('@togglecorp/fujs');
const { exec } = require('child_process');

// const dataFile = './data.json';
// const outputDir = 'extracted';

function wget(url, filename) {
    const promise = new Promise((resolve, reject) => {
        exec(`wget --server-response -q ${url} -O ${filename}`, (error) => {
            if (error !== null) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
    return promise;
}

function getHostname(url) {
    try {
        const { hostname } = new URL(url);
        return hostname;
    } catch (e) {
        return undefined;
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function createTimer(maxCount, timePeriod) {
    let lastCount = 0;
    let lastTimeAfterReset = new Date();

    return function register() {
        lastCount += 1;

        const now = new Date();

        if (lastCount >= maxCount) {
            const timeElapsedAfterReset = now.getTime() - lastTimeAfterReset.getTime();

            const timeToWait = timePeriod - timeElapsedAfterReset;
            const waitFor = timeToWait >= 0 ? timeToWait : 0;

            lastCount = 0;
            lastTimeAfterReset = now;
            return waitFor;
        }

        return 0;
    };
}

let completed = 0;
let completedAtStart = 0;
let total = 0;
let sites = 0;

async function saveHtml(url, fileName) {
    try {
        console.log(`Fetching: ${url} and writing at ${fileName}`);
        await wget(url, fileName);

        completed += 1;
        console.log(`Completed ${completed + completedAtStart}/${total} {${sites}}`);
    } catch (exception) {
        console.error(exception);
    }
}

async function saveHtmls(outputDir, fileUrls, LIMIT = 14, TIME = 60 * 1000) {
    sites += 1;

    // UNIT
    const UNIT_LIMIT = 1;
    const UNIT_TIME = Math.ceil(TIME / LIMIT);

    const timer = createTimer(UNIT_LIMIT, UNIT_TIME);
    // eslint-disable-next-line no-restricted-syntax
    for (const fileUrl of fileUrls) {
        const { id, webId, url } = fileUrl;
        // eslint-disable-next-line no-await-in-loop
        await saveHtml(url, `${outputDir}/${id}-${webId}.html`);
        const waitFor = timer();
        // eslint-disable-next-line no-await-in-loop
        await sleep(waitFor);
    }

    sites -= 1;
}

async function saveHtmlGroups(dataFile, outputDir) {
    const urlsFile = await fs.readFile(dataFile);
    const fileUrls = JSON.parse(urlsFile);

    try {
        await fs.stat(outputDir);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.mkdir(outputDir);
        }
    }

    const items = await fs.readdir(outputDir);
    const identifiers = new Set(
        items.map((item) => item.split('.')[0]),
    );
    const remainingFileUrls = fileUrls.filter(
        (item) => !identifiers.has(`${item.id}-${item.webId}`),
    );
    completedAtStart = fileUrls.length - remainingFileUrls.length;
    total = fileUrls.length;

    console.warn(`Resuming from ${completedAtStart}/${total}`);

    const groups = listToGroupList(
        remainingFileUrls,
        (item) => getHostname(item.url),
    );
    Object.keys(groups).forEach((key) => {
        saveHtmls(outputDir, groups[key]);
    });
}

if (process.argv.length !== 4) {
    console.error('Please pass data-file, output-directory');
    process.exit(1);
} else {
    saveHtmlGroups(process.argv[2], process.argv[3]);
}
