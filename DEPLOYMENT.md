# STARVANTIS Deployment Guide

This guide walks you through deploying the **STARVANTIS** platform:
- **Backend (FastAPI + Live Telemetry WebSockets)**: Deployed on **Render** or **Railway**
- **Frontend (Next.js 15 App Router)**: Deployed on **Vercel** or **Netlify**

---

## 🚀 Option A: Deploy Backend (Render or Railway)

### 1. Deploy on Render (Recommended for Free Tier)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `Chakravarthy-09887/Starvantis`.
3. Configure the service settings:
   - **Name**: `starvantis-backend`
   - **Region**: Closest to your users (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `DATABASE_URL`: `sqlite:///./starvantis.db` (or attach a Render PostgreSQL database)
   - `NASA_API_KEY`: `wxu9OqadiasUMrH5fC2NaF33AsXfLiQ7FCRsN2yH`
   - `SECRET_KEY`: (Click *Generate* or enter any secure string)
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (`https://starvantis-1.onrender.com`).

---

### 2. Deploy on Railway
1. Go to [Railway Dashboard](https://railway.app/) and click **New Project** → **Deploy from GitHub repo**.
2. Select `Chakravarthy-09887/Starvantis`.
3. In the service settings, set **Root Directory** to `/backend`.
4. Railway will automatically detect `railway.json` / `Procfile` / `requirements.txt`.
5. Under **Variables**, add:
   - `DATABASE_URL`: `sqlite:///./starvantis.db` (or add a Railway PostgreSQL plugin)
   - `NASA_API_KEY`: `wxu9OqadiasUMrH5fC2NaF33AsXfLiQ7FCRsN2yH`
   - `SECRET_KEY`: Enter any random secret string
6. Under **Settings** → **Networking**, click **Generate Domain** to get your public URL (e.g. `https://starvantis-backend.up.railway.app`).

---

## ⚡ Option B: Deploy Frontend (Vercel or Netlify)

### 1. Deploy on Vercel (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository: `Chakravarthy-09887/Starvantis`.
3. Configure the Project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://starvantis-1.onrender.com`
   - `NEXT_PUBLIC_WS_URL`: `wss://starvantis-1.onrender.com/ws/mission`
5. Click **Deploy**.
6. Your site will be live instantly with a global CDN URL!

---

### 2. Deploy on Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** → **Import an existing project**.
2. Connect to GitHub and select `Chakravarthy-09887/Starvantis`.
3. Configure the Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/out`
4. Under **Environment variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://starvantis-1.onrender.com`
5. Click **Deploy Starvantis** (Live at `https://starvantisxintelligence.netlify.app/`).

---

## 🛠️ Verification Checklist
- [ ] Backend root responds with `{"platform": "STARVANTIS Aerospace Intelligence API", "status": "OPERATIONAL"}` at `/`
- [ ] Swagger Interactive API documentation loads at `/docs`
- [ ] WebSocket endpoint connected at `/ws/mission`
- [ ] Frontend loads with 3D Holographic digital twins, live telemetry feeds, and interactive radar
