const express = require('express');
const cors = require('cors');

const { NotFoundError } = require('./expressError');
const { authenticateJWT } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/user');
const restaurantsRoutes = require('./routes/restaurants');
const catGroupsRoutes = require('./routes/catGroups');
const categoriesRoutes=require('./routes/categories')

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/restaurants', restaurantsRoutes);
app.use('/catgroups', catGroupsRoutes);
app.use('/categories', categoriesRoutes);

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
