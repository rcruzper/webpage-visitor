class LoginService {
    constructor(page, config) {
        this.page = page;
        this.config = config;
    }

    async performLogin() {
        try {
            console.log(`Navigating to ${this.config.targetUrl}...`);
            await this.page.goto(this.config.targetUrl, { waitUntil: 'networkidle2' });

            // Wait for selector to be visible
            await this.page.waitForSelector(this.config.selectors.username, {
                visible: true,
                timeout: this.config.timeouts.selector
            });

            // Type username with delay to simulate human typing
            console.log('Typing username...');
            await this.typeHumanLike(this.config.selectors.username, this.config.credentials.username);

            // Small pause
            await new Promise(r => setTimeout(r, this.getRandomInt(this.config.delays.loginPauseMin, this.config.delays.loginPauseMax)));

            // Type password
            console.log('Typing password...');
            await this.typeHumanLike(this.config.selectors.password, this.config.credentials.password);

            // Small pause
            await new Promise(r => setTimeout(r, this.getRandomInt(this.config.delays.loginPauseMin, this.config.delays.loginPauseMax)));

            // Click login button
            console.log('Clicking login button...');
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                this.page.click(this.config.selectors.loginButton)
            ]);

            console.log('Login successfully initiated.');
            return true;

        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async typeHumanLike(selector, text) {
        await this.page.focus(selector);
        for (const char of text) {
            await this.page.keyboard.type(char, {
                delay: this.getRandomInt(this.config.delays.typingMin, this.config.delays.typingMax)
            });
        }
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = LoginService;
