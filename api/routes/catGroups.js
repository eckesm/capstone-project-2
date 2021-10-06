'use strict';

const express = require('express');
const router = new express.Router();

const { ExpressError, UnauthrorizedError } = require('../expressError');
const CatGroup = require('../models/catGroup');
const { ensureLoggedIn } = require('../middleware/auth');

/** POST /
 * Adds a category group to the database.
 * Accepts JSON: {restaurantId,name, notes}
 * Returns JSON: {catGroup: {id, restaurantId,name, notes}}
 * Authorization: ensure a user is logged in.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		// const userId = res.locals.user.id;
		const catGroup = await CatGroup.register(req.body);
		return res.status(201).json({ catGroup });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
