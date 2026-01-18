import notificationService from '../../src/NotificationService';

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
        (global.fetch as jest.Mock).mockClear();
    });

    test('should send snapshot with correct headers and basic auth', async () => {
        const dummyBuffer = Buffer.from('fake-image');
        const filename = 'test.png';
        const title = 'Test message';

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve('ok')
        });

        await notificationService.sendNotification(dummyBuffer, filename, title, '3');

        expect(global.fetch).toHaveBeenCalledTimes(1);
        
        const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
        
        expect(url).toBe('https://test.ntfy.sh/test-topic');
        expect(options.method).toBe('PUT');
        expect(options.headers['Priority']).toBe('3');
        expect(options.headers['Filename']).toBe(filename);
        expect(options.headers['Title']).toBe(title);
        
        // Verify Basic Auth (base64 of test-user:test-password)
        const expectedAuth = 'Basic ' + Buffer.from('test-user:test-password').toString('base64');
        expect(options.headers['Authorization']).toBe(expectedAuth);
    });

    test('should include extra data in message body', async () => {
        const dummyBuffer = Buffer.from('fake-image');
        const message = 'Balance: 100.00';
        
        (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

        await notificationService.sendNotification(dummyBuffer, 'test.png', 'Base Title', '3', message);

        const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
        const messageHeader = options.headers['Message'];
        
        // In the new implementation, message goes into the Message header
        expect(messageHeader).toContain('Balance: 100.00');
    });

    test('should handle fetch errors gracefully', async () => {
        const dummyBuffer = Buffer.from('fake-image');
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await notificationService.sendNotification(dummyBuffer, 'fail.png');

        expect(consoleSpy).toHaveBeenCalledWith('Error sending notification:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    test('should sanitize message headers removing newlines and non-ASCII characters to avoid fetch errors', async () => {
        const dummyBuffer = Buffer.from('fake-image');
        const message = 'Line1: Value1\nLine2: Value2';
        
        (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

        await notificationService.sendNotification(dummyBuffer, 'test.png', 'Title', '3', message);

        const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
        
        // The message in the header should contain literal \n instead of actual newline
        expect(options.headers['Message']).toContain('\\n');
        expect(options.headers['Message']).not.toContain('\n');
    });
});
