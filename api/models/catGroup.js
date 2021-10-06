'use strict';

const db = require('../db');
const { BadRequestError } = require('../expressError');

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
}

module.exports = CatGroup;
