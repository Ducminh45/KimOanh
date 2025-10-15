-- NutriScanVN Seed Data
-- Vietnamese and International Foods

-- Seed Vietnamese Foods
INSERT INTO foods (name, name_en, name_vi, category, cuisine, calories, protein, carbohydrates, fats, fiber, serving_size, serving_unit, image_url) VALUES
('Phở Bò', 'Beef Pho', 'Phở Bò', 'main_dish', 'vietnamese', 350, 20, 45, 8, 2, '1', 'bowl', 'https://example.com/pho-bo.jpg'),
('Bánh Mì Thịt', 'Vietnamese Sandwich', 'Bánh Mì Thịt', 'main_dish', 'vietnamese', 400, 18, 50, 12, 3, '1', 'piece', 'https://example.com/banh-mi.jpg'),
('Cơm Tấm', 'Broken Rice', 'Cơm Tấm', 'main_dish', 'vietnamese', 550, 25, 70, 15, 2, '1', 'plate', 'https://example.com/com-tam.jpg'),
('Bún Chả', 'Grilled Pork with Noodles', 'Bún Chả', 'main_dish', 'vietnamese', 480, 22, 55, 18, 3, '1', 'bowl', 'https://example.com/bun-cha.jpg'),
('Gỏi Cuốn', 'Spring Rolls', 'Gỏi Cuốn', 'appetizer', 'vietnamese', 120, 8, 15, 3, 2, '2', 'rolls', 'https://example.com/goi-cuon.jpg'),
('Chả Giò', 'Fried Spring Rolls', 'Chả Giò', 'appetizer', 'vietnamese', 180, 10, 12, 10, 1, '3', 'rolls', 'https://example.com/cha-gio.jpg'),
('Cà Phê Sữa Đá', 'Vietnamese Iced Coffee', 'Cà Phê Sữa Đá', 'beverage', 'vietnamese', 150, 2, 24, 4, 0, '1', 'glass', 'https://example.com/ca-phe.jpg'),
('Bánh Xèo', 'Vietnamese Pancake', 'Bánh Xèo', 'main_dish', 'vietnamese', 420, 15, 48, 18, 3, '1', 'piece', 'https://example.com/banh-xeo.jpg'),
('Hủ Tiếu', 'Pork Noodle Soup', 'Hủ Tiếu', 'main_dish', 'vietnamese', 380, 18, 52, 10, 2, '1', 'bowl', 'https://example.com/hu-tieu.jpg'),
('Cao Lầu', 'Hoi An Noodles', 'Cao Lầu', 'main_dish', 'vietnamese', 450, 20, 58, 14, 3, '1', 'bowl', 'https://example.com/cao-lau.jpg'),
('Bún Bò Huế', 'Hue Beef Noodle', 'Bún Bò Huế', 'main_dish', 'vietnamese', 520, 24, 62, 18, 3, '1', 'bowl', 'https://example.com/bun-bo-hue.jpg'),
('Cơm Gà', 'Chicken Rice', 'Cơm Gà', 'main_dish', 'vietnamese', 480, 28, 65, 12, 2, '1', 'plate', 'https://example.com/com-ga.jpg'),
('Xôi', 'Sticky Rice', 'Xôi', 'main_dish', 'vietnamese', 320, 8, 68, 4, 2, '1', 'portion', 'https://example.com/xoi.jpg'),
('Chè', 'Sweet Dessert Soup', 'Chè', 'dessert', 'vietnamese', 220, 3, 45, 5, 2, '1', 'bowl', 'https://example.com/che.jpg'),
('Bánh Bao', 'Steamed Bun', 'Bánh Bao', 'snack', 'vietnamese', 280, 12, 42, 8, 2, '1', 'piece', 'https://example.com/banh-bao.jpg'),
('Nem Rán', 'Fried Rolls', 'Nem Rán', 'appetizer', 'vietnamese', 200, 11, 14, 12, 1, '3', 'pieces', 'https://example.com/nem-ran.jpg'),
('Bún Riêu', 'Crab Noodle Soup', 'Bún Riêu', 'main_dish', 'vietnamese', 420, 22, 54, 14, 3, '1', 'bowl', 'https://example.com/bun-rieu.jpg'),
('Mì Quảng', 'Quang Noodles', 'Mì Quảng', 'main_dish', 'vietnamese', 460, 21, 56, 16, 3, '1', 'bowl', 'https://example.com/mi-quang.jpg');

