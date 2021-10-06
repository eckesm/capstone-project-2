'use strict';

const db = require('../db');
const { NotFoundError, BadRequestError, UnauthrorizedError } = require('../expressError');

class Restaurant_User {
	/** REGISTER ASSOCIATION
	 * Adds restaurant and user association to the database.
     * 
     * Accepts: {restaurantId, userId, isAdmin}
     * Returns: {id, restaurantId, userId, isAdmin}
     */
	static async register(restaurantId, userId, isAdmin) {
		const restRes = await db.query(
			`SELECT id
			FROM restaurants
			WHERE id = $1`,
			[ restaurantId ]
		);
		if (!restRes.rows[0]) throw new NotFoundError(`There is no restaurant with ID ${restaurantId}.`);

		const userRes = await db.query(
			`SELECT id
			FROM users
			WHERE id = $1`,
			[ userId ]
		);
		if (!userRes.rows[0]) throw new NotFoundError(`There is no user with ID ${userId}.`);

		// ISSUE
		const duplicateCheck = await db.query(
			`SELECT restaurant_id, user_id, is_admin
		    FROM restaurants_users
		    WHERE restaurant_id = $1, user_id = $2`,
			[ restaurantId, userId ]
		);
		if (duplicateCheck.rows[0])
			throw new BadRequestError(`User ${userId} is already associated with restaurant ${restaurantId}.`);
		// -------------------------

		const result = await db.query(
			`INSERT INTO restaurants_users (restaurant_id, user_id, is_admin)
			VALUES ($1, $2, $3)
			RETURNING restaurant_id AS "restaurantId", user_id AS "userId", is_admin AS "isAdmin"`,
			[ restaurantId, userId, isAdmin ]
		);

		const restUser = result.rows[0];
		return restUser;
	}

	// ISSUE
	/** CHECK IF ADMIN
		 * Checks if a given user is an admin of a given restaurant.
		 * 
		 * Accepts: restaurantId, userId
		 * Returns: true / false
		 */
	// ISSUE
	static async checkUserIsRestAdmin(restaurantId, userId) {
		console.log(restaurantId, userId);
		const result = await db.query(
			`SELECT restaurant_id, user_id, is_admin
				FROM restaurants_users
				WHERE restaurant_id = $1, user_id = $2`,
			[ restaurantId, userId ]
		);
		const restUser = result.rows[0];
		console.log(restUser);
		if (restUser && restUser.is_admin === true) return true;
		return false;
	}
	// -------------------------
}

module.exports = Restaurant_User;
