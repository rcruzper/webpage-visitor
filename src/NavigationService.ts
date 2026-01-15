import { Page } from 'puppeteer';
import { Config } from './config';

class NavigationService {
    private page: Page;
    private config: Config;

    constructor(page: Page, config: Config) {
        this.page = page;
        this.config = config;
    }

    public async clickTargetLink(): Promise<boolean> {
        const selector = this.config.selectors.postLoginLink;

        if (!selector) {
            console.log('No post-login link selector defined. Skipping click action.');
            return false;
        }

        try {
            console.log(`Looking for link with selector: ${selector}...`);

            // Wait for the element to be present and visible
            await this.page.waitForSelector(selector, {
                visible: true,
                timeout: this.config.timeouts.selector
            });

            // Random pause before clicking
            await new Promise(r => setTimeout(r, this.getRandomInt(this.config.delays.navPauseMin, this.config.delays.navPauseMax)));

            console.log('Clicking the target link...');
            try {
                // Click and wait for potential network activity
                await this.page.click(selector);

                // Wait for any resulting network activity to settle (AJAX or Navigation)
                // Using a short timeout because index.js also has a final wait
                await this.page.waitForNetworkIdle({
                    idleTime: 500,
                    timeout: this.config.timeouts.networkIdle
                }).catch(() => {
                    console.log('Network did not idle after click (background tasks active), continuing...');
                });
            } catch (clickError: any) {
                console.error(`Click failed: ${clickError.message}`);
                throw clickError;
            }

            console.log('Link clicked successfully.');
            return true;

        } catch (error: any) {
            console.error(`Failed to click the link: ${error.message}`);
            throw error;
        }
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export default NavigationService;
