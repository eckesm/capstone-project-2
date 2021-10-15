'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { checkRestaurantExists, checkCatGroupExists } = require('../helpers/checkExist');

class CatGroup {
	/** REGISTER
     * Adds category group to the database.
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
            FROM cat_groups
            WHERE restaurant_id = $1 AND name = $2`,
			[ restaurantId, name ]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(`${name} is already a category group name for restaurant ${restaurantId}.`);

		const result = await db.query(
			`INSERT INTO cat_groups (restaurant_id, name, notes)
            VALUES ($1, $2, $3)
            RETURNING id, restaurant_id AS "restaurantId", name, notes`,
			[ restaurantId, name, notes ]
		);
		const catGroup = result.rows[0];
		return catGroup;
	}

	/** GET 
	 * Get a single category group by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, name, notes}
	 * 
	 * Throws NotFoundError if category group does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, notes
			FROM cat_groups
			WHERE id = $1`,
			[ id ]
		);
		const catGroup = result.rows[0];
		if (!catGroup) throw new NotFoundError(`There is no category group with the id ${id}.`);
		return catGroup;
	}

	/** GET ALL FOR RESTAURANT
	 * Returns array of all groups associated with a restaurant.
	 * 
	 * Accepts: restaurantId
	 * Returns: [{id, restaurantId, name, notes},...]
	 */
	static async getAllRestaurantGroups(restaurantId) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, notes
				FROM cat_groups
				WHERE restaurant_id = $1`,
			[ restaurantId ]
		);
		return result.rows;
	}

	/** UPDATE
	 * Replace category group's name, notes.
	 * 
	 * Accepts: id, {name, notes}
	 * Returns: {id, restaurantId, name, notes}
	 */
	static async update(id, { name, notes }) {
		await checkCatGroupExists(id);

		const result = await db.query(
			`UPDATE cat_groups
			SET name = $1, notes = $2
			WHERE id = $3
			RETURNING id, restaurant_id as "restaurantId", name, notes`,
			[ name, notes, id ]
		);
		const catGroup = result.rows[0];
		return catGroup;
	}

	/** REMOVE
	 * Deletes a category group from the database.
	 * 
	 * Accepts: id
	 * Returns: (nothing)
	 * 
	 * Throws NotFoundError if category group does not exist.
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM cat_groups
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const catGroup = result.rows[0];
		if (!catGroup) throw new NotFoundError(`There is no category group with the id ${id}.`);
	}
}

module.exports = CatGroup;
