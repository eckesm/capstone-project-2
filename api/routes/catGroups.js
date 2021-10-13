'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError, UnauthrorizedError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');

const Category = require('../models/category');
const CatGroup = require('../models/catGroup');
const Restaurant = require('../models/restaurant');
const Restaurant_User = require('../models/restaurant_user');

const catGroupNewSchema = require('../schemas/catGroupNew.json');
const catGroupUpdateSchema = require('../schemas/catGroupUpdate.json');

/** POST /
 * Adds a category group to the database.
 * 
 * Accepts JSON: {restaurantId, name, notes}
 * Returns JSON: {catGroup: {id, restaurantId, name, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
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
 * 
 * Returns JSON: {catGroup: {id, restaurantId, name, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
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
			const restaurant = await Restaurant.get(restaurantId);
			catGroup.restaurantName = restaurant.name;

			catGroup.categories = await Category.getAllForGroup(catGroupId);

			return res.status(200).json({ catGroup });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to access category group ${catGroupId}.`);
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a category group.
 * 
 * Accepts JSON: {restaurantId, name, notes}
 * Returns JSON: {catGroup: {id, restaurantId, name, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
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
 * Deletes a category group from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
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
