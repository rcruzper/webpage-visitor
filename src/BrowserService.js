const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const config = require('./config');

class BrowserService {
    async launchBrowser() {
        // Launch browser with stealth settings
        const browser = await puppeteer.launch({
            headless: config.headless ? "new" : false, 
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            dumpio: false, // Set to false to hide browser process logs (like D-Bus errors)
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--window-size=1280,800',
                '--log-level=3', // Silence most Chrome logs (0 = default, 3 = fatal only)
                '--no-first-run',
                '--no-zygote'
            ]
        });
        return browser;
    }

    async createPage(browser) {
        const page = await browser.newPage();
        
        // Set a standard User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Set viewport
        await page.setViewport({ width: 1280, height: 800 });

        return page;
    }
}

module.exports = new BrowserService();
