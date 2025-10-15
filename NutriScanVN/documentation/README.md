# NutriScanVN

A full-stack nutrition tracking app with AI-powered food scanning, Vietnamese food database, onboarding, tracking, and progress dashboards.

## Structure

- `mobile/`: Expo React Native app
- `backend/`: Express API with PostgreSQL
- `devops/`: Docker and CI config
- `documentation/`: Docs

## Quick start (backend)

1. Create `.env` from `backend/.env.example`
2. Ensure PostgreSQL is running and env points to it
3. Install deps and run migrations

```bash
npm install --prefix backend
node backend/src/scripts/migrate.js
npm start --prefix backend
```

Health check: `GET http://localhost:4000/health`

## Quick start (mobile)

Set `EXPO_PUBLIC_API_URL` to your backend API base.

```bash
cd mobile
npm install
npm run start
```

Open in Expo Go / emulator.
