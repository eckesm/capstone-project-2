CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email_address TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email_address) > 1),
  password TEXT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL
);

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER
    REFERENCES users(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(25),
  email TEXT,
  website TEXT,
  notes TEXT
);

CREATE TABLE restaurants_users (
  id SERIAL UNIQUE,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id INTEGER
    REFERENCES users(id) ON DELETE CASCADE,
  is_admin BOOLEAN,
  PRIMARY KEY (restaurant_id, user_id)
);

CREATE TABLE cat_groups (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  notes TEXT
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  cat_group_id INTEGER
    REFERENCES cat_groups(id),
  cogs_percent DECIMAL(4,4),
  notes TEXT
);

CREATE TABLE meal_periods (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  notes TEXT
);

CREATE TABLE meal_periods_categories (
  id SERIAL UNIQUE,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id INTEGER
    REFERENCES categories(id) ON DELETE CASCADE,
  meal_period_id INTEGER
    REFERENCES meal_periods(id) ON DELETE CASCADE,
  sales_percent_of_period DECIMAL(4,4),
  notes TEXT,
  PRIMARY KEY (restaurant_id, category_id, meal_period_id)
);

CREATE TABLE sales (
  id SERIAL UNIQUE,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  meal_period_category_id INTEGER
    REFERENCES meal_periods_categories(id) ON DELETE CASCADE,
  date DATE,
  expected_sales DECIMAL(10,2),
  actual_sales DECIMAL(10,2),
  notes TEXT,
  PRIMARY KEY (restaurant_id, meal_period_category_id,date)
);

CREATE TABLE days_of_week(
  id INTEGER PRIMARY KEY,
  name VARCHAR(10) NOT NULL
);

CREATE TABLE default_sales (
  id SERIAL UNIQUE,
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  meal_period_id INTEGER
    REFERENCES meal_periods(id) ON DELETE CASCADE,
  day_id INTEGER
    REFERENCES days_of_week(id),
  total DECIMAL(10,2),
  notes TEXT,
  PRIMARY KEY (restaurant_id, meal_period_id,day_id)
);