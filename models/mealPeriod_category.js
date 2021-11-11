'use strict';

const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');
const Category = require('./category');
const MealPeriod = require('./mealPeriod');
const { checkRestaurantExists } = require('../helpers/checkExist');
const { checkCategoryMealPeriod } = require('../helpers/checkSameRestaurant');

class MealPeriod_Category {
	/** REGISTER ASSOCIATION
	 * Adds meal period and category association to the database.
     * 
     * Accepts: restaurantId, categoryId, mealPeriodId, {salesPercentOfPeriod, notes}
     * Returns: {id, restaurantId, categoryId, mealPeriodId, salesPercentOfPeriod, notes}
	 * 
	 * Throws BadRequestError if association is not possible or if duplicate.
     */
	static async register(restaurantId, mealPeriodId, categoryId, { salesPercentOfPeriod, notes='' }) {
		await checkRestaurantExists(restaurantId);
		await checkCategoryMealPeriod(categoryId, mealPeriodId);

		const duplicateCheck = await db.query(
			`SELECT restaurant_id, meal_period_id, category_id
		    FROM meal_periods_categories
		    WHERE restaurant_id = $1 AND meal_period_id = $2 AND category_id = $3`,
			[ restaurantId, mealPeriodId, categoryId ]
		);
		if (duplicateCheck.rows[0])
			throw new BadRequestError(
				`Meal period ${mealPeriodId} and category ${categoryId} associatiion already exists.`
			);

		const result = await db.query(
			`INSERT INTO meal_periods_categories (restaurant_id, meal_period_id, category_id, sales_percent_of_period, notes)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", category_id AS "categoryId", sales_percent_of_period AS "salesPercentOfPeriod", notes`,
			[ restaurantId, mealPeriodId, categoryId, salesPercentOfPeriod, notes ]
		);

		return result.rows[0];
	}

	/** LOOKUP ASSOCIATION
	 * Returns info for a single meal period and category association.
	 * 
	 * Accepts: mealPeriodId, categoryId
	 * Returns: {id, restaurantId, mealPeriodId, categoryId, salesPercentOfPeriod, notes}
	 * 
	 * Throws NotFoundError if association does not exist.
	 */
	static async lookup(mealPeriodId, categoryId) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", category_id AS "categoryId", sales_percent_of_period AS "salesPercentOfPeriod", notes
			FROM meal_periods_categories
			WHERE meal_period_id = $1 AND category_id = $2`,
			[ mealPeriodId, categoryId ]
		);
		const mealPeriodCat = result.rows[0];
		if (!mealPeriodCat)
			throw new NotFoundError(`Meal period ${mealPeriodId} is not associated with category ${categoryId}.`);
		return mealPeriodCat;
	}

	/** GET ALL ASSOCIATIONS FOR RESTAURANT
	 * Returns array of all meal period and category associations for a restaurant.
	 * 
	 * Accepts: restaurantId
	 * Returns: [{id, restaurantId, mealPeriodId, categoryId, salesPercentOfPeriod, notes},...]
	 */
	static async getAllForRestaurant(restaurantId) {
		await checkRestaurantExists(restaurantId);

		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", category_id AS "categoryId", sales_percent_of_period AS "salesPercentOfPeriod", notes
			FROM meal_periods_categories
			WHERE restaurant_id = $1`,
			[ restaurantId ]
		);
		return result.rows;
	}

	/** UPDATE ASSOCIATION
	 * Updates information for an association between a meal period and a category.
	 * 
	 * Accepts: restaurantId, categoryId, mealPeriodId, {salesPercentOfPeriod, notes}
     * Returns: {id, restaurantId, categoryId, mealPeriodId, salesPercentOfPeriod, notes}
	 */
	static async update(categoryId, mealPeriodId, { salesPercentOfPeriod, notes }) {
		await checkCategoryMealPeriod(categoryId, mealPeriodId);

		const result = await db.query(
			`UPDATE meal_periods_categories
			SET sales_percent_of_period = $1, notes = $2
			WHERE category_id = $3 AND meal_period_id = $4
			RETURNING id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", category_id AS "categoryId", sales_percent_of_period AS "salesPercentOfPeriod", notes`,
			[ salesPercentOfPeriod, notes, categoryId, mealPeriodId ]
		);
		return result.rows[0];
	}

	/** REMOVE
	 * Deletes a meal period and category association from the database.
     * 
	 * Accepts: categoryId, mealPeriodId
     * Returns: (nothing)
     * 
	 * Throws NotFoundError if association does not exist.
     */
	static async remove(categoryId, mealPeriodId) {
		const result = await db.query(
			`DELETE FROM meal_periods_categories
				WHERE category_id = $1 AND meal_period_id = $2
				RETURNING category_id, meal_period_id`,
			[ categoryId, mealPeriodId ]
		);
		const restUser = result.rows[0];
		if (!restUser)
			throw new NotFoundError(
				`There is no association between meal period ${mealPeriodId} and category ${categoryId}.`
			);
	}
}

module.exports = MealPeriod_Category;
