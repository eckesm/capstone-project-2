INSERT INTO users (email_address, first_name, last_name, password)
VALUES ('eckesm@gmail.com',
        'Matt',
        'Eckes',
        '$2b$12$T8U7R1tCOkdulhUrLDq92u9r8kzEYnsVxcjBTFYzIx1XwSFjXc8OS'),
       ('eckesl@gmail.com',
        'Laura',
        'Eckes',
        '$2b$12$lO2KBK7S0q7EnyNklhhfb.fnfiwhn4K0OdWFezzVuL7FtRMuVZCPa'),
       ('eckesj@gmail.com',
        'John',
        'Eckes',
        '$2b$12$My9Y6WwReaPH6syJvTCz3OJEqe1.IwdHnjSIdRZxVM28I3hsv.g3G'),
        ('rosenbergp@gmail.com',
        'Penny',
        'Rosenberg',
        '$2b$12$wViEIprZC57kCD9GOIUhG.kfEXZhdlyVb5KgLInSe31z1bgLJ3qku');

INSERT INTO restaurants (owner_id, name, address, phone, email, website, notes)
VALUES (1,
        'Nickys Pizzeria',
        '123 Main Street, Larchmont, NY 10538',
        '(555) 555-5555',
        'nick@nickyspizza.com',
        'https://www.nickyspizza.com',
        'The best pizza place in Larchmont!');

INSERT INTO restaurants_users (restaurant_id, user_id, is_admin)
VALUES (1,1,True);