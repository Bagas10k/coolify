# Coolify Dashboard

A self-hosted web project dashboard — upload and manage your static and PHP web projects directly from a clean UI, no terminal needed.

![Dashboard Preview](public/mascot.png)

## Features

- **Upload projects** via drag & drop (`.zip` files)
- **Auto-detect** project type — Static HTML or PHP
- **Serve projects** at `/p/your-project-name`
- **PHP support** — spawns `php -S` automatically per project
- **Login protection** — username & password via session
- **Search & filter** projects by type
- **Delete & restart** PHP projects from the dashboard
- **Beautiful UI** — glassmorphism, particle animation, glow effects

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + Express |
| Upload | Multer + AdmZip |
| Auth | express-session |
| PHP | php-cli (built-in server) |
| Frontend | Vanilla HTML + CSS + JS |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/coolify-dashboard.git
cd coolify-dashboard
npm install
```

### 2. Configure

Copy `.env.example` to `.env` and edit:

```bash
cp .env.example .env
nano .env
```

```env
PORT=3000
DASHBOARD_USER=admin
DASHBOARD_PASS=your-secure-password
SESSION_SECRET=a-random-secret-string
PHP_PORT_START=4000
```

### 3. Install PHP (for PHP project support)

```bash
# Ubuntu / Debian
sudo apt install php php-cli

# CentOS / RHEL
sudo yum install php php-cli
```

### 4. Run

```bash
# Development
node server.js

# Production (using PM2)
npm install -g pm2
pm2 start server.js --name coolify
pm2 save
pm2 startup
```

Open `http://localhost:3000` in your browser.

## Uploading Projects

### Static Site (HTML/CSS/JS)

```
my-site/
├── index.html
├── style.css
└── script.js
```

Zip the **contents** (not the folder itself), then upload.

### PHP Site

```
my-php-site/
├── index.php
└── ...
```

Same — zip the contents and upload. The dashboard will auto-detect `.php` files and start a PHP server.

## Project Access

After upload, your project is accessible at:

```
http://your-server:3000/p/project-name
```

## Nginx Reverse Proxy (Recommended for Production)

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 500M;
    }
}
```

## Security Notes

- Change `DASHBOARD_PASS` to a strong password before deploying
- Use Nginx + HTTPS (Let's Encrypt) if exposed to the internet
- `.env` is listed in `.gitignore` — never commit it

## License

MIT
