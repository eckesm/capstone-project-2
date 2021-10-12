'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError, ExpressError, UnauthrorizedError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');

const CatGroup = require('../models/catGroup');
const Restaurant_User = require('../models/restaurant_user');
const catGroupNewSchema = require('../schemas/catGroupNew.json');
const catGroupUpdateSchema = require('../schemas/catGroupUpdate.json');

/** POST /
 * Adds a category group to the database.
 * Accepts JSON: {restaurantId, name, notes}
 * Returns JSON: {catGroup: {id, restaurantId, name, notes}}
 * Authorization: ensure logged in.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		// const userId = res.locals.user.id;
		const validator = jsonschema.validate(req.body, catGroupNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const catGroup = await CatGroup.register(req.body);
		return res.status(201).json({ catGroup });
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets group informaion for a single category group.
 * Returns JSON: {catGroup: {id, restaurantId, name, notes}}
 * Authorization: ensure logged in.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const catGroupId = req.params.id;
		const userId = res.locals.user.id;

		const catGroup = await CatGroup.get(catGroupId);
		const restaurantId = catGroup.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await Restaurant_User.checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			return res.status(200).json({ catGroup });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to access category group ${catGroupId}.`);
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a restaurant.
 * Accepts JSON: {name, address, phone, email, website, notes}
 * Returns JSON: {restaurant: {id, ownerId, name, address, phone, email, website, notes}}
 * Authorization: ensure logged in.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, catGroupUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const catGroupId = req.params.id;
		const userId = res.locals.user.id;

		const checkCatGroup = await CatGroup.get(catGroupId);
		const restaurantId = checkCatGroup.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const catGroup = await CatGroup.update(catGroupId, req.body);
			return res.status(200).json({ catGroup });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to update category group ${catGroupId}.`);
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a restaurant from the database.
 * Returns JSON: {deleted: id}
 * Authorization: ensure logged in.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const catGroupId = req.params.id;
		const userId = res.locals.user.id;

		const checkCatGroup = await CatGroup.get(catGroupId);
		const restaurantId = checkCatGroup.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await CatGroup.remove(catGroupId);
			return res.status(200).json({ deleted: catGroupId });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to delete category group ${catGroupId}.`);
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