-- Seed Common Vietnamese Fruits
INSERT INTO foods (name, name_en, name_vi, category, cuisine, calories, protein, carbohydrates, fats, fiber, serving_size, serving_unit) VALUES
('Chuối', 'Banana', 'Chuối', 'fruit', 'vietnamese', 105, 1.3, 27, 0.3, 3.1, '1', 'medium'),
('Xoài', 'Mango', 'Xoài', 'fruit', 'vietnamese', 150, 1.4, 38, 0.6, 4, '1', 'cup'),
('Dứa', 'Pineapple', 'Dứa', 'fruit', 'vietnamese', 82, 0.9, 22, 0.2, 2.3, '1', 'cup'),
('Đu Đủ', 'Papaya', 'Đu Đủ', 'fruit', 'vietnamese', 62, 0.7, 16, 0.4, 2.5, '1', 'cup'),
('Thanh Long', 'Dragon Fruit', 'Thanh Long', 'fruit', 'vietnamese', 60, 1.2, 13, 0, 3, '1', 'piece'),
('Chôm Chôm', 'Rambutan', 'Chôm Chôm', 'fruit', 'vietnamese', 75, 0.7, 19, 0.2, 0.9, '100', 'grams'),
('Măng Cụt', 'Mangosteen', 'Măng Cụt', 'fruit', 'vietnamese', 73, 0.4, 18, 0.6, 1.8, '100', 'grams');

-- Seed Common Vietnamese Vegetables
INSERT INTO foods (name, name_en, name_vi, category, cuisine, calories, protein, carbohydrates, fats, fiber, serving_size, serving_unit) VALUES
('Rau Muống', 'Water Spinach', 'Rau Muống', 'vegetable', 'vietnamese', 19, 2.6, 3.1, 0.2, 2.1, '100', 'grams'),
('Cải Xanh', 'Bok Choy', 'Cải Xanh', 'vegetable', 'vietnamese', 13, 1.5, 2.2, 0.2, 1, '100', 'grams'),
('Rau Ngổ', 'Coriander', 'Rau Ngổ', 'vegetable', 'vietnamese', 23, 2.1, 3.7, 0.5, 2.8, '100', 'grams'),
('Giá Đỗ', 'Bean Sprouts', 'Giá Đỗ', 'vegetable', 'vietnamese', 31, 3, 6, 0.2, 1.8, '100', 'grams');

-- Seed International Foods
INSERT INTO foods (name, name_en, name_vi, category, cuisine, calories, protein, carbohydrates, fats, fiber, serving_size, serving_unit) VALUES
('Grilled Chicken Breast', 'Grilled Chicken Breast', 'Ức Gà Nướng', 'protein', 'international', 165, 31, 0, 3.6, 0, '100', 'grams'),
('Brown Rice', 'Brown Rice', 'Cơm Gạo Lứt', 'grain', 'international', 216, 5, 45, 1.8, 3.5, '1', 'cup'),
('White Rice', 'White Rice', 'Cơm Trắng', 'grain', 'international', 205, 4.2, 45, 0.4, 0.6, '1', 'cup'),
('Salmon', 'Salmon', 'Cá Hồi', 'protein', 'international', 206, 22, 0, 13, 0, '100', 'grams'),
('Egg', 'Egg', 'Trứng', 'protein', 'international', 78, 6.3, 0.6, 5.3, 0, '1', 'large'),
('Avocado', 'Avocado', 'Bơ', 'fruit', 'international', 160, 2, 8.5, 14.7, 6.7, '100', 'grams'),
('Broccoli', 'Broccoli', 'Súp Lơ Xanh', 'vegetable', 'international', 55, 3.7, 11.2, 0.6, 2.4, '1', 'cup'),
('Sweet Potato', 'Sweet Potato', 'Khoai Lang', 'vegetable', 'international', 180, 4, 41, 0.3, 6.6, '1', 'medium'),
('Greek Yogurt', 'Greek Yogurt', 'Sữa Chua Hy Lạp', 'dairy', 'international', 100, 17, 6, 0.7, 0, '170', 'grams'),
('Oatmeal', 'Oatmeal', 'Yến Mạch', 'grain', 'international', 150, 5, 27, 3, 4, '40', 'grams');

-- Seed Sample Recipes
INSERT INTO recipes (name, description, cuisine, difficulty, prep_time_minutes, cook_time_minutes, total_time_minutes, servings, calories_per_serving, protein, carbohydrates, fats, fiber, instructions, tags) VALUES
('Phở Gà Homemade', 'Delicious homemade chicken pho with rice noodles', 'vietnamese', 'medium', 20, 60, 80, 4, 320, 25, 45, 6, 2, 
ARRAY['Bring chicken stock to boil with ginger and onion', 'Add fish sauce and seasonings', 'Cook rice noodles separately', 'Slice chicken breast thinly', 'Assemble bowl with noodles, chicken, and hot broth', 'Top with herbs, lime, and bean sprouts'],
ARRAY['soup', 'vietnamese', 'comfort-food', 'high-protein']),

