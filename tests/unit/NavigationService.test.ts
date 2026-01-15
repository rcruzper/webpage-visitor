import NavigationService from '../../src/NavigationService';
import { Page } from 'puppeteer';
import { Config } from '../../src/config';

describe('NavigationService Unit Tests', () => {
    let mockPage: any;
    let config: Config;
    let navService: NavigationService;

    beforeEach(() => {
        mockPage = {
            waitForSelector: jest.fn(),
            click: jest.fn(),
            waitForNetworkIdle: jest.fn().mockResolvedValue(undefined)
        };

        // Create a valid config object satisfying the Zod schema types
        config = {
            targetUrl: 'http://example.com',
            selectors: {
                username: '#user',
                password: '#pass',
                loginButton: '#btn',
                postLoginLink: '#target'
            },
            credentials: {
                username: 'user',
                password: 'pass'
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

        navService = new NavigationService(mockPage as Page, config);
    });

    test('clickTargetLink should find selector, click, and wait for network', async () => {
        const result = await navService.clickTargetLink();

        expect(mockPage.waitForSelector).toHaveBeenCalledWith('#target', expect.any(Object));
        expect(mockPage.click).toHaveBeenCalledWith('#target');
        expect(mockPage.waitForNetworkIdle).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    test('clickTargetLink should return false if no selector is configured', async () => {
        config.selectors.postLoginLink = undefined;
        navService = new NavigationService(mockPage as Page, config);

        const result = await navService.clickTargetLink();

        expect(result).toBe(false);
        expect(mockPage.click).not.toHaveBeenCalled();
    });

    test('clickTargetLink should throw error if click fails', async () => {
        mockPage.click.mockRejectedValue(new Error('Click blocked'));

        await expect(navService.clickTargetLink()).rejects.toThrow('Click blocked');
    });
});
