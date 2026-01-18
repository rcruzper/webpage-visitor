import LoginService from '../../src/LoginService';
import { Page } from 'puppeteer';
import { Config } from '../../src/config';

describe('LoginService Unit Tests', () => {
    let mockPage: any;
    let config: Config;
    let loginService: LoginService;

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
                loginButton: '#btn',
                postLoginLink: undefined
            },
            dataSelectors: {},
            credentials: {
                username: 'testuser',
                password: 'testpass'
            },
            ntfy: {
                server: undefined,
                topic: undefined,
                user: undefined,
                password: undefined
            },
            timeouts: { selector: 100, networkIdle: 100 },
            delays: {
                typingMin: 0, typingMax: 0,
                loginPauseMin: 0, loginPauseMax: 0,
                navPauseMin: 0, navPauseMax: 0
            },
            headless: true,
            cronSchedule: undefined
        };

        loginService = new LoginService(mockPage as Page, config);
    });

    test('performLogin should execute the full login sequence', async () => {
        await loginService.performLogin();

        // 1. Navigate
        expect(mockPage.goto).toHaveBeenCalledWith('http://test.com', expect.any(Object));
        
        // 2. Wait for user input
        expect(mockPage.waitForSelector).toHaveBeenCalledWith('#user', expect.any(Object));
        
        // 3. Type Username (Focus + Type)
        expect(mockPage.focus).toHaveBeenCalledWith('#user');
        // Username length + Password length
        const totalChars = config.credentials.username.length + config.credentials.password.length;
        expect(mockPage.keyboard.type).toHaveBeenCalledTimes(totalChars);
        
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
