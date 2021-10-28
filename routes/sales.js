'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkMealPeriodCatExists } = require('../helpers/checkExist');
const { checkUserIsRestAccess } = require('../helpers/checkAccess');

const Sale = require('../models/sale');

const saleNewSchema = require('../schemas/saleNew.json');
const saleUpdateSchema = require('../schemas/saleUpdate.json');

/** POST /
 * Adds a sales record to the database.
 * 
 * Accepts JSON: {restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes}
 * Returns JSON: {sale: {id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, saleNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { restaurantId, mealPeriodCatId } = req.body;

		await checkMealPeriodCatExists(mealPeriodCatId);

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const sale = await Sale.register(req.body);
			return res.status(201).json({ sale });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets information for a single sale record.
 
 * Returns JSON: {sale: {id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes}}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const saleId = req.params.id;

		const sale = await Sale.get(saleId);
		const restaurantId = sale.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			return res.status(200).json({ sale });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET FOR RESTAURANT & DATE /restaurant/[restaurantId]/date/[date]
 * Gets all sale records for a resaurant on a particular date.
 
 * Returns JSON: {sales: [{id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes}...]}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/restaurants/:restaurantId/date/:date', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { restaurantId, date } = req.params;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const sales = await Sale.restaurantDate(restaurantId, date);
			return res.status(200).json({ sales });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a sale record.
 * 
 * Accepts JSON: {name, catGroupId, cogsPercent, notes}
 * Returns JSON: {sale: {id, restaurantId, name, catGroupId, cogsPercent, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, saleUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const userId = res.locals.user.id;
		const saleId = req.params.id;

		const existingSale = await Sale.get(saleId);
		const restaurantId = existingSale.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const sale = await Sale.update(saleId, req.body);
			return res.status(200).json({ sale });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a sale record from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const saleId = req.params.id;

		const sale = await Sale.get(saleId);
		const restaurantId = sale.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			await Sale.remove(saleId);
			return res.status(200).json({ deleted: saleId });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
