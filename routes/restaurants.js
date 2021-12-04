'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError, UnauthrorizedError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkUserIsRestAccess, checkUserIsRestAdmin } = require('../helpers/checkAccess');

const Restaurant = require('../models/restaurant');
const Restaurant_User = require('../models/restaurant_user');
const Category = require('../models/category');
const CatGroup = require('../models/catGroup');
const MealPeriod = require('../models/mealPeriod');
const MealPeriod_Category = require('../models/mealPeriod_category');
const DefaultSale = require('../models/defaultSale');
const Invoice = require('../models/invoice');
const Expense = require('../models/expense');

const restaurantNewSchema = require('../schemas/restaurantNew.json');
const restaurantUpdateSchema = require('../schemas/restaurantUpdate.json');

/** POST /
 * Adds a restaurant to the database.
 * 
 * Accepts JSON: {name, address, phone, email, website, notes}
 * Returns JSON: {restaurant: {id, name, address, phone, email, website, notes}}
 * 
 * Authorization: ensure logged in.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, restaurantNewSchema);
		if (!validator.valid) {
			const errors = validator.errors.map(e => e.stack);
			return res.status(200).json({ errors });
		}

		const ownerId = res.locals.user.id;
		const restaurant = await Restaurant.register(ownerId, req.body);

		// Add default restaurant settings to newly created restaurant.
		await starterRestaurantSettings(restaurant.id);

		return res.status(201).json({ restaurant });
	} catch (error) {
		return next(error);
	}
});

async function starterRestaurantSettings(restaurantId) {
	// create initial meal periods
	const MealPeriodBrunch = await MealPeriod.register({
		restaurantId,
		name         : 'Brunch',
		notes        : 'Only on the weekend; replaced by Lunch during the week.'
	});
	const MealPeriodLunch = await MealPeriod.register({
		restaurantId,
		name         : 'Lunch',
		notes        : 'Only on weekdays; replaced by Brunch on the weeekend.'
	});
	const MealPeriodDinner = await MealPeriod.register({
		restaurantId,
		name         : 'Dinner'
	});

	// create initial category groups
	const CatGroupFood = await CatGroup.register({
		restaurantId,
		name         : 'Food & Non-Alcoholic Beverages'
	});
	const CatGroupAlcohol = await CatGroup.register({
		restaurantId,
		name         : 'Alcoholic Beverages'
	});
	const CatGroupRetail = await CatGroup.register({
		restaurantId,
		name         : 'Retail'
	});

	// create initial categories
	const CategoryFood = await Category.register({
		restaurantId,
		name         : 'Food',
		catGroupId   : CatGroupFood.id,
		cogsPercent  : '0.35'
	});
	const CategoryNABev = await Category.register({
		restaurantId,
		name         : 'Non-Alcoholic Beverages',
		catGroupId   : CatGroupFood.id,
		cogsPercent  : '0.1'
	});
	const CategoryBeer = await Category.register({
		restaurantId,
		name         : 'Beer',
		catGroupId   : CatGroupAlcohol.id,
		cogsPercent  : '0.15'
	});
	const CategoryLiquor = await Category.register({
		restaurantId,
		name         : 'Liquor',
		catGroupId   : CatGroupAlcohol.id,
		cogsPercent  : '0.2'
	});
	const CategoryWine = await Category.register({
		restaurantId,
		name         : 'Wine',
		catGroupId   : CatGroupAlcohol.id,
		cogsPercent  : '0.3'
	});
	// const CategoryClothing = await Category.register({
	// 	restaurantId,
	// 	name         : 'Clothing',
	// 	catGroupId   : CatGroupRetail.id,
	// 	cogsPercent  : '0.35'
	// });
	// const CategoryCookbooks = await Category.register({
	// 	restaurantId,
	// 	name         : 'Cookbooks',
	// 	catGroupId   : CatGroupRetail.id,
	// 	cogsPercent  : '0.4'
	// });
	const CategoryOther = await Category.register({
		restaurantId,
		name         : 'Retail',
		catGroupId   : CatGroupRetail.id,
		cogsPercent  : '0.25'
	});

	// create initial default sales
	const DefaultSalesWednesdayDinner = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodDinner.id,
		dayId        : '3',
		total        : '6000'
	});
	const DefaultSalesThursdayDinner = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodDinner.id,
		dayId        : '4',
		total        : '8000'
	});
	const DefaultSalesFridayLunch = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodLunch.id,
		dayId        : '5',
		total        : '5000'
	});
	const DefaultSalesFridayDinner = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodDinner.id,
		dayId        : '5',
		total        : '10000'
	});
	const DefaultSalesSaturdayBrunch = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodBrunch.id,
		dayId        : '6',
		total        : '8000'
	});
	const DefaultSalesSaturdayDinner = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodDinner.id,
		dayId        : '6',
		total        : '10000'
	});
	const DefaultSalesSundayBrunch = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodBrunch.id,
		dayId        : '7',
		total        : '6000'
	});
	const DefaultSalesSundayDinner = await DefaultSale.register({
		restaurantId,
		mealPeriodId : MealPeriodDinner.id,
		dayId        : '7',
		total        : '4000'
	});

	// create initial default sales percentages
	const MealPeriodCatBrunchBeer = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodBrunch.id,
		CategoryBeer.id,
		{
			salesPercentOfPeriod : '0.15'
		}
	);
	const MealPeriodCatBrunchFood = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodBrunch.id,
		CategoryFood.id,
		{
			salesPercentOfPeriod : '0.5'
		}
	);
	const MealPeriodCatBrunchLiquor = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodBrunch.id,
		CategoryLiquor.id,
		{
			salesPercentOfPeriod : '0.15'
		}
	);
	const MealPeriodCatBrunchNABev = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodBrunch.id,
		CategoryNABev.id,
		{
			salesPercentOfPeriod : '0.05'
		}
	);
	const MealPeriodCatBrunchWine = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodBrunch.id,
		CategoryWine.id,
		{
			salesPercentOfPeriod : '0.15'
		}
	);
	const MealPeriodCatDinnerBeer = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodDinner.id,
		CategoryBeer.id,
		{
			salesPercentOfPeriod : '0.1'
		}
	);
	const MealPeriodCatDinnerFood = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodDinner.id,
		CategoryFood.id,
		{
			salesPercentOfPeriod : '0.5'
		}
	);
	const MealPeriodCatDinnerLiquor = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodDinner.id,
		CategoryLiquor.id,
		{
			salesPercentOfPeriod : '0.1'
		}
	);
	const MealPeriodCatDinnerNABev = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodDinner.id,
		CategoryNABev.id,
		{
			salesPercentOfPeriod : '0.05'
		}
	);
	const MealPeriodCatDinnerWine = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodDinner.id,
		CategoryWine.id,
		{
			salesPercentOfPeriod : '0.25'
		}
	);
	const MealPeriodCatLunchBeer = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodLunch.id,
		CategoryBeer.id,
		{
			salesPercentOfPeriod : '0.1'
		}
	);
	const MealPeriodCatLunchFood = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodLunch.id,
		CategoryFood.id,
		{
			salesPercentOfPeriod : '0.65'
		}
	);
	const MealPeriodCatLunchLiquor = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodLunch.id,
		CategoryLiquor.id,
		{
			salesPercentOfPeriod : '0.05'
		}
	);
	const MealPeriodCatLunchNABev = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodLunch.id,
		CategoryNABev.id,
		{
			salesPercentOfPeriod : '0.1'
		}
	);
	const MealPeriodCatLunchWine = await MealPeriod_Category.register(
		restaurantId,
		MealPeriodLunch.id,
		CategoryWine.id,
		{
			salesPercentOfPeriod : '0.1'
		}
	);
}

/** GET /[id]
 * Gets restaurant informaion for a single restaurant.
 * 
 * Returns JSON: {restaurant: {id, ownerId, name, address, phone, email, website, notes, categories, catGroups, mealPeriods, mealPeriod_categories, invoices}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const restaurantId = req.params.id;

		// Check that user has access to restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);

		if (checkAccess.status) {
			const restaurant = await Restaurant.get(restaurantId);
			restaurant.mealPeriods = await MealPeriod.getAllForRestaurant(restaurantId);
			restaurant.categories = await Category.getAllForRestaurant(restaurantId);
			restaurant.catGroups = await CatGroup.getAllForRestaurant(restaurantId);
			restaurant.mealPeriod_categories = await MealPeriod_Category.getAllForRestaurant(restaurantId);
			restaurant.invoices = await Invoice.getAllForRestaurant(restaurantId);
			restaurant.expenses = await Expense.getAllForRestaurant(restaurantId);
			restaurant.defaultSales = await DefaultSale.getAllForRestaurant(restaurantId);

			const access = await Restaurant_User.lookup(restaurantId, userId);
			restaurant.isAdmin = access.isAdmin;

			if (restaurant.ownerId === userId) {
				restaurant.isOwner = true;
			}
			else {
				restaurant.isOwner = false;
			}

			return res.status(200).json({ restaurant });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a restaurant.
 * 
 * Accepts JSON: {name, address, phone, email, website, notes}
 * Returns JSON: {restaurant: {id, ownerId, name, address, phone, email, website, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, restaurantUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const restaurantId = req.params.id;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const restaurant = await Restaurant.update(restaurantId, req.body);
			return res.status(200).json({ restaurant });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a restaurant from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const restaurantId = req.params.id;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			await Restaurant.remove(restaurantId);
			return res.status(200).json({ deleted: restaurantId });
		}
	} catch (error) {
		return next(error);
	}
});

/** POST /[restaurantid]/users/[newUserId]
 * Adds a restaurant and user association to the database.
 * 
 * Returns JSON: {added: {restaurantId, userId, isAdmin}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.post('/:restaurantId/users/:newUserId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const isAdmin = req.body.isAdmin || false;
		const { restaurantId, newUserId } = req.params;

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const newRestUser = await Restaurant_User.register(restaurantId, newUserId, isAdmin);
			return res.status(201).json({ added: newRestUser });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[restaurantid]/users/[updateUserId]
 * Updates a restaurant and user association in the database.
 * 
 * Returns JSON: {restUser: {restaurantId, userId, isAdmin}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.put('/:restaurantId/users/:updateUserId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const isAdmin = req.body.isAdmin || false;
		const { restaurantId, updateUserId } = req.params;

		// Check that the user to update is not owner
		const restaurant = await Restaurant.get(restaurantId);
		if (restaurant.ownerId == updateUserId) {
			throw new UnauthrorizedError(`Cannot update the owner's restaurant association.`);
		}

		// Check that user is admin for restaurant
		const checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		if (checkAdmin) {
			const restUser = await Restaurant_User.update(restaurantId, updateUserId, isAdmin);
			return res.status(201).json({ restUser: restUser });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[restaurantid]/users/[deleteUserId]
 * Deletes a restaurant and user association from the database.
 * 
 * Returns JSON: {deleted: {restaurantId, userId, isAdmin}}
 * 
 * Authorization: ensure logged in.
 * Access: only restaurant admins.
 */
router.delete('/:restaurantId/users/:deleteUserId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { restaurantId, deleteUserId } = req.params;

		// Check that user to delete is not owner
		const restaurant = await Restaurant.get(restaurantId);
		if (restaurant.ownerId == deleteUserId) {
			throw new UnauthrorizedError(`Cannot delete the owner's restaurant association.`);
		}

		let checkAdmin = false;
		// Allow delete if user is removing self regardless of if user is an admin
		if (userId == deleteUserId) {
			checkAdmin = true;
		}
		else {
			// Check that user is admin for restaurant
			checkAdmin = await checkUserIsRestAdmin(restaurantId, userId);
		}

		if (checkAdmin) {
			await Restaurant_User.remove(restaurantId, deleteUserId);
			return res.status(200).json({ deleted: { restaurantId, userId: deleteUserId } });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
