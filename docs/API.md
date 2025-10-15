# NutriScanVN API Documentation

## Base URL
```
Production: https://api.nutriscanvn.com/api
Development: http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## 👤 User Endpoints

### Complete Onboarding
```http
POST /user/onboarding
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "dateOfBirth": "1995-01-01",
  "gender": "male",
  "height": 175,
  "weight": 70,
  "goal": "lose_weight",
  "activityLevel": "moderately_active",
  "dietaryPreferences": ["vegetarian"],
  "allergies": [{"name": "peanuts", "severity": "moderate"}]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bmi": 22.9,
    "bmr": 1650,
    "tdee": 2550,
    "dailyCalorieGoal": 2050,
    "macros": {
      "protein": 205,
      "carbs": 154,
      "fats": 68
    }
  }
}
```

### Update Profile
```http
PUT /user/profile
Authorization: Bearer <token>
```

### Get User Stats
```http
GET /user/stats
Authorization: Bearer <token>
```

---

## 🍽️ Food Endpoints

### Scan Food (AI)
```http
POST /food/scan
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isFood": true,
    "foods": [
      {
        "name": "Phở Bò",
        "nameVi": "Phở Bò",
        "confidence": 0.95,
        "calories": 350,
        "protein": 20,
        "carbohydrates": 45,
        "fats": 8,
        "fiber": 2,
        "servingSize": "1 bowl",
        "category": "main_dish",
        "cuisine": "vietnamese"
      }
    ],
    "description": "Vietnamese beef noodle soup"
  }
}
```

### Log Food
```http
POST /food/log
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "foodName": "Phở Bò",
  "mealType": "lunch",
  "servingSize": 1,
  "servingUnit": "bowl",
  "calories": 350,
  "protein": 20,
  "carbohydrates": 45,
  "fats": 8,
  "fiber": 2,
  "scanned": true,
  "confidenceScore": 0.95,
  "imageUrl": "https://...",
  "notes": "Delicious!"
}
```

### Get Food Logs
```http
GET /food/logs?startDate=2025-10-01&endDate=2025-10-14
Authorization: Bearer <token>
```

### Get Daily Nutrition
```http
GET /food/daily?date=2025-10-14
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-10-14",
    "nutrition": {
      "calories": 1850,
      "protein": 95,
      "carbs": 220,
      "fats": 62,
      "fiber": 28
    },
    "goals": {
      "calories": 2050,
      "protein": 154,
      "carbs": 205,
      "fats": 68,
      "fiber": 25
    },
    "progress": {
      "calories": 90.2,
      "protein": 61.7,
      "carbs": 107.3,
      "fats": 91.2
    },
    "mealCount": 4
  }
}
```

### Search Foods
```http
GET /food/search?q=pho&category=main_dish&limit=20
Authorization: Bearer <token>
```

### Delete Food Log
```http
DELETE /food/log/:id
Authorization: Bearer <token>
```

---

## 📊 Progress Endpoints

### Log Water
```http
POST /progress/water
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amountMl": 250
}
```

### Get Water Logs
```http
GET /progress/water?date=2025-10-14
Authorization: Bearer <token>
```

### Log Exercise
```http
POST /progress/exercise
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "exerciseType": "running",
  "durationMinutes": 30,
  "intensity": "high",
  "notes": "Morning run"
}
```

### Get Exercise Logs
```http
GET /progress/exercise?startDate=2025-10-01
Authorization: Bearer <token>
```

### Log Weight
```http
POST /progress/weight
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "weight": 68.5,
  "notes": "Morning weight"
}
```

### Get Progress Summary
```http
GET /progress/summary?period=weekly
Authorization: Bearer <token>
```

---

## 💬 Chat Endpoints

### Send Message to AI
```http
POST /chat/message
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Gợi ý bữa sáng healthy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {...},
    "response": "Gợi ý bữa sáng...",
    "suggestions": ["Cảm ơn", "Cho tôi biết thêm", "Được rồi"]
  }
}
```

### Get Chat History
```http
GET /chat/history?limit=50
Authorization: Bearer <token>
```

---

## 👥 Community Endpoints

### Get Feed
```http
GET /community/feed?limit=20&offset=0
Authorization: Bearer <token>
```

### Create Post
```http
POST /community/post
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Đã giảm được 5kg!",
  "imageUrl": "https://...",
  "postType": "progress"
}
```

### Like Post
```http
POST /community/post/:id/like
Authorization: Bearer <token>
```

### Add Comment
```http
POST /community/post/:id/comment
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Chúc mừng bạn!"
}
```

### Get Leaderboard
```http
GET /community/leaderboard?period=weekly
Authorization: Bearer <token>
```

---

## 🍱 Meal Plan Endpoints

### Generate AI Meal Plan
```http
POST /meal-plan/generate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mealPlanId": "uuid",
    "weekPlan": [...],
    "tips": ["Tip 1", "Tip 2"]
  }
}
```

### Get Recipes
```http
GET /meal-plan/recipes?cuisine=vietnamese&difficulty=easy
Authorization: Bearer <token>
```

### Get Recipe Detail
```http
GET /meal-plan/recipe/:id
Authorization: Bearer <token>
```

### Get Shopping List
```http
GET /meal-plan/shopping-list
Authorization: Bearer <token>
```

### Add Shopping List Item
```http
POST /meal-plan/shopping-list/item
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "itemName": "Cà chua",
  "category": "vegetables",
  "quantity": 500,
  "unit": "grams"
}
```

---

## 🔒 Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| General API | 100 requests / 15 min |
| Auth Endpoints | 5 requests / 15 min |
| AI Features | 10 requests / 1 min |

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Premium subscription required",
  "premiumRequired": true
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Daily scan limit reached",
  "scanLimitReached": true,
  "scansRemaining": 0,
  "limit": 3
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🚀 Pagination

For endpoints that support pagination:

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## 📅 Date Formats

All dates use ISO 8601 format:
- Dates: `YYYY-MM-DD` (e.g., "2025-10-14")
- DateTime: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., "2025-10-14T08:30:00.000Z")

---

## 🔑 Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
DB_HOST=localhost
DB_NAME=nutriscanvn
DB_USER=postgres
DB_PASSWORD=your_password
```

---

For more details, see the [Architecture Documentation](./ARCHITECTURE.md)
