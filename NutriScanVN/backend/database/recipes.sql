CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  servings INTEGER DEFAULT 1,
  calories NUMERIC(8,2),
  protein_g NUMERIC(8,2),
  carbs_g NUMERIC(8,2),
  fat_g NUMERIC(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT
);

CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  duration_sec INTEGER
);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_order ON recipe_steps(recipe_id, step_number);
