'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkUserIsRestAccess, checkUserIsRestAdmin } = require('../helpers/checkAccess');

const Category = require('../models/category');
const CatGroup = require('../models/catGroup');
const Restaurant = require('../models/restaurant');

const categoryNewSchema = require('../schemas/categoryNew.json');
const categoryUpdateSchema = require('../schemas/categoryUpdate.json');

/** POST /
 * Adds a category to the database.
 * 
 * Accepts JSON: {restaurantId, name, catGroupId, cogsPercent, notes}
 * Returns JSON: {category: {id, restaurantId, name, catGroupId, cogsPercent, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, categoryNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { restaurantId } = req.body;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const category = await Category.register(req.body);
			return res.status(201).json({ category });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets category informaion for a single category.
 
 * Returns JSON: {category: {id, restaurantId, name, catGroupId, cogsPercent, notes}}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const categoryId = req.params.id;
		const userId = res.locals.user.id;

		const category = await Category.get(categoryId);
		const restaurantId = category.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const restaurant = await Restaurant.get(restaurantId);
			category.restaurantName = restaurant.name;

			if (category.catGroupId !== null) {
				const catGroup = await CatGroup.get(category.catGroupId);
				category.catGroupName = catGroup.name;
			}

			return res.status(200).json({ category });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET ALL /catgroups/[catGroupId]
 * Gets all categories for a group.
 
 * Returns JSON: {categories: [{id, restaurantId, name, catGroupId, cogsPercent, notes},...]}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/catgroups/:catGroupId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { catGroupId } = req.params;

		const catGroup = await CatGroup.get(catGroupId);
		const categories = await Category.getAllForGroup(catGroupId);
		const restaurantId = catGroup.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			return res.status(200).json({ categories });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET ALL /catgroups/[catGroupId]
 * Gets all categories for a restaurant.
 
 * Returns JSON: {categories: [{id, restaurantId, name, catGroupId, cogsPercent, notes},...]}

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
			const categories = await Category.getAllForRestaurant(restaurantId);
			return res.status(200).json({ categories });
		}
	} catch (error) {
		return next(error);
	}
});

/** PATCH /[categoryId]/catgroup/[catGroupId]
 * Changes category group only for a single category.
 * 
 * Returns JSON: {category: {id, name, catGroupId, cogsPercent, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.patch('/:categoryId/group/:catGroupId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		let { categoryId, catGroupId } = req.params;

		const existingCategory = await Category.get(categoryId);
		const restaurantId = existingCategory.restaurantId;

		if (catGroupId === '0') {
			catGroupId = null;
		}

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const category = await Category.changeCatGroup(categoryId, catGroupId);
			return res.status(200).json({ category });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a category.
 * 
 * Accepts JSON: {name, cogsPercent, notes}
 * Returns JSON: {category: {id, name, catGroupId, cogsPercent, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	console.log(req.body)
	try {
		const validator = jsonschema.validate(req.body, categoryUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const categoryId = req.params.id;
		const userId = res.locals.user.id;
		let { catGroupId } = req.body;

		const existingCategory = await Category.get(categoryId);
		const restaurantId = existingCategory.restaurantId;

		if (catGroupId === '0' || catGroupId === undefined) {
			catGroupId = null;
		}

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const category = await Category.update(categoryId, req.body);
			return res.status(200).json({ category });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a category from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const categoryId = req.params.id;

		const checkCategory = await Category.get(categoryId);
		const restaurantId = checkCategory.restaurantId;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await Category.remove(categoryId);
			return res.status(200).json({ deleted: categoryId });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
