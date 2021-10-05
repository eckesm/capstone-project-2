const express = require('express');
const cors = require('cors');

const { NotFoundError } = require('./expressError');

const usersRoutes = require('./routes/user');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', usersRoutes);

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
