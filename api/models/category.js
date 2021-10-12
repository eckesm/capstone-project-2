'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

class Category {
	/** REGISTER
     * Adds category group to the database.
     * 
     * Accepts: {restaurantId, name, cogsPercent, notes}
     * Returns: {id, restaurantId, name, cogsPercent, notes}
     * 
     * Throws BadRequestError if name is a duplicate.
     */
	static async register({ restaurantId, name, cogsPercent, notes }) {
		const duplicateCheck = await db.query(
			`SELECT name
            FROM categories
            WHERE restaurant_id = $1 AND name = $2`,
			[ restaurantId, name ]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(`${name} is already a category name for restaurant ${restaurantId}.`);

		const result = await db.query(
			`INSERT INTO categories (restaurant_id, name, cogs_percent, notes)
            VALUES ($1, $2, $3)
            RETURNING id, restaurant_id AS "restaurantId", name, cogs_percent AS "cogsPercent", notes`,
			[ restaurantId, name, cogsPercent, notes ]
		);
		const category = result.rows[0];
		return category;
	}

	/** GET 
	 * Get a single category by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, name, cogsPercent, notes}
	 * 
	 * Throws NotFoundError if category does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, cogs_percent AS "cogsPercent", notes
			FROM categories
			WHERE id = $1`,
			[ id ]
		);
		const category = result.rows[0];
		if (!category) throw new NotFoundError(`There is no category with the id ${id}.`);
		return category;
	}

	/** UPDATE
	 * Replace category's name, notes.
	 * 
	 * Accepts: id, {name, cogsPercent, notes}
	 * Returns: {id, restaurantId, name, cogsPercent, notes}
	 */
	static async update(id, { name, cogsPercent, notes }) {
		const result = await db.query(
			`UPDATE categories
			SET name = $1, cogs_percent = $2, notes = $3
			WHERE id = $4
			RETURNING id, restaurant_id as "restaurantId", name, cogs_percent AS "cogsPercent", notes`,
			[ name, cogsPercent, notes, id ]
		);
		const category = result.rows[0];
		return category;
	}

	/** REMOVE
	 * Deletes a category from the database.
	 * 
	 * Accepts: id
	 * Returns: (nothing)
	 * 
	 * Throws NotFoundError if category does not exist.
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM categories
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const category = result.rows[0];
		if (!category) throw new NotFoundError(`There is no category with the id ${id}.`);
	}
}

module.exports = Category;
