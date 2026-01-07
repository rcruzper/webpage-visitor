const LoginService = require('../../src/LoginService');

describe('LoginService Unit Tests', () => {
    let mockPage;
    let config;
    let loginService;

    beforeEach(() => {
        // Mock Puppeteer Page object
        mockPage = {
            goto: jest.fn(),
            waitForSelector: jest.fn(),
            focus: jest.fn(),
            keyboard: {
                type: jest.fn()
            },
            click: jest.fn(),
            waitForNavigation: jest.fn()
        };

        // Mock Config
        config = {
            targetUrl: 'http://test.com',
            selectors: {
                username: '#user',
                password: '#pass',
                loginButton: '#btn'
            },
            credentials: {
                username: 'testuser',
                password: 'testpass'
            },
            timeouts: { selector: 100 },
            delays: {
                typingMin: 0, typingMax: 0,
                loginPauseMin: 0, loginPauseMax: 0
            }
        };

        loginService = new LoginService(mockPage, config);
    });

    test('performLogin should execute the full login sequence', async () => {
        await loginService.performLogin();

        // 1. Navigate
        expect(mockPage.goto).toHaveBeenCalledWith('http://test.com', expect.any(Object));
        
        // 2. Wait for user input
        expect(mockPage.waitForSelector).toHaveBeenCalledWith('#user', expect.any(Object));
        
        // 3. Type Username (Focus + Type)
        expect(mockPage.focus).toHaveBeenCalledWith('#user');
        expect(mockPage.keyboard.type).toHaveBeenCalledTimes(config.credentials.username.length + config.credentials.password.length);
        
        // 4. Click Login
        expect(mockPage.click).toHaveBeenCalledWith('#btn');
        
        // 5. Wait for Navigation (domcontentloaded)
        expect(mockPage.waitForNavigation).toHaveBeenCalledWith(expect.objectContaining({ waitUntil: 'domcontentloaded' }));
    });

    test('performLogin should throw error if Puppeteer fails', async () => {
        mockPage.waitForSelector.mockRejectedValue(new Error('Selector not found'));

        await expect(loginService.performLogin()).rejects.toThrow('Selector not found');
    });
});
