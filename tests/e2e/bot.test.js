const mockServer = require('./mockServer');
const { runBot } = require('../../index');
const http = require('http');

// Mocks
jest.mock('../../src/config', () => ({
    targetUrl: 'http://localhost:3000/login', // Dynamic port handled in setup
    selectors: {
        username: '#username',
        password: '#password',
        loginButton: '#login-btn',
        postLoginLink: '#target-link'
    },
    credentials: {
        username: 'testuser',
        password: 'testpass'
    },
    ntfy: {
        server: 'http://localhost',
        topic: 'test',
    },
    timeouts: {
        selector: 1000,
        networkIdle: 1000
    },
    delays: {
        typingMin: 0,
        typingMax: 0,
        loginPauseMin: 0,
        loginPauseMax: 0,
        navPauseMin: 0,
        navPauseMax: 0
    },
    headless: true // Important for CI/Test env
}));

// Mock Notification Service to avoid real network calls and assert success
jest.mock('../../src/NotificationService', () => ({
    sendSnapshot: jest.fn()
}));

const notificationService = require('../../src/NotificationService');

// Increase timeout for the entire suite to handle Puppeteer's slow interactions
jest.setTimeout(30000);

describe('E2E Bot Flow', () => {
    let server;
    let port;

    beforeAll((done) => {
        // Start Mock Server on a random port
        server = http.createServer(mockServer);
        server.listen(0, () => {
            port = server.address().port;
            // Update config mock with real port
            const config = require('../../src/config');
            config.targetUrl = `http://localhost:${port}/login`;
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully login, navigate, and send a snapshot', async () => {
        // Run the bot
        await runBot();

        // Assertions
        expect(notificationService.sendSnapshot).toHaveBeenCalledTimes(1);

        // Check arguments passed to sendSnapshot
        const [buffer, filename, message] = notificationService.sendSnapshot.mock.calls[0];

        expect(Buffer.isBuffer(buffer)).toBe(true);
        expect(filename).toMatch(/login_success_.*\.png/);
        expect(message).toContain('Login successful');
    });

    test('should catch login errors (e.g. selector missing) and send alert', async () => {
        const config = require('../../src/config');
        const originalSelector = config.selectors.username;
        // Set a short timeout for this test to speed up failure
        // Note: We can't easily change Puppeteer timeout dynamically without re-launching browser,
        // but the default timeout is usually 30s. We'll rely on the global timeout we set.
        config.selectors.username = '#non-existent-element';

        await runBot();

        config.selectors.username = originalSelector;

        expect(notificationService.sendSnapshot).toHaveBeenCalledTimes(1);
        const [buffer, filename, message, priority] = notificationService.sendSnapshot.mock.calls[0];

        expect(message).toContain('Bot FAILED');
        expect(priority).toBe('5'); // Assert High Priority
    }, 40000);

    test('should catch navigation errors (e.g. target link missing) and send alert', async () => {
        const config = require('../../src/config');
        const originalSelector = config.selectors.postLoginLink;

        // Login will succeed, but finding the link will fail
        config.selectors.postLoginLink = '#non-existent-link';

        await runBot();

        config.selectors.postLoginLink = originalSelector;

        expect(notificationService.sendSnapshot).toHaveBeenCalledTimes(1);
        const [buffer, filename, message, priority] = notificationService.sendSnapshot.mock.calls[0];

        // Verify the error message specifically mentions the failure
        // Depending on implementation, it might be "Node is either not visible or not an HTMLElement" or Timeout
        expect(message).toContain('Bot FAILED');
        expect(priority).toBe('5');
    }, 40000);
});
