import config from './config';

class NotificationService {
    private readonly serverUrl: string | undefined;
    private readonly topic: string | undefined;
    private readonly user: string | undefined;
    private readonly password: string | undefined;

    constructor() {
        this.serverUrl = config.ntfy.server;
        this.topic = config.ntfy.topic;
        this.user = config.ntfy.user;
        this.password = config.ntfy.password;
    }

    public async sendNotification(imageBuffer: Buffer, filename: string, title: string = 'Bot - Finished successfully', priority: string = '3', message: string = ''): Promise<void> {
        if (!this.serverUrl || !this.topic) {
            console.log('Ntfy is not configured. Skipping notification.');
            return;
        }

        const fullUrl = `${this.serverUrl}/${this.topic}`;
        console.log(`Sending notification to ${fullUrl}...`);

        try {
            // Sanitize message for HTTP headers:
            // Node.js fetch/http throws if headers contain actual newlines (0x0A or 0x0D).
            // We replace them with literal "\n" string which ntfy interprets as a newline.
            const safeMessage = message
                .replace(/\r?\n/g, '\\n') // Replace actual newlines with literal \n
                .replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII (emojis, etc.)

            const headers: Record<string, string> = {
                'Title': title,
                'Priority': priority,
                'Tags': 'robot',
                'Filename': filename,
                'Message': safeMessage
            };

            // Add Basic Auth header if credentials exist
            if (this.user && this.password) {
                const auth = Buffer.from(`${this.user}:${this.password}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }

            // Send buffer directly
            const response = await fetch(fullUrl, {
                method: 'PUT',
                body: imageBuffer as any,
                headers: headers
            });

            if (response.ok) {
                console.log('Notification sent successfully via Ntfy.');
            } else {
                console.error(`Failed to send notification. Status: ${response.status} - ${response.statusText}`);
                const text = await response.text();
                console.error('Response:', text);
            }

        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
}

export default new NotificationService();
