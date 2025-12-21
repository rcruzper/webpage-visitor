const config = require('./src/config');
const browserService = require('./src/BrowserService');
const LoginService = require('./src/LoginService');

(async () => {
    console.log('Starting visitor service...');
    
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
        console.log('Login process completed. Waiting for page to stabilize...');
        
        // Wait for network to be idle (no more than 2 connections for 500ms)
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {
            console.log('Network did not become fully idle, proceeding anyway...');
        });

        // Add a deliberate 3-second pause to ensure animations/renders are finished
        await new Promise(r => setTimeout(r, 3000));

        console.log('Taking a screenshot for verification...');
        // Ensure output directory exists (in case it wasn't created)
        const fs = require('fs');
        if (!fs.existsSync('output')) fs.mkdirSync('output');
        
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        const screenshotPath = `output/login_success_${timestamp}.png`;
        
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to ${screenshotPath}`);
        
        // Here you can add more logic to do after login
        // e.g. scrape data, check notifications, etc.
        
        console.log('Closing browser in 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
    } else {
        console.error('Login process failed.');
    }

    await browser.close();
})();
