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
VALUES  (1,
        'Nickys Pizzeria',
        '123 Main Street, Larchmont, NY 10538',
        '(555) 555-5555',
        'nick@nickyspizza.com',
        'https://www.nickyspizza.com',
        'The best pizza place in Larchmont!');

INSERT INTO restaurants_users (restaurant_id, user_id, is_admin)
VALUES  (1,1,True);

INSERT INTO cat_groups(restaurant_id,name,notes)
VALUES  (1,'Beverages','Only alcoholic beverages.'),
        (1,'Food & Non-Alcoholic Beverages','');

INSERT INTO categories(restaurant_id,cat_group_id,name,cogs_percent,notes)
VALUES  (1,1,'Wine',0.30,''),
        (1,1,'Beer',0.10,''),
        (1,1,'Liquor',0.20,''),
        (1,2,'Food',0.33,'The food guests eat.'),
        (1,null,'Retail',0.50,'');

INSERT INTO meal_periods(restaurant_id,name,notes)
VALUES  (1,'Brunch','Brunch service.'),
        (1,'Lunch','Lunch service.'),
        (1,'Dinner','Dinner service.');

INSERT INTO meal_periods_categories(restaurant_id,category_id,meal_period_id,sales_percent_of_period,notes)
VALUES  (1,1,3,0.20,'Dinner wine.'),
        (1,2,3,0.20,'Dinner beer.'),
        (1,3,3,0.20,'Dinner liquor.');

INSERT INTO sales(restaurant_id,meal_period_category_id,date,expected_sales,actual_sales,notes)
VALUES  (1,1,'2021-10-14',1000.00,1250.00,'25% increase in dinner wine sales on 10/14/2021');

INSERT INTO days_of_week(id,name)
VALUES  (1,'Monday'),
        (2,'Tuesday'),
        (3,'Wednesday'),
        (4,'Thursday'),
        (5,'Friday'),
        (6,'Saturday'),
        (7,'Sunday');

INSERT INTO default_sales(restaurant_id,meal_period_id,day_id,total,notes)
VALUES  (1,3,6,12500.00,'Expected Saturday dinner sales');

INSERT INTO invoices (restaurant_id, date, invoice, vendor, total, notes)
VALUES  (1,'2021-10-15','100001','Pizza Supply Company',236.93,'Trying a new sauce vendor.');

INSERT INTO expenses (restaurant_id, category_id, invoice_id, amount, notes)
VALUES  (1,4,1,136.93,'3 x 1 gallon tomatoes'),
        (1,4,1,100,'Olive oil');