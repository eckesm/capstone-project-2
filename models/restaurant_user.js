'use strict';

const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');
const { checkRestaurantExists, checkUserExists } = require('../helpers/checkExist');

class Restaurant_User {
	/** REGISTER ASSOCIATION
	 * Adds restaurant and user association to the database.
     * 
     * Accepts: {restaurantId, userId, isAdmin}
     * Returns: {id, restaurantId, userId, isAdmin}
	 * 
	 * Throws NotFoundError if restaurant or user does not exist.
	 * Throws BadRequestError if association already exists.
     */
	static async register(restaurantId, userId, isAdmin) {
		await checkUserExists(userId);
		await checkRestaurantExists(restaurantId);

		const duplicateCheck = await db.query(
			`SELECT id, restaurant_id, user_id, is_admin
		    FROM restaurants_users
		    WHERE restaurant_id = $1 AND user_id = $2`,
			[ restaurantId, userId ]
		);
		if (duplicateCheck.rows[0])
			throw new BadRequestError(`User ${userId} is already associated with restaurant ${restaurantId}.`);

		const result = await db.query(
			`INSERT INTO restaurants_users (restaurant_id, user_id, is_admin)
			VALUES ($1, $2, $3)
			RETURNING restaurant_id AS "restaurantId", user_id AS "userId", is_admin AS "isAdmin"`,
			[ restaurantId, userId, isAdmin ]
		);

		const restUser = result.rows[0];
		return restUser;
	}

	/** LOOKUP ASSOCIATION
	 * Returns info for a single meal period and category association.
	 * 
	 * Accepts: restaurantId, userId
	 * Returns: {restaurantId, userId, isAdmin}
	 */
	static async lookup(restaurantId, userId) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", user_id AS "userId", is_admin AS "isAdmin"
			FROM restaurants_users
			WHERE restaurant_id = $1 AND user_id = $2`,
			[ restaurantId, userId ]
		);
		return result.rows[0];
	}

	/** GET ALL USER FOR RESTAURANT
	 * Returns array of all users and admins associated with a restaurant.
	 * 
	 * Accepts: restaurantId
	 * Returns: [{restaurantId, userId, isAdmin},...]
	 */
	static async getAllRestaurantUsers(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", user_id AS "userId", is_admin AS "isAdmin"
			FROM restaurants_users
			WHERE restaurant_id = $1`,
			[ id ]
		);
		return result.rows;
	}

	/** GET ALL RESTAURANTS FOR USER
	 * Returns array of all restaurants associated with a user.
	 * 
	 * Accepts: userId
	 * Returns: [{restaurantId, userId, isAdmin},...]
	 */
	static async getAllUserRestaurants(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", user_id AS "userId", is_admin AS "isAdmin"
				FROM restaurants_users
				WHERE user_id = $1`,
			[ id ]
		);
		return result.rows;
	}

	/** UPDATE ASSOCIATION
	 * Updates user/admin association between a user and a restaurant.
	 * 
	 * Accepts: restaurantId, userId, isAdmin
	 * Returns: { restaurantId, userId, isAdmin}
	 */
	static async update(restaurantId, userId, isAdmin) {
		const result = await db.query(
			`UPDATE restaurants_users
			SET is_admin = $1
			WHERE restaurant_id = $2 AND user_id = $3
			RETURNING restaurant_id AS "restaurantId", user_id AS "userId", is_admin AS "isAdmin"`,
			[ isAdmin, restaurantId, userId ]
		);
		return result.rows[0];
	}

	/** REMOVE
	 * Deletes a restaurant and user association from the database.
     * 
	 * Accepts: restaurantId, userId
     * Returns: (nothing)
     * 
	 * Throws NotFoundError if association does not exist.
     */
	static async remove(restaurantId, userId) {
		const result = await db.query(
			`DELETE FROM restaurants_users
				WHERE restaurant_id = $1 AND user_id = $2
				RETURNING restaurant_id, user_id`,
			[ restaurantId, userId ]
		);
		const restUser = result.rows[0];
		if (!restUser)
			throw new NotFoundError(`There is no association between user ${userId} and restaurant ${restaurantId}.`);
	}
}

module.exports = Restaurant_User;
