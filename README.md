# Restaurant Budgeting Application (_backend_)

## Stack
The frontend is built on a React framework and makes extensive use of the Redux library.  The frontend is deployed on Heroku.

The backend is built in a Node.js ecosystem with Express.js employed as the routing framework.  The backend is deployed on Heroku.

## Deployment & Repositories

Heroku deployments:
* Frontend: [www.restobudget.com](https://www.restobudget.com)
* Backend: [api.restobudget.com](https://api.restobudget.com)

Git repositories:
* Frontend: [github.com/eckesm/capstone-project-2-frontend](https://github.com/eckesm/capstone-project-2-frontend)
* Backend: [github.com/eckesm/capstone-project-2-backend](https://github.com/eckesm/capstone-project-2-backend)

## Local Installation & Starting the Local Server

* Clone project from repository
* Navigate to teh project folder
* node is required to run the project; if necessary, run `npm install node`
* run `npm install` to install project dependancies
* run the `capstone2.sql` file to create and seed databases (change database names as desired)
* Update variables in the .config file to suit your environment, as necessary
* run `npm start` or `npm run dev` to start the server



## Functionality, Calculations, & Additional Features

_See frontend documentation at: [https://github.com/eckesm/capstone-project-2-frontend](https://github.com/eckesm/capstone-project-2-frontend)_

## Backend API

The frontend sends requests to a custom backend API located at [https://api.restobudget.com](https://api.restobudget.com/)

This API is connected to a Postgres database and is responsible for handling all CRUD features of the website.  When a new restaurant is created, the backend API automatically creates many records with default settings for the new restaurant.

API requests are sent to the following route paths:
* auth
* categories
* catGroups
* defaultSales
* expenses
* invoices
* mealPeriods
* restaurants
* sales
* user

## Available Scripts & Testing

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run dev`

Runs the app in development mode using nodemon to enable automatic refreshing of the server when files change.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

