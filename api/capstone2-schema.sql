CREATE TABLE users (
  email_address TEXT PRIMARY KEY
    CHECK (position('@' IN email_address) > 1),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL
);