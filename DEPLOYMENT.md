# CivicPulse FREE Deployment Guide (No Credit Card)

If Render asks for a credit card, you can use these **100% FREE alternatives that don't require one.** They are extremely popular for Hackathon projects.

## 🚀 Recommended Architecture
- **Frontend (Next.js):** [Vercel](https://vercel.com) (Standard, 100% Free, NO Credit Card required)
- **Backend (FastAPI):** [Koyeb](https://www.koyeb.com/) OR [Hugging Face Spaces](https://huggingface.co/spaces) (Both 100% Free, NO Credit Card required)
- **Database:** MongoDB Atlas (Already configured)

---

## 1. Deploy the Backend (FastAPI Python)
Choose **ONE** of the following options. Both are extremely easy.

### Option A: Deploy on Koyeb (Fastest & Easiest)
Koyeb provides a free tier ("Eco") that is perfect for Python APIs.
1. Run `git add .`, `git commit -m "added Dockerfile"`, and `git push origin master` to sync your code to GitHub.
2. Sign up at [Koyeb.com](https://app.koyeb.com/) using your GitHub account.
3. Click **Create App** > Select **GitHub**.
4. Choose the `World-Wide-Vibes-Hackathon` repository.
5. In the Build settings, check the **Builder** section. Koyeb should automatically detect your `backend/Dockerfile`. If not, specify `backend` as the **Work directory/Builder context**.
6. Open **Environment Variables** and add:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
7. Click **Deploy**.
8. **Copy the Public URL** (e.g., `https://my-app.koyeb.app`). You will need this for the frontend!

### Option B: Deploy on Hugging Face Spaces (Perfect for AI Hackathons)
Hugging Face Spaces offers a truly generous free tier for running Docker containers forever.
1. Create a free account at [Hugging Face](https://huggingface.co/).
2. Go to **Spaces** and click **Create new Space**.
3. Name your space (e.g. `civicpulse-api`).
4. **Choose Space Hardware:** `Blank` (The free CPU tier).
5. **Space SDK:** Choose **Docker**. Space hardware will be public.
6. Once created, go to the Space settings. Look for **Variables and secrets**.
   - Add new secrets: `MONGODB_URI` and `GEMINI_API_KEY`.
7. **Syncing your code:** Open the Space's `Files` tab > Click "Clone repository". You need to push the contents of the `backend/` directory directly into the HF Space using standard Git commands.
8. Once pushed, Hugging face will build the Docker container and give you a public URL.

---

## 2. Deploy the Frontend (Vercel)

Vercel is the creator of Next.js and provides zero-config deployments. 100% Free, NO credit card required.

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub repository and select the **CivicPulse** project.
3. In the **Framework Preset**, ensure **Next.js** is selected.
4. **Important configuration:**
   - Set the **Root Directory** to `hackethon_frontend` (Click Edit right next to Root Directory).
5. Open the **Environment Variables** section and add:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `[Paste the Backend URL from Option A or B]` (Make sure there is no trailing slash)
6. Click **Deploy**.

---

### 🎉 Done!
Your application is now live. Ensure NO backend URL has a trailing slash in Vercel.
