const config = require('./src/config');
const browserService = require('./src/BrowserService');
const LoginService = require('./src/LoginService');

(async () => {
    // Validate config
    if (!config.targetUrl || !config.credentials.username || !config.credentials.password) {
        console.error('Missing configuration. Please check your .env file.');
        process.exit(1);
    }

    const browser = await browserService.launchBrowser();
    const page = await browserService.createPage(browser);

    const loginService = new LoginService(page, config);
    const success = await loginService.performLogin();

    if (success) {
        console.log('Login process completed. Taking a screenshot for verification...');
        // Ensure output directory exists (in case it wasn't created)
        const fs = require('fs');
        if (!fs.existsSync('output')) fs.mkdirSync('output');
        
        await page.screenshot({ path: 'output/login_success.png' });
        
        // Here you can add more logic to do after login
        // e.g. scrape data, check notifications, etc.
        
        console.log('Closing browser in 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
    } else {
        console.error('Login process failed.');
    }

    await browser.close();
})();
