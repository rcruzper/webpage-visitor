// Only load .env file if not in production (Docker handles env vars in production)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    targetUrl: process.env.TARGET_URL,
    selectors: {
        username: process.env.USERNAME_SELECTOR,
        password: process.env.PASSWORD_SELECTOR,
        loginButton: process.env.LOGIN_BUTTON_SELECTOR
    },
    credentials: {
        username: process.env.USER_LOGIN,
        password: process.env.USER_PASSWORD
    },
    headless: process.env.HEADLESS === 'true'
};
