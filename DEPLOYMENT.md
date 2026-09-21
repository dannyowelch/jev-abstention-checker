# Deployment Guide

## Deploy to Vercel (Recommended)

This app is ready for one-click deployment to Vercel:

### Option 1: Deploy from GitHub (Easiest)

1. Push this repo to GitHub (already done: `https://github.com/dannyowelch/jev-abstention-checker`)
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repository
4. Click "Deploy" (no configuration needed)
5. Optional: Add `TYPESAFE_API_KEY` environment variable in Vercel dashboard if you want a server-side fallback

### Option 2: Deploy with Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. Your app will be live at a `.vercel.app` URL.

### Option 3: Deploy Button

If this repo is public, use this deploy button in the README:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dannyowelch/jev-abstention-checker)

## Environment Variables (Optional)

For a server-side API key fallback (user-provided keys in the UI always override):

- `TYPESAFE_API_KEY`: Your TypeSafe API key

Set this in:
- Vercel: Project Settings → Environment Variables
- Local: Create `.env.local` with `TYPESAFE_API_KEY=ts_your_key_here`

## Verify Local Build

Before deploying:

```bash
npm run build
npm start
```

Visit http://localhost:3000 to test the production build.
