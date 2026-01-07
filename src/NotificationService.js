const fs = require('fs');
const path = require('path');
const config = require('./config');

class NotificationService {
    constructor() {
        this.serverUrl = config.ntfy.server;
        this.topic = config.ntfy.topic;
        this.user = config.ntfy.user;
        this.password = config.ntfy.password;
    }

    async sendSnapshot(imageBuffer, filename, message = 'Bot finished successfully', priority = '3') {
        if (!this.serverUrl || !this.topic) {
            console.log('Ntfy is not configured. Skipping notification.');
            return;
        }

        const fullUrl = `${this.serverUrl}/${this.topic}`;
        console.log(`Sending notification to ${fullUrl}...`);

        try {
            const headers = {
                'Title': 'Webpage Visitor Report',
                'Priority': priority,
                'Tags': 'robot,camera',
                'Filename': filename,
                'Message': message
            };

            // Add Basic Auth header if credentials exist
            if (this.user && this.password) {
                const auth = Buffer.from(`${this.user}:${this.password}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }

            // Send buffer directly
            const response = await fetch(fullUrl, {
                method: 'PUT',
                body: imageBuffer,
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

module.exports = new NotificationService();
