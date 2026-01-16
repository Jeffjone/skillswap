# SkillSwap - Student Talent Exchange Platform

A web application for students to exchange skills and knowledge through scheduled sessions.

## Project Structure

- `Combined/client/` - React + Vite frontend application
- `Combined/server/` - Firebase Cloud Functions backend

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

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
