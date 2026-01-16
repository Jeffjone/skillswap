# SkillSwap - Student Talent Exchange Platform

A web application for students to exchange skills and knowledge through scheduled sessions.

## Project Structure

- `Combined/client/` - React + Vite frontend application
- `Combined/server/` - Firebase Cloud Functions backend

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Configure the base path (if needed):**
   - If your repository is named `username.github.io`, the site will be at `https://username.github.io/` - no changes needed
   - If your repository has a different name (e.g., `25-virtualWebApp`), the site will be at `https://username.github.io/25-virtualWebApp/`
   - In this case, update `Combined/client/vite.config.ts` and change `base: '/'` to `base: '/25-virtualWebApp/'` (replace with your actual repo name)

3. **Push to trigger deployment:**
   - The workflow will automatically build and deploy when you push to the `main` or `master` branch
   - You can also manually trigger it from the Actions tab

### Manual Build (for testing)

```bash
cd Combined/client
npm install
npm run build
```

The built files will be in `Combined/client/dist/`

## Local Development

```bash
cd Combined/client
npm install
npm run dev
```

## Firebase Backend

The backend uses Firebase Cloud Functions. See `Combined/server/` for backend code.

To deploy Firebase functions:
```bash
cd Combined/server
firebase deploy --only functions
```
