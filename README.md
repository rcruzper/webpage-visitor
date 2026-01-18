# Webpage Visitor Bot

A robust, stealthy Node.js automation bot designed to visit websites, authenticate using credentials, and perform specific navigation tasks. It mimics human behavior to avoid detection and can be scheduled via CRON.

Built with **Puppeteer**, **Node.js**, and **Docker**.

## 🚀 Features

- **Stealth Navigation**: Uses `puppeteer-extra-plugin-stealth` to evade standard bot detection.
- **Human-like Interaction**: Implements random typing delays and mouse movements.
- **Automated Login**: Handles username/password entry and form submission.
- **Task Execution**: Clicks specific links or elements after logging in.
- **Data Extraction**: Can extract specific text data from the page after navigation.
- **Notifications**: Sends execution reports (success/failure) with screenshots via **Ntfy**.
- **Scheduling**: Built-in CRON scheduler with randomized execution delay.
- **Dockerized**: optimized Alpine-based image with Chromium pre-installed.

## 🛠 Configuration

Configuration is managed via environment variables (in `.env` file or `docker-compose.yml`).

### Essential Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TARGET_URL` | The login page URL. | `https://example.com/login` |
| `USER_LOGIN` | Username/Email for the site. | `myuser` |
| `USER_PASSWORD` | Password for the site. | `mypassword123` |
| `CRON_SCHEDULE` | CRON expression for scheduling. Leave empty to run once. | `0 8 * * *` (Daily at 8am) |

### Notification (Ntfy)

| Variable | Description | Example |
|----------|-------------|---------|
| `NTFY_SERVER` | URL of your Ntfy server. | `https://ntfy.sh` |
| `NTFY_TOPIC` | Topic name to publish notifications to. | `my-secret-topic` |
| `NTFY_USER` | (Optional) Username for Ntfy Basic Auth. | `admin` |
| `NTFY_PASSWORD` | (Optional) Password for Ntfy Basic Auth. | `secret` |

### CSS Selectors (Site Specific)

You must identify the CSS selectors for the target website elements:

| Variable | Description |
|----------|-------------|
| `USERNAME_SELECTOR` | CSS selector for the username input field. |
| `PASSWORD_SELECTOR` | CSS selector for the password input field. |
| `LOGIN_BUTTON_SELECTOR` | CSS selector for the login submit button. |
| `POST_LOGIN_LINK_SELECTOR` | (Optional) Selector for the element to click after login. |

### Data Extraction (Optional)

You can define selectors to extract text from the page and include it in the notification. Use the format `KEY=SELECTOR`.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATA_SELECTORS` | JSON string or comma-separated list of key-selector pairs. | `{"Balance": "#balance-div", "Status": ".status-badge"}` |

### System Options

| Variable | Description | Default |
|----------|-------------|---------|
| `HEADLESS` | Run browser without UI (`true`/`false`). | `true` |
| `TZ` | Timezone for the CRON scheduler. | `GMT` |

---

## 🐳 Usage with Docker (Recommended)

This project is optimized to run as a container.

1. **Configure `docker-compose.yml`**:
   Open `docker-compose.yml` and fill in the environment variables under `environment`.

2. **Run the container**:
   ```bash
   docker-compose up -d --build
   ```

3. **Check Logs**:
   ```bash
   docker logs -f webpage_visitor
   ```

4. **Notifications**:
   You will receive notifications on your configured Ntfy topic with a screenshot and status report.

---

## 💻 Local Development

To run the bot directly on your machine (requires Node.js v18+).

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run**:
   ```bash
   # Run once or schedule based on config
   npm start
   ```

## 📂 Project Structure

```
├── src/
│   ├── BrowserService.ts      # Puppeteer setup & stealth config
│   ├── LoginService.ts        # Auth logic with human typing simulation
│   ├── NavigationService.ts   # Post-login actions & data extraction
│   ├── NotificationService.ts # Ntfy integration
│   └── config.ts              # Env var loading
├── tests/                     # Unit and E2E tests
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage Docker build
└── index.ts                   # Entry point
```

## ⚠️ Disclaimer

This tool is for educational purposes only. Ensure you have permission to automate interactions with the target website. The authors are not responsible for any misuse or bans resulting from the use of this tool.
