const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

const { NotFoundError } = require('./expressError');
const { authenticateJWT } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/user');
const restaurantsRoutes = require('./routes/restaurants');
const catGroupsRoutes = require('./routes/catGroups');
const categoriesRoutes = require('./routes/categories');
const mealPeriodRoutes = require('./routes/mealPeriods');
const salesRoutes = require('./routes/sales');
const defaultSalesRoutes = require('./routes/defaultSales');
const invoicesRoutes = require('./routes/invoices');
const expensesRoutes = require('./routes/expenses');

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/restaurants', restaurantsRoutes);
app.use('/catgroups', catGroupsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/mealperiods', mealPeriodRoutes);
app.use('/sales', salesRoutes);
app.use('/defaultsales', defaultSalesRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/expenses', expensesRoutes);

/** 404 catch --- pass to the next handler. */
app.use(function(req, res, next) {
	return next(new NotFoundError());
});

/** general error handler */
app.use(function(err, req, res, next) {
	let status = err.status || 500;
	return res.status(status).json({
		error : {
			message : err.message,
			status  : status
		}
	});
});

module.exports = app;
