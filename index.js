const config = require('./src/config');
const browserService = require('./src/BrowserService');
const LoginService = require('./src/LoginService');
const NavigationService = require('./src/NavigationService');
const notificationService = require('./src/NotificationService');
const cron = require('node-cron');

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
        await loginService.performLogin();

        console.log('Login process completed. Proceeding to navigation...');

        // Perform post-login navigation/click
        const navService = new NavigationService(page, config);
        await navService.clickTargetLink();

        // Wait for content to settle
        console.log('Waiting for content to settle before screenshot...');
        try {
            await page.waitForNetworkIdle({idleTime: 500, timeout: config.timeouts.networkIdle, concurrency: 2});
        } catch (e) {
            console.log('Network busy, proceeding to screenshot anyway...');
        }

        console.log('Taking a screenshot for verification...');
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        const filename = `login_success_${timestamp}.png`;

        // Capture screenshot in memory (Buffer)
        const imageBuffer = await page.screenshot({encoding: 'binary'});

        // Send notification via Ntfy
        await notificationService.sendSnapshot(imageBuffer, filename, 'Login successful. Action performed.');

        console.log('Routine finished successfully.');
    } catch (error) {
        console.error('An unexpected error occurred:', error);

        // Attempt to take an error screenshot
        if (browser) {
            try {
                const pages = await browser.pages();
                const page = pages.length > 0 ? pages[0] : null;

                if (page) {
                    console.log('Capturing error state screenshot...');
                    const errorImageBuffer = await page.screenshot({encoding: 'binary'});
                    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');

                    await notificationService.sendSnapshot(errorImageBuffer, `error_${timestamp}.png`, `Bot FAILED ❌\nReason: ${error.message}`, '5');
                }
            } catch (snapshotError) {
                console.error('Could not capture error screenshot:', snapshotError);
            }
        }
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Execution entry point
if (require.main === module) {
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
            await runBot();
            console.log(`[${new Date().toISOString()}] Cycle complete. Waiting for the next scheduled run...`);
        });

        // Keep the process alive
    } else {
        // Run once immediately (legacy mode)
        console.log('No CRON_SCHEDULE defined. Running once immediately.');
        runBot();
    }
}

module.exports = {runBot};