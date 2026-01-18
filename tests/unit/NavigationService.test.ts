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
            waitForNetworkIdle: jest.fn().mockResolvedValue(undefined),
            $: jest.fn(),
            evaluate: jest.fn()
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
            dataSelectors: {},
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

    test('extractData should return empty string if no data selectors configured', async () => {
        config.dataSelectors = {};
        navService = new NavigationService(mockPage as Page, config);
        const data = await navService.extractData();
        expect(data).toEqual('');
    });

    test('extractData should extract text from configured selectors', async () => {
        config.dataSelectors = { 'Balance': '#balance' };
        navService = new NavigationService(mockPage as Page, config);

        const mockElement = {};
        mockPage.$.mockResolvedValue(mockElement);
        mockPage.evaluate.mockResolvedValue('100.00');

        const data = await navService.extractData();

        expect(mockPage.$).toHaveBeenCalledWith('#balance');
        expect(data).toEqual('Balance: 100.00');
    });

    test('extractData should handle missing elements gracefully', async () => {
        config.dataSelectors = { 'Balance': '#balance' };
        navService = new NavigationService(mockPage as Page, config);

        mockPage.$.mockResolvedValue(null);

        const data = await navService.extractData();

        expect(data).toEqual('Balance: Not found');
    });
});
