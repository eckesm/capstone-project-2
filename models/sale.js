'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { checkRestaurantExists, checkMealPeriodCatExists, checkSaleExists } = require('../helpers/checkExist');

class Sale {
	/** REGISTER
     * Adds a sale record to the database.
     * 
     * Accepts: {restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes}
     * Returns: {id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, note}
     * 
     * Throws BadRequestError if name is a duplicate.
     */
	static async register({ restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes }) {
		await checkRestaurantExists(restaurantId);
		await checkMealPeriodCatExists(mealPeriodCatId);

		const duplicateCheck = await db.query(
			`SELECT restaurant_id, meal_period_category_id, date
            FROM sales
            WHERE restaurant_id = $1 AND meal_period_category_id = $2 AND date = $3`,
			[ restaurantId, mealPeriodCatId, date ]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(
				`A sales record for meal period category ${mealPeriodCatId} already exists for restaurant ${restaurantId} on ${date}.`
			);

		const result = await db.query(
			`INSERT INTO sales (restaurant_id, meal_period_category_id, date, expected_sales, actual_sales, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, restaurant_id AS "restaurantId", meal_period_category_id AS "mealPeriodCatId", date, expected_sales AS "expectedSales", actual_sales AS "actualSales", notes`,
			[ restaurantId, mealPeriodCatId, date, expectedSales, actualSales, notes ]
		);
		return result.rows[0];
	}

	/** GET 
	 * Get a single sale record by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, note}
	 * 
	 * Throws NotFoundError if sale record does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", meal_period_category_id AS "mealPeriodCatId", date, expected_sales AS "expectedSales", actual_sales AS "actualSales", notes
			FROM sales
			WHERE id = $1`,
			[ id ]
		);
		const sale = result.rows[0];
		if (!sale) throw new NotFoundError(`There is no sale record with the id ${id}.`);
		return sale;
	}

	/** GET FOR RESTAURANT & DATE 
	 * Get all records for a restaurant on a date.
	 * 
	 * Accepts: restaurantId, date
	 * Returns: {id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, note}
	 * 
	 * Throws NotFoundError if sale record does not exist.
	 */
	static async restaurantDate(restaurantId, date) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", meal_period_category_id AS "mealPeriodCatId", date, expected_sales AS "expectedSales", actual_sales AS "actualSales", notes
			FROM sales
			WHERE restaurant_id = $1 AND date = $2`,
			[ restaurantId, date ]
		);
		return result.rows;
	}

	/** LOOKUP 
	 * Lookup a single sale record.
	 * 
	 * Accepts: restaurantId, mealPeriodCatId, date
	 * Returns: {id, restaurantId, mealPeriodCatId, date, expectedSales, actualSales, note}
	 * 
	 * Throws NotFoundError if sale record does not exist.
	 */
	// static async lookup(restaurantId, mealPeriodCatId, date) {
	// 	const result = await db.query(
	// 		`SELECT id, restaurant_id AS "restaurantId", meal_period_category_id AS "mealPeriodCatId", date, expected_sales AS "expectedSales", actual_sales AS "actualSales", notes
	// 		FROM sales
	// 		WHERE restaurant_id = $1 AND meal_period_category_id = $2 AND date = $3`,
	// 		[ restaurantId, mealPeriodCatId, date ]
	// 	);
	// 	const sale = result.rows[0];
	// 	if (!sale) throw new NotFoundError(`There is no matching sale record.`);
	// 	return sale;
	// }

	/** UPDATE
	 * Updates expected sales, actual sales, and notes for a sale record.
	 * 
	 * Accepts: id, {name, catGroupId, cogsPercent, notes}
	 * Returns: {id, restaurantId, name, catGroupId, cogsPercent, notes}
	 */
	static async update(id, { expectedSales, actualSales, notes }) {
		await checkSaleExists(id);

		const result = await db.query(
			`UPDATE sales
			SET expected_sales = $1, actual_sales = $2, notes = $3
			WHERE id = $4
			RETURNING id, restaurant_id AS "restaurantId", meal_period_category_id AS "mealPeriodCatId", date, expected_sales AS "expectedSales", actual_sales AS "actualSales", notes`,
			[ expectedSales, actualSales, notes, id ]
		);
		return result.rows[0];
	}

	/** REMOVE
	 * Deletes a sale record from the database.
	 * 
	 * Accepts: id
	 * Returns: (nothing)
	 * 
	 * Throws NotFoundError if sale record does not exist.
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM sales
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const sales = result.rows[0];
		if (!sales) throw new NotFoundError(`There is no sales record with id ${id}.`);
	}
}

module.exports = Sale;
