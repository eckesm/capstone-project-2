'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError, ExpressError, UnauthrorizedError } = require('../expressError');
const { createToken } = require('../helpers/tokens');
const { ensureLoggedIn } = require('../middleware/auth');

const Restaurant = require('../models/restaurant');
const Restaurant_User = require('../models/restaurant_user');
const User = require('../models/user');
const Category = require('../models/category');
const CatGroup = require('../models/catGroup');
const restaurantNewSchema = require('../schemas/restaurantNew.json');
const restaurantUpdateSchema = require('../schemas/restaurantUpdate.json');

/** POST /
 * Adds a restaurant to the database.
 * Accepts JSON: {name, address, phone, email, website, notes}
 * Returns JSON: {restaurant: {id, name, address, phone, email, website, notes}}
 * Authorization: ensure a user is logged in.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, restaurantNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const ownerId = res.locals.user.id;
		const restaurant = await Restaurant.register(ownerId, req.body);
		return res.status(201).json({ restaurant });
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets restaurant informaion for a single restaurant.
 * Returns JSON: {restaurant: {id, ownerId, name, address, phone, email, website, notes}}
 * Authorization: ensure logged in.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const restaurantId = req.params.id;
		const userId = res.locals.user.id;

		// Check that user is admin for restaurant
		const checkAccess = await Restaurant_User.checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const restaurant = await Restaurant.get(restaurantId);
			restaurant.categories = await Category.getAllRestaurantCategories(restaurantId);

			restaurant.catGroups = await CatGroup.getAllRestaurantGroups(restaurantId);

			return res.status(200).json({ restaurant });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to access restaurant ${restaurantId}.`);
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
		const validator = jsonschema.validate(req.body, restaurantUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const restaurantId = req.params.id;
		const userId = res.locals.user.id;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const restaurant = await Restaurant.update(restaurantId, req.body);
			return res.status(200).json({ restaurant });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to update restaurant ${restaurantId}.`);
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
		const restaurantId = req.params.id;
		const userId = res.locals.user.id;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await Restaurant.remove(restaurantId);
			return res.status(200).json({ deleted: restaurantId });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to delete restaurant ${restaurantId}.`);
	} catch (error) {
		return next(error);
	}
});

/** POST /[restaurantid]/users/[newUserId]
 * Adds a restaurant and user association to the database.
 * Returns JSON: {added user to restaurant: {restaurantId, userId, isAdmin}}
 * Authorization: ensure a user is logged in; only restaurant admins can add users to a restaurant.
 */
router.post('/:restaurantId/users/:newUserId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const isAdmin = req.body.isAdmin || false;
		const { restaurantId, newUserId } = req.params;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const newRestUser = await Restaurant_User.register(restaurantId, newUserId, isAdmin);
			return res.status(201).json({ 'added user to restaurant': newRestUser });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to add users to restaurant ${restaurantId}.`);
	} catch (error) {
		return next(error);
	}
});

/** PUT /[restaurantid]/users/[updateUserId]
 * Adds a restaurant and user association to the database.
 * Returns JSON: {added user to restaurant: {restaurantId, userId, isAdmin}}
 * Authorization: ensure a user is logged in; only restaurant admins can add users to a restaurant.
 */
router.put('/:restaurantId/users/:updateUserId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const isAdmin = req.body.isAdmin || false;
		const { restaurantId, updateUserId } = req.params;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const restUser = await Restaurant_User.update(restaurantId, updateUserId, isAdmin);
			return res.status(201).json({ restUser });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to add users to restaurant ${restaurantId}.`);
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[restaurantid]/users/[deleteUserId]
 * Deletes a restaurant and user association from the database.
 * Returns JSON: {deleted: {restaurantId, userId, isAdmin}}
 * Authorization: ensure a user is logged in; only restaurant admins can delete users from a restaurant.
 */
router.delete('/:restaurantId/users/:deleteUserId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { restaurantId, deleteUserId } = req.params;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const restUser = await Restaurant_User.remove(restaurantId, deleteUserId);
			return res.status(201).json({ deleted: { restaurantId, userId: deleteUserId } });
		}
		throw new UnauthrorizedError(
			`User ${userId} is not authorized to delete users from restaurant ${restaurantId}.`
		);
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
