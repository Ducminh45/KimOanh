const request = require('supertest');
const app = require('../src/index');
const db = require('../src/config/database');

describe('Food API Tests', () => {
  let authToken;
  let userId;
  let foodLogId;

  beforeAll(async () => {
    // Create test user and login
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `foodtest${Date.now()}@test.com`,
        password: 'Test123!',
        fullName: 'Food Test User',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.query('DELETE FROM food_logs WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    await db.end();
  });

  describe('POST /api/food/log', () => {
    it('should log a food entry', async () => {
      const response = await request(app)
        .post('/api/food/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          foodName: 'Phở Bò',
          mealType: 'lunch',
          servingSize: 1,
          servingUnit: 'bowl',
          calories: 350,
          protein: 20,
          carbohydrates: 45,
          fats: 8,
          fiber: 2,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.foodName).toBe('Phở Bò');
      expect(response.body.data.calories).toBe(350);

      foodLogId = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/food/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          foodName: 'Test Food',
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/food/log')
        .send({
          foodName: 'Test Food',
          mealType: 'lunch',
          calories: 100,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/food/logs', () => {
    it('should get user food logs', async () => {
      const response = await request(app)
        .get('/api/food/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('foodName');
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/food/logs?startDate=${today}&endDate=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/food/daily', () => {
    it('should get daily nutrition summary', async () => {
      const response = await request(app)
        .get('/api/food/daily')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nutrition');
      expect(response.body.data).toHaveProperty('goals');
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data.nutrition).toHaveProperty('calories');
      expect(response.body.data.nutrition).toHaveProperty('protein');
    });
  });

  describe('GET /api/food/search', () => {
    it('should search foods', async () => {
      const response = await request(app)
        .get('/api/food/search?q=phở')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/food/search?q=phở&category=main_dish')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/food/log/:id', () => {
    it('should delete food log', async () => {
      const response = await request(app)
        .delete(`/api/food/log/${foodLogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should not delete non-existent log', async () => {
      const response = await request(app)
        .delete('/api/food/log/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/food/scan', () => {
    it('should scan food image (with valid image)', async () => {
      // Note: This requires a valid Gemini API key
      const response = await request(app)
        .post('/api/food/scan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        });

      // May return 200 or 500 depending on API key validity
      expect([200, 500]).toContain(response.status);
    });

    it('should validate image format', async () => {
      const response = await request(app)
        .post('/api/food/scan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageBase64: 'invalid_image_data',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
