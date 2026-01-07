const NavigationService = require('../../src/NavigationService');

describe('NavigationService Unit Tests', () => {
    let mockPage;
    let config;
    let navService;

    beforeEach(() => {
        mockPage = {
            waitForSelector: jest.fn(),
            click: jest.fn(),
            waitForNetworkIdle: jest.fn().mockResolvedValue()
        };

        config = {
            selectors: {
                postLoginLink: '#target'
            },
            timeouts: { navSelector: 100, networkIdle: 100 },
            delays: { navPauseMin: 0, navPauseMax: 0 }
        };

        navService = new NavigationService(mockPage, config);
    });

    test('clickTargetLink should find selector, click, and wait for network', async () => {
        const result = await navService.clickTargetLink();

        expect(mockPage.waitForSelector).toHaveBeenCalledWith('#target', expect.any(Object));
        expect(mockPage.click).toHaveBeenCalledWith('#target');
        expect(mockPage.waitForNetworkIdle).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    test('clickTargetLink should return false if no selector is configured', async () => {
        config.selectors.postLoginLink = null;
        navService = new NavigationService(mockPage, config);

        const result = await navService.clickTargetLink();

        expect(result).toBe(false);
        expect(mockPage.click).not.toHaveBeenCalled();
    });

    test('clickTargetLink should throw error if click fails', async () => {
        mockPage.click.mockRejectedValue(new Error('Click blocked'));

        await expect(navService.clickTargetLink()).rejects.toThrow('Click blocked');
    });
});
