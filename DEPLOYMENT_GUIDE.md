# 🚀 StudySpirit — Production Deployment Guide

This guide walks you through deploying StudySpirit to **Vercel (Frontend)** and **Render/Railway (Backend)** as requested.

---

## 🏗️ 1. Backend Deployment (Render or Railway)

We recommend using **Render** or **Railway** because they support persistent servers (needed for Socket.io/WebSockets). Serverless functions (like Vercel API routes) **will not work** for real-time features like chat or live study rooms.

### Option A: Deploy on Render (Recommended)

1.  **Push Code to GitHub**: Ensure your latest code is pushed to your GitHub repository.
2.  **Sign Up for Render**: Go to [render.com](https://render.com) and sign up with GitHub.
3.  **Create New Web Service**:
    *   Click "New +" -> "Web Service".
    *   Connect your `StudySpirit` repository.
4.  **Configure Service**:
    *   **Name**: `studyspirit-api`
    *   **Region**: Singapore (or closest to your users).
    *   **Root Directory**: Leave blank or set to `backend` if prompted (Render auto-detects usually, but for monorepo structure without root package.json, be careful).
        *   *Better approach:* Since we have a `render.yaml` in the root, you can just click **"Blueprints"** -> **"New Blueprint Instance"** and select your repo. Render will auto-configure everything based on `render.yaml`.
    *   If configuring manually:
        *   **Build Command**: `cd backend && npm install`
        *   **Start Command**: `cd backend && npm start`
5.  **Environment Variables**:
    *   Go to the "Environment" tab and add the following keys from your local `.env`:
        *   `NODE_ENV`: `production`
        *   `MONGODB_URI`: (Your Atlas Connection String)
        *   `SESSION_SECRET`: (A long random string)
        *   `GOOGLE_CLIENT_ID`: (From Google Cloud Console)
        *   `GOOGLE_CLIENT_SECRET`: (From Google Cloud Console)
        *   `FRONTEND_URL`: `https://your-vercel-app-name.vercel.app` (You will get this after deploying frontend, for now put `*` or update later).
        *   `GEMINI_API_KEY`: (Your AI key)

6.  **Deploy**: Click "Create Web Service". Wait for the green "Live" status.
7.  **Copy Backend URL**: It will look like `https://studyspirit-api.onrender.com`.

### Option B: Deploy on Railway

1.  **Sign Up**: Go to [railway.app](https://railway.app) and login with GitHub.
2.  **New Project**: Click "New Project" -> "GitHub Repo" -> Select `StudySpirit`.
3.  **Configure**:
    *   Click on the repo card -> "Settings" -> "Root Directory" -> set to `/backend`.
    *   "Build Command": `npm install`
    *   "Start Command": `npm start`
4.  **Variables**: Add the same variables as above (`MONGODB_URI`, etc.).
5.  **Domain**: Go to "Settings" -> "Generate Domain". Copy this URL.

---

## 🎨 2. Frontend Deployment (Vercel)

1.  **Push Code**: Ensure `frontend/` folder is updated.
2.  **Sign Up for Vercel**: Go to [vercel.com](https://vercel.com) and login with GitHub.
3.  **Add New Project**:
    *   Click "Add New..." -> "Project".
    *   Import `StudySpirit` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   Expand "Environment Variables".
    *   Add `VITE_API_URL`: Paste your **Backend URL** from Step 1 (e.g., `https://studyspirit-api.onrender.com`).
        *   *Note: Do NOT add a trailing slash `/` at the end.*
6.  **Deploy**: Click "Deploy".
7.  **Copy Frontend URL**: Once done, you get a domain like `studyspirit.vercel.app`.

---

## 🔗 3. Final Wiring

1.  **Update Backend CORS**:
    *   Go back to your Backend Dashboard (Render/Railway).
    *   Update the `FRONTEND_URL` environment variable to match your new Vercel domain (e.g., `https://studyspirit.vercel.app`).
    *   This ensures only your app can talk to the backend.

2.  **Update Google OAuth RedirectURI**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Edit your OAuth Client ID.
    *   Add Authorized JavaScript Origin: `https://studyspirit.vercel.app`
    *   Add Authorized Redirect URI: `https://studyspirit-api.onrender.com/api/auth/google/callback`
        *   *Note: Redirect URI points to the BACKEND, not frontend.*

---

## 🚦 4. Verification

1.  Open your Vercel URL.
2.  Try to **Log In** (Google Auth should work if URIs are correct).
3.  Check **Real-time Chat** (Socket.io should connect to backend).
4.  Test **Admin Panel**.

**Troubleshooting:**
*   **CORS Error?** Check `FRONTEND_URL` on backend.
*   **Socket Error?** Ensure backend is running and `VITE_API_URL` is correct.
*   **White Screen on refresh?** Ensure `vercel.json` exists in `frontend/` (we added it).

---