('Gỏi Cuốn Tôm', 'Fresh spring rolls with shrimp and vegetables', 'vietnamese', 'easy', 30, 0, 30, 8, 95, 8, 12, 2, 2,
ARRAY['Prepare rice paper and soak in warm water', 'Cook shrimp until pink', 'Slice vegetables thinly', 'Lay ingredients on rice paper', 'Roll tightly', 'Serve with peanut sauce'],
ARRAY['appetizer', 'healthy', 'light', 'no-cook']),

('Cơm Gà Hải Nam', 'Hainanese chicken rice with fragrant rice', 'vietnamese', 'medium', 15, 45, 60, 4, 480, 32, 58, 14, 2,
ARRAY['Poach whole chicken in water with ginger', 'Cook rice in chicken broth', 'Prepare ginger-garlic sauce', 'Slice chicken', 'Serve chicken over rice with cucumber and sauce'],
ARRAY['main-dish', 'chicken', 'rice', 'asian']),

('Healthy Grilled Salmon Bowl', 'Nutritious bowl with grilled salmon, quinoa, and vegetables', 'international', 'easy', 10, 15, 25, 2, 450, 35, 42, 18, 8,
ARRAY['Cook quinoa according to package', 'Season salmon with salt and pepper', 'Grill salmon for 4-5 minutes per side', 'Steam broccoli', 'Assemble bowl with quinoa, salmon, vegetables', 'Drizzle with olive oil and lemon'],
ARRAY['healthy', 'high-protein', 'omega-3', 'bowl']);

-- Seed Recipe Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Phở Gà Homemade'), 'Chicken breast', 500, 'grams'),
((SELECT id FROM recipes WHERE name = 'Phở Gà Homemade'), 'Rice noodles', 400, 'grams'),
((SELECT id FROM recipes WHERE name = 'Phở Gà Homemade'), 'Chicken stock', 2, 'liters'),
((SELECT id FROM recipes WHERE name = 'Phở Gà Homemade'), 'Ginger', 50, 'grams'),
((SELECT id FROM recipes WHERE name = 'Phở Gà Homemade'), 'Onion', 1, 'piece');

-- Seed Achievements
INSERT INTO achievements (name, description, icon, category, points, requirement) VALUES
('First Meal', 'Log your first meal', '🍽️', 'nutrition', 10, 1),
('Week Warrior', 'Log meals for 7 consecutive days', '🔥', 'streak', 50, 7),
('Hydration Hero', 'Reach your daily water goal', '💧', 'water', 20, 1),
('Fitness Fanatic', 'Log 10 exercises', '💪', 'exercise', 30, 10),
('Scanner Pro', 'Scan 50 foods', '📸', 'scanner', 40, 50),
('Social Butterfly', 'Make 5 posts in the community', '🦋', 'social', 25, 5),
('Goal Getter', 'Hit your calorie goal for 30 days', '🎯', 'goal', 100, 30),
('Early Bird', 'Log breakfast 10 times', '🌅', 'nutrition', 15, 10),
('Meal Planner', 'Create your first meal plan', '📅', 'planning', 20, 1),
('Recipe Master', 'Try 20 different recipes', '👨‍🍳', 'cooking', 50, 20);

-- Seed Sample Challenges
INSERT INTO challenges (name, description, challenge_type, target_value, metric, start_date, end_date, reward_points, is_active) VALUES
('7-Day Tracking Challenge', 'Log your meals every day for a week', 'weekly', 7, 'meal_logs', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 50, true),
('Hydration Challenge', 'Drink 8 glasses of water daily for 7 days', 'weekly', 56, 'water_glasses', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 40, true),
('Exercise Challenge', 'Complete 5 workouts this month', 'monthly', 5, 'exercises', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 75, true),
('Calorie Goal Challenge', 'Stay within your calorie goal 20 days this month', 'monthly', 20, 'goal_days', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100, true);

-- Update food popularity scores based on typical Vietnamese preferences
UPDATE foods SET popularity_score = 100 WHERE name IN ('Phở Bò', 'Bánh Mì Thịt', 'Cơm Tấm');
UPDATE foods SET popularity_score = 90 WHERE name IN ('Bún Chả', 'Gỏi Cuốn', 'Cà Phê Sữa Đá');
UPDATE foods SET popularity_score = 80 WHERE category = 'fruit';
UPDATE foods SET popularity_score = 70 WHERE category = 'vegetable';
UPDATE foods SET is_verified = true;

-- Create sample demo user (password: Demo123!)
INSERT INTO users (email, password_hash, full_name, date_of_birth, gender, height, weight, goal, activity_level, daily_calorie_goal, protein_goal, carbs_goal, fats_goal) VALUES
('demo@nutriscanvn.com', '$2a$10$8K1p/a0dL3LKzI0E7bQVs.Ik8U.xLKHNcKqEH3bj3nJ7O3x5ySZTS', 'Demo User', '1995-01-01', 'male', 175, 70, 'maintain_weight', 'moderately_active', 2200, 165, 247, 73);
