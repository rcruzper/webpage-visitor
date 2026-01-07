const notificationService = require('../../src/NotificationService');
const config = require('../../src/config');
const fs = require('fs');

// Mock dependencies
jest.mock('../../src/config', () => ({
    ntfy: {
        server: 'https://test.ntfy.sh',
        topic: 'test-topic',
        user: 'test-user',
        password: 'test-password'
    }
}));

// Mock global fetch
global.fetch = jest.fn();

describe('NotificationService', () => {
    beforeEach(() => {
        global.fetch.mockClear();
    });

    test('should send snapshot with correct headers and basic auth', async () => {
        const dummyBuffer = Buffer.from('fake-image');
        const filename = 'test.png';
        const message = 'Test message';

        global.fetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve('ok')
        });

        await notificationService.sendSnapshot(dummyBuffer, filename, message, '3');

        expect(global.fetch).toHaveBeenCalledTimes(1);
        
        const [url, options] = global.fetch.mock.calls[0];
        
        expect(url).toBe('https://test.ntfy.sh/test-topic');
        expect(options.method).toBe('PUT');
        expect(options.headers['Priority']).toBe('3');
        expect(options.headers['Filename']).toBe(filename);
        expect(options.headers['Message']).toBe(message);
        
        // Verify Basic Auth (base64 of test-user:test-password)
        const expectedAuth = 'Basic ' + Buffer.from('test-user:test-password').toString('base64');
        expect(options.headers['Authorization']).toBe(expectedAuth);
    });

    test('should handle fetch errors gracefully', async () => {
        const dummyBuffer = Buffer.from('fake-image');
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await notificationService.sendSnapshot(dummyBuffer, 'fail.png');

        expect(consoleSpy).toHaveBeenCalledWith('Error sending notification:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});
