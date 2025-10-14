import { Config } from '@/constants/config';
import { ErrorHandler } from '@/utils/errorHandler';

export interface GeminiVisionResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface FoodAnalysisResult {
  foods: Array<{
    name: string;
    nameVi: string;
    confidence: number;
    category: string;
    estimatedWeight?: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
    };
  }>;
  confidence: number;
  suggestions: string[];
  analysis: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  context?: {
    topic: string;
    relatedQuestions: string[];
  };
}

export class GeminiService {
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
  private static readonly VISION_MODEL = 'gemini-pro-vision';
  private static readonly TEXT_MODEL = 'gemini-pro';

  /**
   * Analyze food image using Gemini Vision
   */
  static async analyzeFoodImage(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
  ): Promise<FoodAnalysisResult> {
    try {
      if (!Config.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `
        Analyze this food image and provide detailed information in Vietnamese. Please identify:
        1. All visible food items with Vietnamese names
        2. Estimated portion sizes
        3. Nutritional information per 100g
        4. Confidence level for each identification
        5. Food categories (Vietnamese cuisine, international, etc.)

        Respond in JSON format with this structure:
        {
          "foods": [
            {
              "name": "English name",
              "nameVi": "Tên tiếng Việt",
              "confidence": 0.95,
              "category": "Vietnamese/International/etc",
              "estimatedWeight": 150,
              "nutrition": {
                "calories": 250,
                "protein": 15,
                "carbs": 30,
                "fat": 8,
                "fiber": 3
              }
            }
          ],
          "confidence": 0.9,
          "suggestions": ["Suggestion 1", "Suggestion 2"],
          "analysis": "Detailed analysis in Vietnamese"
        }
      `;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      };

      const response = await fetch(
        `${this.API_URL}/${this.VISION_MODEL}:generateContent?key=${Config.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data: GeminiVisionResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini Vision API');
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      
      try {
        // Try to parse JSON response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return result;
        } else {
          // Fallback: parse text response manually
          return this.parseTextResponse(textResponse);
        }
      } catch (parseError) {
        // If JSON parsing fails, create a basic response
        return this.createFallbackResponse(textResponse);
      }
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      throw ErrorHandler.handleGeminiError(error);
    }
  }

  /**
   * Chat with Gemini for nutrition advice
   */
  static async chatWithNutritionist(
    message: string,
    userContext?: {
      age?: number;
      gender?: 'male' | 'female';
      weight?: number;
      height?: number;
      activityLevel?: string;
      goal?: string;
      dietaryPreferences?: string[];
      allergies?: string[];
    }
  ): Promise<ChatResponse> {
    try {
      if (!Config.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      let contextPrompt = '';
      if (userContext) {
        contextPrompt = `
          User context:
          - Age: ${userContext.age || 'Not specified'}
          - Gender: ${userContext.gender || 'Not specified'}
          - Weight: ${userContext.weight ? `${userContext.weight}kg` : 'Not specified'}
          - Height: ${userContext.height ? `${userContext.height}cm` : 'Not specified'}
          - Activity Level: ${userContext.activityLevel || 'Not specified'}
          - Goal: ${userContext.goal || 'Not specified'}
          - Dietary Preferences: ${userContext.dietaryPreferences?.join(', ') || 'None'}
          - Allergies: ${userContext.allergies?.join(', ') || 'None'}
        `;
      }

      const prompt = `
        You are a professional Vietnamese nutritionist and dietitian. Provide helpful, accurate, and personalized nutrition advice in Vietnamese.
        
        ${contextPrompt}
        
        User question: ${message}
        
        Please provide:
        1. A helpful response in Vietnamese
        2. 2-3 follow-up question suggestions
        3. Context about the topic for better understanding
        
        Respond in JSON format:
        {
          "message": "Your detailed response in Vietnamese",
          "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
          "context": {
            "topic": "Main topic",
            "relatedQuestions": ["Related question 1", "Related question 2"]
          }
        }
      `;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(
        `${this.API_URL}/${this.TEXT_MODEL}:generateContent?key=${Config.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data: GeminiVisionResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const textResponse = data.candidates[0].content.parts[0].text;

      try {
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          return {
            message: textResponse,
            suggestions: [
              'Tôi có thể ăn gì để tăng protein?',
              'Làm thế nào để giảm cân hiệu quả?',
              'Chế độ ăn nào phù hợp với tôi?',
            ],
          };
        }
      } catch (parseError) {
        return {
          message: textResponse,
          suggestions: [
            'Tôi có thể ăn gì để tăng protein?',
            'Làm thế nào để giảm cân hiệu quả?',
            'Chế độ ăn nào phù hợp với tôi?',
          ],
        };
      }
    } catch (error) {
      console.error('Gemini Chat API error:', error);
      throw ErrorHandler.handleGeminiError(error);
    }
  }

  /**
   * Generate meal plan using Gemini
   */
  static async generateMealPlan(
    preferences: {
      calories: number;
      days: number;
      dietType?: string;
      allergies?: string[];
      preferences?: string[];
      budget?: 'low' | 'medium' | 'high';
    }
  ): Promise<{
    mealPlan: Array<{
      day: number;
      date: string;
      meals: {
        breakfast: {
          name: string;
          nameVi: string;
          calories: number;
          ingredients: string[];
          instructions: string[];
        };
        lunch: {
          name: string;
          nameVi: string;
          calories: number;
          ingredients: string[];
          instructions: string[];
        };
        dinner: {
          name: string;
          nameVi: string;
          calories: number;
          ingredients: string[];
          instructions: string[];
        };
        snacks?: Array<{
          name: string;
          nameVi: string;
          calories: number;
        }>;
      };
      totalCalories: number;
      macros: {
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
    shoppingList: Array<{
      item: string;
      quantity: string;
      category: string;
    }>;
    tips: string[];
  }> {
    try {
      const prompt = `
        Create a ${preferences.days}-day Vietnamese meal plan with the following requirements:
        - Daily calories: ${preferences.calories}
        - Diet type: ${preferences.dietType || 'Balanced'}
        - Allergies: ${preferences.allergies?.join(', ') || 'None'}
        - Preferences: ${preferences.preferences?.join(', ') || 'None'}
        - Budget: ${preferences.budget || 'medium'}
        
        Focus on Vietnamese cuisine and locally available ingredients.
        Include detailed recipes, shopping list, and nutrition tips.
        
        Respond in JSON format with the specified structure.
      `;

      const response = await this.chatWithNutritionist(prompt);
      
      // Parse the meal plan from the response
      // This would need more sophisticated parsing in a real implementation
      return {
        mealPlan: [],
        shoppingList: [],
        tips: [],
      };
    } catch (error) {
      console.error('Meal plan generation error:', error);
      throw error;
    }
  }

  /**
   * Parse text response when JSON parsing fails
   */
  private static parseTextResponse(text: string): FoodAnalysisResult {
    // Basic text parsing logic
    const foods = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('food') || line.includes('món')) {
        // Extract food information from text
        foods.push({
          name: 'Unknown Food',
          nameVi: 'Món ăn không xác định',
          confidence: 0.5,
          category: 'Unknown',
        });
      }
    }

    return {
      foods,
      confidence: 0.5,
      suggestions: ['Thử chụp ảnh rõ hơn', 'Đảm bảo ánh sáng tốt'],
      analysis: text,
    };
  }

  /**
   * Create fallback response when parsing fails
   */
  private static createFallbackResponse(text: string): FoodAnalysisResult {
    return {
      foods: [
        {
          name: 'Food Item',
          nameVi: 'Món ăn',
          confidence: 0.6,
          category: 'General',
          nutrition: {
            calories: 200,
            protein: 10,
            carbs: 25,
            fat: 8,
          },
        },
      ],
      confidence: 0.6,
      suggestions: [
        'Thử chụp ảnh từ góc độ khác',
        'Đảm bảo món ăn được chiếu sáng tốt',
        'Chụp ảnh gần hơn để thấy chi tiết',
      ],
      analysis: text,
    };
  }

  /**
   * Check API quota and usage
   */
  static async checkQuota(): Promise<{
    remaining: number;
    resetTime: string;
    dailyLimit: number;
  }> {
    // This would typically call a quota endpoint
    // For now, return mock data
    return {
      remaining: 100,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      dailyLimit: 1000,
    };
  }

  /**
   * Validate image before sending to API
   */
  static validateImage(imageBase64: string, mimeType: string): boolean {
    // Check file size (base64 is ~33% larger than original)
    const sizeInBytes = (imageBase64.length * 3) / 4;
    const maxSize = 4 * 1024 * 1024; // 4MB

    if (sizeInBytes > maxSize) {
      throw new Error('Image too large. Maximum size is 4MB.');
    }

    // Check mime type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      throw new Error('Unsupported image format. Use JPEG, PNG, or WebP.');
    }

    return true;
  }
}

export default GeminiService;