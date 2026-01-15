import { z } from 'zod';

// Mock dotenv to prevent it from loading .env file and overwriting our test env vars
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('Config Validation (src/config.ts)', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Restore env vars to original state before each test
        process.env = { ...originalEnv };
        
        // Mock console.error to avoid polluting test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Mock process.exit
        jest.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`Process.exit called with code ${code}`);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        process.env = originalEnv;
    });

    // Helper to set minimum required env vars
    const setMinimumEnv = () => {
        process.env.TARGET_URL = 'http://example.com';
        process.env.USERNAME_SELECTOR = '#user';
        process.env.PASSWORD_SELECTOR = '#pass';
        process.env.LOGIN_BUTTON_SELECTOR = '#btn';
        process.env.USER_LOGIN = 'myuser';
        process.env.USER_PASSWORD = 'mypassword';
    };

    test('should load successfully with minimum required variables and apply defaults', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            const config = require('../../src/config').default;

            expect(config.targetUrl).toBe('http://example.com');
            expect(config.credentials.username).toBe('myuser');
            expect(config.timeouts.selector).toBe(10000);
            expect(config.headless).toBe(true);
        });
    });

    test('should correctly parse and coerce custom numeric values', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            process.env.TIMEOUT_SELECTOR = '2000';
            process.env.DELAY_TYPING_MIN = '100';

            const config = require('../../src/config').default;

            expect(config.timeouts.selector).toBe(2000);
            expect(config.delays.typingMin).toBe(100);
        });
    });

    test('should correctly parse boolean values (headless)', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            process.env.HEADLESS = 'false';
            const configFalse = require('../../src/config').default;
            expect(configFalse.headless).toBe(false);
        });

        jest.isolateModules(() => {
            setMinimumEnv();
            process.env.HEADLESS = 'true';
            const configTrue = require('../../src/config').default;
            expect(configTrue.headless).toBe(true);
        });
    });

    test('should fail (process.exit) if TARGET_URL is missing', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            delete process.env.TARGET_URL;

            expect(() => {
                require('../../src/config');
            }).toThrow('Process.exit called with code 1');
        });
    });

    test('should fail if TARGET_URL is invalid', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            process.env.TARGET_URL = 'not-a-url';

            expect(() => {
                require('../../src/config');
            }).toThrow('Process.exit called with code 1');
        });
    });

    test('should fail if a required selector is missing', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            delete process.env.USERNAME_SELECTOR;

            expect(() => {
                require('../../src/config');
            }).toThrow('Process.exit called with code 1');
        });
    });

    test('should fail if credentials are missing', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            delete process.env.USER_PASSWORD;

            expect(() => {
                require('../../src/config');
            }).toThrow('Process.exit called with code 1');
        });
    });

    test('should allow optional fields to be undefined', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            delete process.env.POST_LOGIN_LINK_SELECTOR;
            delete process.env.NTFY_SERVER;

            const config = require('../../src/config').default;

            expect(config.selectors.postLoginLink).toBeUndefined();
            expect(config.ntfy.server).toBeUndefined();
        });
    });

    test('should parse optional fields when provided', () => {
        jest.isolateModules(() => {
            setMinimumEnv();
            process.env.POST_LOGIN_LINK_SELECTOR = '#link';
            process.env.NTFY_SERVER = 'https://ntfy.sh';

            const config = require('../../src/config').default;

            expect(config.selectors.postLoginLink).toBe('#link');
            expect(config.ntfy.server).toBe('https://ntfy.sh');
        });
    });
});
