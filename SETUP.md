# sticky — setup guide

## 1. Google OAuth credentials

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Authorized JavaScript origins: `http://localhost:5173`, your Vercel URL
4. Authorized redirect URIs: not needed (we use the Google Identity JS SDK, no server-side redirect)
5. Copy the Client ID

## 2. API setup

```bash
cd api
cp .env.example .env
# fill in DATABASE_URL, GOOGLE_CLIENT_ID, JWT_SECRET, FRONTEND_URL
npm install
npm run db:migrate
npm run dev
```

## 3. Web app setup

```bash
cd app
cp .env.example .env
# fill in VITE_API_URL, VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```

Visit http://localhost:5173 — sign in with Google, start noting.

## 4. Electron (desktop overlay)

```bash
cd electron
npm install
NODE_ENV=development npm run dev
```

The Electron window covers your full screen as a transparent overlay.
Notes with 📌 pinned will float above all other windows.

## 5. Deploy to Railway (API) + Vercel (web)

**API → Railway:**
- Push to GitHub, connect Railway, set env vars, deploy

**Web → Vercel:**
- Connect Vercel to GitHub, set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`, deploy
- Update `FRONTEND_URL` in Railway to your Vercel URL
- Update Google OAuth authorized origins with your Vercel URL
