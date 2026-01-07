// Only load .env file if not in production (Docker handles env vars in production)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    targetUrl: process.env.TARGET_URL,
    selectors: {
        username: process.env.USERNAME_SELECTOR,
        password: process.env.PASSWORD_SELECTOR,
        loginButton: process.env.LOGIN_BUTTON_SELECTOR,
        postLoginLink: process.env.POST_LOGIN_LINK_SELECTOR
    },
    credentials: {
        username: process.env.USER_LOGIN,
        password: process.env.USER_PASSWORD
    },
    ntfy: {
        server: process.env.NTFY_SERVER, // e.g., 'https://ntfy.sh' or 'http://ntfy:80'
        topic: process.env.NTFY_TOPIC,
        user: process.env.NTFY_USER,
        password: process.env.NTFY_PASSWORD
    },
    timeouts: {
        selector: parseInt(process.env.TIMEOUT_SELECTOR || '10000'), // Specific for post-login link
        networkIdle: parseInt(process.env.TIMEOUT_NETWORK_IDLE || '5000')
    },
    delays: {
        typingMin: parseInt(process.env.DELAY_TYPING_MIN || '50'),
        typingMax: parseInt(process.env.DELAY_TYPING_MAX || '150'),
        loginPauseMin: parseInt(process.env.DELAY_LOGIN_PAUSE_MIN || '500'),
        loginPauseMax: parseInt(process.env.DELAY_LOGIN_PAUSE_MAX || '1500'),
        navPauseMin: parseInt(process.env.DELAY_NAV_PAUSE_MIN || '1000'),
        navPauseMax: parseInt(process.env.DELAY_NAV_PAUSE_MAX || '3000')
    },
    headless: process.env.HEADLESS === 'true',
    cronSchedule: process.env.CRON_SCHEDULE
};
