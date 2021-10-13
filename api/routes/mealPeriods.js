'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { UnauthrorizedError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');

const Restaurant = require('../models/restaurant');
const Restaurant_User = require('../models/restaurant_user');
const MealPeriod = require('../models/mealPeriod');
const mealPeriodNewSchema = require('../schemas/mealPeriodNew.json');
const mealPeriodUpdateSchema = require('../schemas/mealPeriodUpdate.json');

/** POST /
 * Adds a meal period to the database.
 * Accepts JSON: {restaurantId, name, notes}
 * Returns JSON: {mealPeriod: {id, restaurantId, name, notes}}
 * Authorization: ensure logged in.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, mealPeriodNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { restaurantId } = req.body;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const mealPeriod = await MealPeriod.register(req.body);
			return res.status(201).json({ mealPeriod });
		}
		throw new UnauthrorizedError(
			`User ${userId} is not authorized to add a meal period to restaurant ${restaurantId}.`
		);
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets meal period informaion for a single meal period.
 * Returns JSON: {mealPeriod: {id, restaurantId, name, notes}}
 * Authorization: ensure logged in.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const mealPeriodId = req.params.id;
		const userId = res.locals.user.id;

		const mealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = mealPeriod.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await Restaurant_User.checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const restaurant = await Restaurant.get(restaurantId);
			mealPeriod.restaurantName = restaurant.name;

			return res.status(200).json({ mealPeriod });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to access meal period ${mealPeriodId}.`);
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a meal period.
 * Accepts JSON: {name, notes}
 * Returns JSON: {category: {id, name, notes}}
 * Authorization: ensure logged in.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, mealPeriodUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const mealPeriodId = req.params.id;
		const userId = res.locals.user.id;

		const checkMealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = checkMealPeriod.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const mealPeriod = await MealPeriod.update(mealPeriodId, req.body);
			return res.status(200).json({ mealPeriod });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to update meal period ${mealPeriodId}.`);
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a meal period from the database.
 * Returns JSON: {deleted: id}
 * Authorization: ensure logged in.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const mealPeriodId = req.params.id;
		const userId = res.locals.user.id;

		const checkMealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = checkMealPeriod.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await MealPeriod.remove(mealPeriodId);
			return res.status(200).json({ deleted: mealPeriodId });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to delete meal period ${mealPeriodId}.`);
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
