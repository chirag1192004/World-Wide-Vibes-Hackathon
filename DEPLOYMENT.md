# CivicPulse Deployment Guide

This guide provides step-by-step instructions for deploying the **CivicPulse** application to production for free.

## 🚀 Recommended Architecture
- **Frontend (Next.js):** [Vercel](https://vercel.com)
- **Backend (FastAPI):** [Render.com](https://render.com)
- **Database:** MongoDB Atlas (Already configured via URI)

---

## 1. Deploy the Backend (Render)

Render makes deploying the Python backend incredibly easy via the `render.yaml` blueprint included in this repository.

1. **Push your code to GitHub.**
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file.
6. Click **Apply**.
7. Go to your newly created Web Service (`civicpulse-backend`) > **Environment**. Add your secret API Keys:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
8. **Copy the Public URL** (e.g., `https://civicpulse-backend.onrender.com`). You will need this for the frontend!

---

## 2. Deploy the Frontend (Vercel)

Vercel is the creator of Next.js and provides zero-config deployments.

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub repository and select the **CivicPulse** project.
3. In the **Framework Preset**, ensure **Next.js** is selected.
4. **Important configuration:**
   - Set the **Root Directory** to `hackethon_frontend` (Click Edit right next to Root Directory).
5. Open the **Environment Variables** section and add:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `[Paste the Render Backend URL from Step 1]` (Make sure there is no trailing slash, e.g. `https://civicpulse-backend.onrender.com`)
6. Click **Deploy**.

---

## 🎉 Done!
Your application is now live.

### Troubleshooting
- **API Requests failing?** Ensure your `NEXT_PUBLIC_API_BASE_URL` in Vercel exactly matches your Render URL, without a trailing slash (e.g. `https://my-backend.onrender.com`).
- **Data not showing?** Ensure the `MONGODB_URI` is correctly added into the Render Environment variables.
- **AI not responding?** Ensure your `GEMINI_API_KEY` is added to the Render Environment variables.
