'use strict';

const db = require('../db');
const { NotFoundError } = require('../expressError');
const Restaurant_User = require('./restaurant_user');

const { checkRestaurantExists, checkUserExists } = require('../helpers/checkExist');

class Restaurant {
	/** REGISTER
	 * Adds restaurant to the database.
     * 
     * Accepts: {ownerId, name, address, phone, email, website, notes}
     * Returns: {id, ownerId, name, address, phone, email, website, notes}
     */
	static async register(ownerId, { name, address, phone, email, website, notes }) {
		await checkUserExists(ownerId);

		const result = await db.query(
			`INSERT INTO restaurants (owner_id, name, address, phone, email, website, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, owner_id AS "ownerId", name, address, phone, email, website, notes`,
			[ ownerId, name, address, phone, email, website, notes ]
		);
		const restaurant = result.rows[0];
		Restaurant_User.register(restaurant.id, ownerId, true);
		return restaurant;
	}

	/** GET 
	 * Get a single restaurant by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, ownerId, name, address, phone, email, website, notes}
	 * 
	 * Throws NotFoundError if restaurant does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, owner_id AS "ownerId", name, address, phone, email, website, notes
            FROM restaurants
            WHERE id = $1`,
			[ id ]
		);
		const restaurant = result.rows[0];
		if (!restaurant) throw new NotFoundError(`There is no restaurant with the id ${id}.`);

		const userRestaurantsRes = await Restaurant_User.getAllRestaurantUsers(id);
		// restaurant.users = userRestaurantsRes.map(u => {
		// 	return { userId: u.userId, isAdmin: u.isAdmin };
		// });
		restaurant.users = userRestaurantsRes;
		return restaurant;
	}

	/** UPDATE
     * Replace restaurant's name, address, phone, email, website, notes.
     * 
     * Accepts: id, {name, address, phone, email, website, notes}
     * Returns: {id, ownerId, name, address, phone, email, website, notes}
     */
	static async update(id, { name, address, phone, email, website, notes }) {
		await checkRestaurantExists(id)

		const result = await db.query(
			`UPDATE restaurants
			SET name = $1, address = $2, phone = $3, email = $4, website = $5, notes = $6
            WHERE id = $7
            RETURNING id, owner_id as "ownerId", name, address, phone, email, website, notes`,
			[ name, address, phone, email, website, notes, id ]
		);
		const restaurant = result.rows[0];
		return restaurant;
	}

	/** REMOVE
	 * Deletes a restaurant from the database.
     * 
	 * Accepts: id
     * Returns: (nothing)
     * 
	 * Throws NotFoundError if restaurant does not exist.
     */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM restaurants
            WHERE id = $1
            RETURNING id`,
			[ id ]
		);
		const restaurant = result.rows[0];
		if (!restaurant) throw new NotFoundError(`There is no restaurant with id ${id}.`);
	}
}

module.exports = Restaurant;
