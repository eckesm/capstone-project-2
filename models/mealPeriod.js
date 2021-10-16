'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { checkRestaurantExists, checkMealPeriodExists } = require('../helpers/checkExist');

class MealPeriod {
	/** REGISTER
     * Adds a meal period to the database.
     * 
     * Accepts: {restaurantId, name, notes}
     * Returns: {id, restaurantId, name, notes}
     * 
     * Throws BadRequestError if name is a duplicate.
     */
	static async register({ restaurantId, name, notes }) {
		await checkRestaurantExists(restaurantId);

		const duplicateCheck = await db.query(
			`SELECT name
            FROM meal_periods
            WHERE restaurant_id = $1 AND name = $2`,
			[ restaurantId, name ]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(`${name} is already a meal period for restaurant ${restaurantId}.`);

		const result = await db.query(
			`INSERT INTO meal_periods (restaurant_id, name, notes)
            VALUES ($1, $2, $3)
            RETURNING id, restaurant_id AS "restaurantId", name, notes`,
			[ restaurantId, name, notes ]
		);
		return result.rows[0];
	}

	/** GET 
	 * Get a single meal period by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, name, notes}
	 * 
	 * Throws NotFoundError if meal period does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, notes
			FROM meal_periods
			WHERE id = $1`,
			[ id ]
		);
		const mealPeriod = result.rows[0];
		if (!mealPeriod) throw new NotFoundError(`There is no meal period with the id ${id}.`);
		return mealPeriod;
	}

	/** GET ALL FOR RESTAURANT
	 * Returns array of all meal periods associated with a restaurant.
	 * 
	 * Accepts: restaurantId
	 * Returns: [{id, restaurantId, name, notes},...]
	 */
	static async getAllForRestaurant(restaurantId) {
		await checkRestaurantExists(restaurantId);

		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, notes
			FROM meal_periods
			WHERE restaurant_id = $1`,
			[ restaurantId ]
		);
		return result.rows;
	}

	/** UPDATE
	 * Replace meal period's name, notes.
	 * 
	 * Accepts: id, {name, notes}
	 * Returns: {id, restaurantId, name, notes}
	 */
	static async update(id, { name, notes }) {
		await checkMealPeriodExists(id);

		const result = await db.query(
			`UPDATE meal_periods
			SET name = $1, notes = $2
			WHERE id = $3
			RETURNING id, restaurant_id as "restaurantId", name, notes`,
			[ name, notes, id ]
		);
		return result.rows[0];
	}

	/** REMOVE
	 * Deletes a meal period from the database.
	 * 
	 * Accepts: id
	 * Returns: (nothing)
	 * 
	 * Throws NotFoundError if meal period does not exist.
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM meal_periods
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const mealPeriod = result.rows[0];
		if (!mealPeriod) throw new NotFoundError(`There is no meal period with the id ${id}.`);
	}
}

module.exports = MealPeriod;
