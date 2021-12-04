'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkUserIsRestAccess, checkUserIsRestAdmin } = require('../helpers/checkAccess');

const Restaurant = require('../models/restaurant');
const MealPeriod = require('../models/mealPeriod');
const MealPeriod_Category = require('../models/mealPeriod_category');

const mealPeriodNewSchema = require('../schemas/mealPeriodNew.json');
const mealPeriodUpdateSchema = require('../schemas/mealPeriodUpdate.json');
const mealPeriodCatNewSchema = require('../schemas/mealPeriodCatNew.json');
const mealPeriodCatUpdateSchema = require('../schemas/mealPeriodCatUpdate.json');

/** POST /
 * Adds a meal period to the database.
 * 
 * Accepts JSON: {restaurantId, name, notes}
 * Returns JSON: {mealPeriod: {id, restaurantId, name, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
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
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const mealPeriod = await MealPeriod.register(req.body);
			return res.status(201).json({ mealPeriod });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets meal period informaion for a single meal period.
 * 
 * Returns JSON: {mealPeriod: {id, restaurantId, name, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const mealPeriodId = req.params.id;

		const mealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = mealPeriod.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const restaurant = await Restaurant.get(restaurantId);
			mealPeriod.restaurantName = restaurant.name;

			return res.status(200).json({ mealPeriod });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET ALL /restaurants/[id]
 * Gets all meal periods for a restaurant.
 * 
 * Returns JSON: {mealPeriods: [{id, restaurantId, name, notes},...]}
 * 
 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/restaurants/:restaurantId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { restaurantId } = req.params;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const mealPeriods = await MealPeriod.getAllForRestaurant(restaurantId);
			return res.status(200).json({ mealPeriods });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a meal period.
 * 
 * Accepts JSON: {name, notes}
 * Returns JSON: {category: {id, name, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, mealPeriodUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const userId = res.locals.user.id;
		const mealPeriodId = req.params.id;

		const existingMealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = existingMealPeriod.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const mealPeriod = await MealPeriod.update(mealPeriodId, req.body);
			return res.status(200).json({ mealPeriod });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a meal period from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const mealPeriodId = req.params.id;
		const userId = res.locals.user.id;

		const mealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = mealPeriod.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await MealPeriod.remove(mealPeriodId);
			return res.status(200).json({ deleted: mealPeriodId });
		}
	} catch (error) {
		return next(error);
	}
});

/** POST /[mealPeriodId]/categories/[categoryId]
 * Adds a restaurant and user association to the database.
 * 
 * Accepts JSON: {salesPercentOfPeriod, notes}
 * Returns JSON: {mealPeriodCat: {restaurantId, categoryId, mealPeriodId, salesPercentOfPeriod, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.post('/:mealPeriodId/categories/:categoryId', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, mealPeriodCatNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { mealPeriodId, categoryId } = req.params;

		const mealPeriod = await MealPeriod.get(mealPeriodId);
		const restaurantId = mealPeriod.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const mealPeriodCat = await MealPeriod_Category.register(restaurantId, mealPeriodId, categoryId, req.body);
			return res.status(201).json({ mealPeriodCat });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[mealPeriodId]/categories/[categoryId]
 * Gets meal period and category association information.
 * 
 * Returns JSON: {mealPeriodCat: {restaurantId, categoryId, mealPeriodId, salesPercentOfPeriod, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.get('/:mealPeriodId/categories/:categoryId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { mealPeriodId, categoryId } = req.params;

		const mealPeriodCat = await MealPeriod_Category.lookup(mealPeriodId, categoryId);
		const restaurantId = mealPeriodCat.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			return res.status(200).json({ mealPeriodCat });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[mealPeriodId]/categories/[categoryId]
 * Updates a meal period and category association in the database.
 * 
 * Accepts JSON: {salesPercentOfPeriod, notes}
 * Returns JSON: {mealPeriodCat: {restaurantId, categoryId, mealPeriodId, salesPercentOfPeriod, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.put('/:mealPeriodId/categories/:categoryId', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, mealPeriodCatUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { mealPeriodId, categoryId } = req.params;

		const existingMealPeriodCat = await MealPeriod_Category.lookup(mealPeriodId, categoryId);
		const restaurantId = existingMealPeriodCat.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const mealPeriodCat = await MealPeriod_Category.update(categoryId, mealPeriodId, req.body);
			return res.status(201).json({ mealPeriodCat });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[mealPeriodId]/categories/[categoryId]
 * Deletes a meal period and category association from the database.
 * 
 * Returns JSON: (nothing)
 * 
 * Throws NotFoundError if association does not exist.
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.delete('/:mealPeriodId/categories/:categoryId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { mealPeriodId, categoryId } = req.params;

		const mealPeriodCat = await MealPeriod_Category.lookup(mealPeriodId, categoryId);
		const restaurantId = mealPeriodCat.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await MealPeriod_Category.remove(categoryId, mealPeriodId);
			return res.status(201).json({ deleted: { mealPeriodId, categoryId } });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
