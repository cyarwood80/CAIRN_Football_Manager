# 🚀 Hosting Guide: Agentic Football Cup

This project is built so you and your friends can play across different machines, whether in the same room or across the world.

---

## Method 1: Instant Tunnel (Zero Setup, 100% Free)
*Best for: Testing right now with a friend without creating any cloud accounts.*

1. Start your local server:
   ```bash
   npm run dev
   ```
2. In a second terminal, run the sharing command:
   ```bash
   npm run share
   ```
3. A public HTTPS link (like `https://agentic-cup-xyz.trycloudflare.com`) will be generated.
4. Send that link to your friend! They can open it on their browser or phone, create their team, and enter your match room code.

---

## Method 2: Permanent 24/7 Cloud Hosting (Railway.app — Recommended)
*Best for: A permanent URL that stays online 24/7 with zero maintenance.*

1. Push this project folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Agentic Football Cup"
   git remote add origin https://github.com/your-username/agentic-football-cup.git
   git push -u origin main
   ```
2. Go to [railway.app](https://railway.app) and click **"New Project"** $\rightarrow$ **"Deploy from GitHub repo"**.
3. Select your repository. Railway will automatically detect the `Dockerfile` and build it.
4. In Railway Settings, click **"Generate Domain"** to get your public URL (e.g. `https://agentic-football-cup.up.railway.app`).
5. Share the domain with anyone!

---

## Method 3: Render.com (Alternative Free Tier)
1. Push code to GitHub.
2. Go to [render.com](https://render.com) and click **"New Web Service"**.
3. Connect your repository and choose **Docker** runtime.
4. Set Port to `3001` (or leave default).
5. Click **Deploy**. Render gives you a free `.onrender.com` HTTPS URL with WebSocket support.

---

## Method 4: Self-Hosted Docker VPS
Run with Docker anywhere:
```bash
docker compose up -d --build
```
Your app will run on port `3001`!
