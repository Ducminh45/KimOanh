const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not set, AI features will be disabled');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Analyze food image and extract nutrition information
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<Object>} - Food recognition result
   */
  async analyzeFoodImage(imageBase64) {
    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not initialized');
      }

      const prompt = `Analyze this food image and provide detailed information. 
      You MUST respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no additional text):
      {
        "foods": [
          {
            "name": "Food name in English",
            "name_vi": "Tên món ăn bằng tiếng Việt",
            "confidence": 0.95,
            "calories": 350,
            "protein": 20,
            "carbohydrates": 45,
            "fats": 10,
            "fiber": 3,
            "serving_size": "1 bowl",
            "category": "main_dish/snack/beverage/dessert/etc",
            "cuisine": "vietnamese/international/etc"
          }
        ],
        "is_food": true,
        "description": "Brief description of the food"
      }
      
      Important:
      - If multiple foods are detected, list all of them in the foods array
      - Provide Vietnamese names for Vietnamese dishes
      - Be accurate with nutrition estimates
      - Set confidence score between 0 and 1
      - If not food, set is_food to false and provide empty foods array
      - Return ONLY the JSON object, no other text`;

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Gemini Vision API response received');

      // Clean up response and parse JSON
      let cleanText = text.trim();
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const foodData = JSON.parse(cleanText);
      
      return foodData;
    } catch (error) {
      logger.error('Error analyzing food image:', error);
      
      // Return a fallback response
      return {
        foods: [],
        is_food: false,
        description: 'Unable to analyze image',
        error: error.message,
      };
    }
  }

  /**
   * Generate AI chatbot response
   * @param {string} userMessage - User's message
   * @param {Object} userContext - User profile context
   * @returns {Promise<string>} - AI response
   */
  async generateChatResponse(userMessage, userContext = {}) {
    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not initialized');
      }

      const contextPrompt = `You are NutriBot, a friendly and knowledgeable Vietnamese nutrition assistant.
      
User Context:
- Name: ${userContext.fullName || 'User'}
- Goal: ${userContext.goal || 'Not set'}
- Daily Calorie Goal: ${userContext.dailyCalorieGoal || 'Not set'} kcal
- Height: ${userContext.height || 'Not set'} cm
- Weight: ${userContext.weight || 'Not set'} kg
- Activity Level: ${userContext.activityLevel || 'Not set'}

Guidelines:
- Provide helpful, accurate nutrition and health advice
- Support both Vietnamese and English
- Be encouraging and motivating
- Provide specific, actionable advice
- Reference Vietnamese foods when appropriate
- Keep responses concise but informative
- Use emojis occasionally to be friendly
- If asked about specific foods, provide nutrition info
- Promote healthy, sustainable habits

User Message: ${userMessage}

Provide a helpful response:`;

      const result = await this.textModel.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Gemini Chat API response generated');
      
      return text.trim();
    } catch (error) {
      logger.error('Error generating chat response:', error);
      return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau. 😊';
    }
  }

  /**
   * Generate meal plan suggestions
   * @param {Object} userProfile - User profile and preferences
   * @returns {Promise<Object>} - Meal plan suggestions
   */
  async generateMealPlan(userProfile) {
    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not initialized');
      }

      const prompt = `Create a 7-day meal plan for a Vietnamese user.

User Profile:
- Daily Calorie Goal: ${userProfile.dailyCalorieGoal} kcal
- Protein Goal: ${userProfile.proteinGoal}g
- Carbs Goal: ${userProfile.carbsGoal}g
- Fats Goal: ${userProfile.fatsGoal}g
- Goal: ${userProfile.goal}
- Activity Level: ${userProfile.activityLevel}
- Dietary Preferences: ${userProfile.dietaryPreferences?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}

Requirements:
- Focus on Vietnamese cuisine with some international options
- Balance macros to match goals
- Include 3 main meals + 1-2 snacks per day
- Provide variety throughout the week
- Consider dietary restrictions

Respond with valid JSON only (no markdown):
{
  "weekPlan": [
    {
      "day": 1,
      "dayName": "Monday",
      "meals": {
        "breakfast": {"name": "Food name", "calories": 400, "protein": 20, "carbs": 50, "fats": 12},
        "lunch": {"name": "Food name", "calories": 600, "protein": 35, "carbs": 70, "fats": 18},
        "dinner": {"name": "Food name", "calories": 500, "protein": 30, "carbs": 55, "fats": 15},
        "snacks": [{"name": "Snack", "calories": 150, "protein": 5, "carbs": 20, "fats": 6}]
      },
      "totalCalories": 1650,
      "totalProtein": 90,
      "totalCarbs": 195,
      "totalFats": 51
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean up response
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const mealPlan = JSON.parse(text);
      
      logger.info('Meal plan generated successfully');
      
      return mealPlan;
    } catch (error) {
      logger.error('Error generating meal plan:', error);
      throw error;
    }
  }

  /**
   * Get quick reply suggestions based on conversation
   * @param {string} lastMessage - Last message in conversation
   * @returns {Promise<Array<string>>} - Quick reply suggestions
   */
  async getQuickReplySuggestions(lastMessage) {
    try {
      if (!this.genAI) {
        return ['Cảm ơn', 'Cho tôi biết thêm', 'Được rồi'];
      }

      const prompt = `Given this nutrition chatbot message: "${lastMessage}"

Generate 3 short, relevant quick reply suggestions that a user might want to respond with.
Each should be 2-5 words maximum and in Vietnamese.

Respond with valid JSON only:
{
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const data = JSON.parse(text);
      
      return data.suggestions || ['Cảm ơn', 'Cho tôi biết thêm', 'Được rồi'];
    } catch (error) {
      logger.error('Error generating quick replies:', error);
      return ['Cảm ơn', 'Cho tôi biết thêm', 'Được rồi'];
    }
  }
}

module.exports = new GeminiService();
