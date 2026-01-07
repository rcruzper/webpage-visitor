const config = require('./src/config');
const browserService = require('./src/BrowserService');
const LoginService = require('./src/LoginService');
const NavigationService = require('./src/NavigationService');
const cron = require('node-cron');
const fs = require('fs');

// Main bot logic encapsulated
async function runBot() {
    console.log(`[${new Date().toISOString()}] Starting visitor routine...`);
    
    // Validate config
    if (!config.targetUrl || !config.credentials.username || !config.credentials.password) {
        console.error('Missing configuration. Please check your .env file.');
        return; 
    }

    let browser = null;
    try {
        browser = await browserService.launchBrowser();
        const page = await browserService.createPage(browser);

        const loginService = new LoginService(page, config);
        const success = await loginService.performLogin();

        if (success) {
            console.log('Login process completed. Waiting for page to stabilize...');
            
            // Wait for network to be idle
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {
                console.log('Network did not become fully idle, proceeding anyway...');
            });

            // Perform post-login navigation/click
            const navService = new NavigationService(page, config);
            await navService.clickTargetLink();

            // Deliberate pause before screenshot (to capture the result of the click)
            console.log('Waiting for content to load after action...');
            await new Promise(r => setTimeout(r, 3000));

            console.log('Taking a screenshot for verification...');
            if (!fs.existsSync('output')) fs.mkdirSync('output');
            
            const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
            const screenshotPath = `output/login_success_${timestamp}.png`;
            
            await page.screenshot({ path: screenshotPath });
            console.log(`Screenshot saved to ${screenshotPath}`);
            
            console.log('Routine finished successfully.');
        } else {
            console.error('Login process failed.');
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Execution entry point
if (config.cronSchedule) {
    console.log(`Scheduler activated. Cron expression: "${config.cronSchedule}"`);
    
    // Validate cron expression
    if (!cron.validate(config.cronSchedule)) {
        console.error('Invalid CRON_SCHEDULE format. Exiting.');
        process.exit(1);
    }

    // Schedule the task
    cron.schedule(config.cronSchedule, async () => {
        // Calculate a random delay between 0 and 5 minutes
        const delayMs = Math.floor(Math.random() * 5 * 60 * 1000);
        const delayMinutes = (delayMs / 60000).toFixed(2);
        
        console.log(`[${new Date().toISOString()}] Cron triggered. Waiting ${delayMinutes} minutes to randomize execution...`);
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
        runBot();
    });
    
    console.log('Waiting for the next scheduled run...');
    // Keep the process alive
} else {
    // Run once immediately (legacy mode)
    console.log('No CRON_SCHEDULE defined. Running once immediately.');
    runBot();
}