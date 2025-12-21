class NavigationService {
    constructor(page, config) {
        this.page = page;
        this.config = config;
    }

    async clickTargetLink() {
        const selector = this.config.selectors.postLoginLink;
        
        if (!selector) {
            console.log('No post-login link selector defined. Skipping click action.');
            return false;
        }

        try {
            console.log(`Looking for link with selector: ${selector}...`);
            
            // Wait for the element to be present and visible
            await this.page.waitForSelector(selector, { visible: true, timeout: 10000 });

            // Random pause before clicking
            await new Promise(r => setTimeout(r, this.getRandomInt(1000, 3000)));

            console.log('Clicking the target link...');
            
            // Promise.all is used to handle cases where the click triggers a navigation
            // We catch navigation errors in case the click acts as a simple JS trigger (Ajax) without page reload
            await Promise.all([
                this.page.click(selector),
                this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log('Navigation timeout or no navigation occurred (might be an AJAX click).'))
            ]);

            console.log('Link clicked successfully.');
            return true;

        } catch (error) {
            console.error(`Failed to click the link: ${error.message}`);
            return false;
        }
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = NavigationService;
