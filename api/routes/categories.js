'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError, ExpressError, UnauthrorizedError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');

const Category = require('../models/category');
const Restaurant_User = require('../models/restaurant_user');
const categoryNewSchema = require('../schemas/categoryNew.json');
const categoryUpdateSchema = require('../schemas/categoryUpdate.json');

/** POST /
 * Adds a category to the database.
 * Accepts JSON: {restaurantId, name, cogsPercent, notes}
 * Returns JSON: {category: {id, restaurantId, name, cogsPercent, notes}}
 * Authorization: ensure logged in.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, categoryNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const category = await Category.register(req.body);
		return res.status(201).json({ category });
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets category informaion for a single category.
 * Returns JSON: {category: {id, restaurantId, name, cogsPercent, notes}}
 * Authorization: ensure logged in.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const categoryId = req.params.id;
		const userId = res.locals.user.id;

		const category = await Category.get(categoryId);
		const restaurantId = category.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await Restaurant_User.checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			return res.status(200).json({ category });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to access category ${categoryId}.`);
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a category.
 * Accepts JSON: {name, cogsPercent, notes}
 * Returns JSON: {category: {id, name, cogsPercent, notes}}
 * Authorization: ensure logged in.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, categoryUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const categoryId = req.params.id;
		const userId = res.locals.user.id;

		const checkCategory = await Category.get(categoryId);
		const restaurantId = checkCategory.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const category = await Category.update(categoryId, req.body);
			return res.status(200).json({ category });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to update category ${categoryId}.`);
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a category from the database.
 * Returns JSON: {deleted: id}
 * Authorization: ensure logged in.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const categoryId = req.params.id;
		const userId = res.locals.user.id;

		const checkCategory = await Category.get(categoryId);
		const restaurantId = checkCategory.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await Restaurant_User.checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await Category.remove(categoryId);
			return res.status(200).json({ deleted: categoryId });
		}
		throw new UnauthrorizedError(`User ${userId} is not authorized to delete category ${categoryId}.`);
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
