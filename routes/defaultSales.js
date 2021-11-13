'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkMealPeriodExists } = require('../helpers/checkExist');
const { checkUserIsRestAccess, checkUserIsRestAdmin } = require('../helpers/checkAccess');

const DefaultSale = require('../models/defaultSale');

const defaultSaleNewSchema = require('../schemas/defaultSaleNew.json');
const defaultSaleUpdateSchema = require('../schemas/defaultSaleUpdate.json');

/** POST /
 * Adds a default sale entry to the database.
 * 
 * Accepts JSON: {restaurantId, mealPeriodId, dayId, total, notes}
 * Returns JSON: {defaultSale: {id, restaurantId, mealPeriodId, dayId, total, note}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, defaultSaleNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { restaurantId, mealPeriodId } = req.body;

		await checkMealPeriodExists(mealPeriodId);

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const defaultSale = await DefaultSale.register(req.body);
			return res.status(201).json({ defaultSale });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets information for a single default sale entry.
 
 * Returns JSON: {defaultSale: {id, restaurantId, mealPeriodId, dayId, total, note}}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const defaultSaleId = req.params.id;

		const defaultSale = await DefaultSale.get(defaultSaleId);
		const restaurantId = defaultSale.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			return res.status(200).json({ defaultSale });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET ALL /restaurants/[:restaurantId]
 * Gets array of all default sale entries for a restaurant.
 
 * Returns JSON: {defaultSales: [{id, restaurantId, mealPeriodId, dayId, total, note},...]}

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
			const defaultSales = await DefaultSale.getAllForRestaurant(restaurantId);
			return res.status(200).json({ defaultSales });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a category.
 * 
 * Accepts JSON: {total, notes}
 * Returns JSON: {defaultSales: {id, restaurantId, mealPeriodId, dayId, total, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, defaultSaleUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const userId = res.locals.user.id;
		const defaultSaleId = req.params.id;

		const existingDefaultSale = await DefaultSale.get(defaultSaleId);
		const restaurantId = existingDefaultSale.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const defaultSale = await DefaultSale.update(defaultSaleId, req.body);
			return res.status(200).json({ defaultSale });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a default sale entry from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const defaultSaleId = req.params.id;

		const sale = await DefaultSale.get(defaultSaleId);
		const restaurantId = sale.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await DefaultSale.remove(defaultSaleId);
			return res.status(200).json({ deleted: defaultSaleId });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
