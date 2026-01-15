import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import config from './config';

puppeteer.use(StealthPlugin());

class BrowserService {
    public async launchBrowser(): Promise<Browser> {
        // Launch browser with stealth settings
        const browser = await puppeteer.launch({
            headless: config.headless,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            dumpio: false, // false to hide browser process logs (like D-Bus errors)
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--window-size=2560,1440',
                '--log-level=3', // Silence most Chrome logs (0 = default, 3 = fatal only)
                '--no-first-run',
                '--no-zygote'
            ]
        });
        return browser as unknown as Browser;
    }

    public async createPage(browser: Browser): Promise<Page> {
        const page = await browser.newPage();

        // Set a standard User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set viewport to 1440p
        await page.setViewport({width: 2560, height: 1440});

        // Optimization: Block unnecessary resources
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            const resourceType = req.resourceType();
            const blockedTypes = ['font', 'media', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];

            if (blockedTypes.includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        return page;
    }
}

export default new BrowserService();
