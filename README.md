# 💗 My Health — Feel good, your way

A colorful, responsive, bilingual **English / فارسی** personal lifestyle and wellness app. Independent, **Apple Health-inspired** design; not affiliated with Apple.

## Features

- 🌸 Mood check-ins, optional notes, check-in history and a 7-day graph
- 🎮 Favorites library for games, animation, movies, music, books, travel, hobbies, pets and anything you love
- ✨ Personalized **on-device** day planner using your mood, favorites, available time and energy
- 💡 Idea notebook for creative projects, life notes and everyday reflections
- 📸 Travel and life memories, plus local compressed photo storage
- 💧 Manual logs for water, movement, sleep and mindful breaks
- 🌐 English and Persian with full RTL layout; light/dark themes
- 📱 Responsive, installable PWA with offline shell
- 🔒 Browser-only storage, import/export JSON backups and a wipe-all option

## Live website

**https://saaeiddev.github.io/My-Health-App-/**

The repository has a GitHub Actions workflow (`.github/workflows/deploy.yml`). If the website is not yet available, open **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the Source, and run the workflow from **Actions**. Every new push to `main` also triggers a deployment.

## Data and privacy

The app saves entries in browser `localStorage`, not on GitHub. Data is **not encrypted** and is **not synced** across devices. Others with access to the same browser profile may be able to read it. Clearing browser/site data can erase entries: export a backup before switching devices or clearing site data. Large collections of photos may fill browser storage; images are resized and compressed on upload.

The current frontend loads Google Fonts (a font request to Google may occur), but journal entries, notes and photos are never sent to the font provider. Self-reported habits are not medical measurements; this app does not diagnose, treat or replace healthcare or emergency services.

## Smart planner and optional generative AI

The offline smart planner works on **GitHub Pages without any server**. It is a personalized, rule-based activity recommender — not a generative AI model.

For optional generative AI, this repo also includes **`api/plan.js`**, a Vercel-compatible serverless backend. Since GitHub Pages is static, deploy this backend separately:

1. Import this repository into your Vercel account and deploy it.
2. Configure the backend environment variable `OPENAI_API_KEY` in Vercel, **not in source code or the browser**. Optionally set `OPENAI_MODEL`. Set `FRONTEND_ORIGIN=https://saaeiddev.github.io`.
3. In your My Health website, open **Settings → Optional AI connection**, paste `https://YOUR-BACKEND.vercel.app/api/plan`, and explicitly opt in.
4. When you press **Create my plan**, only your last mood label, chosen energy, available minutes and up to 12 favorite titles/categories are sent to your chosen backend. Journals, photos, memories and wellness numbers are not transmitted. If the remote AI is unavailable, the local planner still works.

For public production use, protect the backend with authentication, rate limits, usage quotas and abuse monitoring. Browser CORS alone is not server-side security.

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. No npm installation is required for the static frontend.

## Project files

- `index.html`, `styles.css`, `app.js` — interactive responsive app
- `icon.svg`, `manifest.webmanifest`, `sw.js` — installable PWA
- `api/plan.js` — opt-in serverless AI backend
- `.github/workflows/deploy.yml` — GitHub Pages deployment

Created for Amir Saeid Dehghan · 2026.
