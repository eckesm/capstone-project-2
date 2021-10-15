'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

class DefaultSale {
	/** REGISTER
     * Adds a default sale to the database.
     * 
     * Accepts: {restaurantId, mealPeriodId, dayId, total, notes}
     * Returns: {id, restaurantId, mealPeriodId, dayId, total, notes}
     * 
     * Throws BadRequestError if name is a duplicate.
     */
	static async register({ restaurantId, mealPeriodId, dayId, total, notes }) {
		const duplicateCheck = await db.query(
			`SELECT restaurant_id, meal_period_id, day_id
            FROM default_sales
            WHERE restaurant_id = $1 AND meal_period_id = $2 AND day_id = $3`,
			[ restaurantId, mealPeriodId, dayId ]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(
				`A default sale entry for meal period ${mealPeriodId} already exists for restaurant ${restaurantId} on day ${dayId}.`
			);

		const result = await db.query(
			`INSERT INTO default_sales (restaurant_id, meal_period_id, day_id, total, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", day_id AS "dayId", total, notes`,
			[ restaurantId, mealPeriodId, dayId, total, notes ]
		);
		return result.rows[0];
	}

	/** GET 
	 * Get a single sale record by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, mealPeriodId, dayId, total, notes}
	 * 
	 * Throws NotFoundError if sale record does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", day_id AS "dayId", total, notes
			FROM default_sales
			WHERE id = $1`,
			[ id ]
		);
		const defaultSale = result.rows[0];
		if (!defaultSale) throw new NotFoundError(`There is no default sale entry with the id ${id}.`);
		return defaultSale;
	}

	/** LOOKUP 
	 * Lookup a single sale record.
	 * 
	 * Accepts: restaurantId, mealPeriodId, dayId
	 * Returns: {id, restaurantId, mealPeriodId, dayId, total, notes}
	 * 
	 * Throws NotFoundError if sale record does not exist.
	 */
	static async lookup(restaurantId, mealPeriodCatId, date) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", day_id AS "dayId", total, notes
			FROM default_sales
			WHERE restaurant_id = $1 AND meal_period_id = $2 AND day_id = $3`,
			[ restaurantId, mealPeriodCatId, date ]
		);
		const defaultSale = result.rows[0];
		if (!defaultSale) throw new NotFoundError(`There is no matching default sale entry.`);
		return defaultSale;
	}

	/** GET ALL FOR GROUP
	 * Get all categories for a single group.
	 * 
	 * Accepts: catGroupId
	 * Returns: [{id, restaurantId, name, catGroupId, cogsPercent, notes},...]
	 */
	// static async getAllForGroup(catGroupId) {
	// 	const result = await db.query(
	// 		`SELECT id, restaurant_id AS "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes
	// 		FROM categories
	// 		WHERE cat_group_id = $1`,
	// 		[ catGroupId ]
	// 	);
	// 	return result.rows;
	// }

	/** GET ALL FOR RESTAURANT
	 * Returns array of all categories associated with a restaurant.
	 * 
	 * Accepts: restaurantId
	 * Returns: [{id, restaurantId, name, catGroupId, cogsPercent, notes},...]
	 */
	// static async getAllForRestaurant(restaurantId) {
	// 	const result = await db.query(
	// 		`SELECT id, restaurant_id AS "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes
	// 		FROM categories
	// 		WHERE restaurant_id = $1`,
	// 		[ restaurantId ]
	// 	);
	// 	return result.rows;
	// }

	/** UPDATE
	 * Updates total and notes for a default sale entry.
	 * 
	 * Accepts: id, {total, notes}
	 * Returns: {id, restaurantId, mealPeriodId, dayId, total, notes}
	 */
	static async update(id, { total, notes }) {
		const result = await db.query(
			`UPDATE default_sales
			SET total = $1, notes = $2
			WHERE id = $3
			RETURNING id, restaurant_id AS "restaurantId", meal_period_id AS "mealPeriodId", day_id AS "dayId", total, notes`,
			[ total, notes, id ]
		);
		return result.rows[0];
	}

	/** REMOVE
	 * Deletes a default sale entry from the database.
	 * 
	 * Accepts: id
	 * Returns: (nothing)
	 * 
	 * Throws NotFoundError if default sale entry does not exist.
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM default_sales
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const defaultSale = result.rows[0];
		if (!defaultSale) throw new NotFoundError(`There is no default sale entry with the id ${id}.`);
	}
}

module.exports = DefaultSale;
