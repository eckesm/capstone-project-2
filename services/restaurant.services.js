const Restaurant = require('../models/restaurant');
const Category = require('../models/category');
const CatGroup = require('../models/catGroup');
const MealPeriod = require('../models/mealPeriod');
const MealPeriod_Category = require('../models/mealPeriod_category');
const DefaultSale = require('../models/defaultSale');
const Invoice = require('../models/invoice');

exports.getRestaurant = async function(id) {
	try {
		var restaurant = await Restaurant.get(id);
		restaurant.mealPeriods = await MealPeriod.getAllForRestaurant(id);
		restaurant.categories = await Category.getAllForRestaurant(id);
		restaurant.catGroups = await CatGroup.getAllForRestaurant(id);
		restaurant.mealPeriod_categories = await MealPeriod_Category.getAllForRestaurant(id);
		restaurant.invoices = await Invoice.getAllForRestaurant(id);
		restaurant.defaultSales = await DefaultSale.getAllForRestaurant(id);
		return restaurant;
	} catch (err) {
		// Log Errors
		// throw Error(`Error retrieving restaurant ${id}`);
	}
};
