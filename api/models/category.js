'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

class Category {
	/** REGISTER
     * Adds a category to the database.
     * 
     * Accepts: {restaurantId, name, cogsPercent, notes}
     * Returns: {id, restaurantId, name, cogsPercent, notes}
     * 
     * Throws BadRequestError if name is a duplicate.
     */
	static async register({ restaurantId, name, catGroupId, cogsPercent, notes }) {
		const duplicateCheck = await db.query(
			`SELECT name
            FROM categories
            WHERE restaurant_id = $1 AND name = $2`,
			[ restaurantId, name ]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(`${name} is already a category name for restaurant ${restaurantId}.`);

		const result = await db.query(
			`INSERT INTO categories (restaurant_id, name, cat_group_id, cogs_percent, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, restaurant_id AS "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes`,
			[ restaurantId, name, catGroupId, cogsPercent, notes ]
		);
		return result.rows[0];
	}

	/** GET 
	 * Get a single category by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, name, catGroupId, cogsPercent, notes}
	 * 
	 * Throws NotFoundError if category does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes
			FROM categories
			WHERE id = $1`,
			[ id ]
		);
		const category = result.rows[0];
		if (!category) throw new NotFoundError(`There is no category with the id ${id}.`);
		return category;
	}

	/** GET ALL FOR GROUP
	 * Get all categories for a single group.
	 * 
	 * Accepts: catGroupId
	 * Returns: [{id, restaurantId, name, catGroupId, cogsPercent, notes},...]
	 */
	static async getAllForGroup(catGroupId) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes
			FROM categories
			WHERE cat_group_id = $1`,
			[ catGroupId ]
		);
		return result.rows;
	}

	/** GET ALL FOR RESTAURANT
	 * Returns array of all categories associated with a restaurant.
	 * 
	 * Accepts: restaurantId
	 * Returns: [{id, restaurantId, name, catGroupId, cogsPercent, notes},...]
	 */
	static async getAllRestaurantCategories(restaurantId) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes
			FROM categories
			WHERE restaurant_id = $1`,
			[ restaurantId ]
		);
		return result.rows;
	}

	/** UPDATE
	 * Replace category's name, category group ID, COGS percentage, notes.
	 * 
	 * Accepts: id, {name, catGroupId, cogsPercent, notes}
	 * Returns: {id, restaurantId, name, catGroupId, cogsPercent, notes}
	 */
	static async update(id, { name, catGroupId, cogsPercent, notes }) {
		const result = await db.query(
			`UPDATE categories
			SET name = $1, cat_group_id = $2, cogs_percent = $3, notes = $4
			WHERE id = $5
			RETURNING id, restaurant_id as "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes`,
			[ name, catGroupId, cogsPercent, notes, id ]
		);
		return result.rows[0];
	}

	/** CHANGE CATEGORY GROUP
	 * Replace category group ID only.
	 * 
	 * Accepts: id, catGroupId
	 * Returns: {id, restaurantId, name, catGroupId, cogsPercent, notes}
	 */
	static async changeCatGroup(id, catGroupId) {
		let result;
		if (catGroupId === null) {
			result = await db.query(
				`UPDATE categories
                SET cat_group_id = NULL
                WHERE id = $1
                RETURNING id, restaurant_id as "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes`,
				[ id ]
			);
		}
		else {
			result = await db.query(
				`UPDATE categories
                SET cat_group_id = $1
                WHERE id = $2
                RETURNING id, restaurant_id as "restaurantId", name, cat_group_id AS "catGroupId", cogs_percent AS "cogsPercent", notes`,
				[ catGroupId, id ]
			);
		}
		return result.rows[0];
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
