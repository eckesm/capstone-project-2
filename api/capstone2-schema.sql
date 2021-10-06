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
  restaurant_id INTEGER
    REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id INTEGER
    REFERENCES users(id) ON DELETE CASCADE,
  is_admin BOOLEAN,
  PRIMARY KEY (restaurant_id, user_id)
);