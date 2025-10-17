# API Reference (Draft)

Base URL: `http://localhost:4000/api`

## Auth

- POST `/auth/register` { email, password, fullName }
- POST `/auth/login` { email, password } -> { accessToken, refreshToken }
- POST `/auth/refresh` { refreshToken }
- POST `/auth/forgot-password` { email }
- POST `/auth/reset-password` { token, newPassword }
- GET `/auth/verify-email?token=...&email=...`

## User

- GET `/user/me` Bearer
- PUT `/user/me` { fullName } Bearer
- GET `/user/metrics` Bearer
- PUT `/user/metrics` { gender, birthDate, heightCm, weightKg, goal, activityLevel, dietaryPreferences[], allergies[] } Bearer

## Food

- GET `/food/search?q=&category=&page=1&pageSize=20` Bearer
- GET `/food/:id` Bearer
- GET `/food/me/favorites` Bearer
- POST `/food/me/favorites` { foodId } Bearer
- DELETE `/food/me/favorites/:foodId` Bearer

## Progress

- GET `/progress/water?date=YYYY-MM-DD` Bearer
- POST `/progress/water` { amountMl } Bearer
- DELETE `/progress/water/:id` Bearer
- GET `/progress/exercise?date=YYYY-MM-DD` Bearer
- POST `/progress/exercise` { type, durationMin, intensity } Bearer
- DELETE `/progress/exercise/:id` Bearer
- GET `/progress/summary?date=YYYY-MM-DD` Bearer

## Diary

- GET `/diary?date=YYYY-MM-DD` Bearer
- POST `/diary` { foodId, mealType, quantity, servingSizeG, imageUrl? } Bearer
- PUT `/diary/:id` { mealType?, quantity?, servingSizeG?, imageUrl? } Bearer
- DELETE `/diary/:id` Bearer

## AI

- POST `/ai/scan` Bearer
  - Body: { imageBase64?: string, imageUrl?: string, locale?: 'vi'|'en', mealType?: 'breakfast'|'lunch'|'dinner'|'snack', autoLog?: boolean }
  - Response: { items: [{ name, detectedServingGrams, confidence, match?, nutrition?, alternatives: [] }], loggedIds: [] }

- POST `/ai/chat` Bearer
  - Body: { messages: [{ role: 'user'|'assistant', content: string }], locale?: 'vi'|'en' }
  - Response: { reply: string }
