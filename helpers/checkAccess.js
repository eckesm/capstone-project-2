const db = require('../db');
const { UnauthrorizedError } = require('../expressError');
const { checkUserExists, checkRestaurantExists } = require('./checkExist');

/** CHECK IF ACCESS
	 * Checks if a given user is a user or admin of a given restaurant.
	 * 
	 * Accepts: restaurantId, userId
	 * Returns: true / false
	 * 
	 * Throws NotFoundError if restaurant or user does not exist.
	 */
async function checkUserIsRestAccess(restaurantId, userId) {
	const userExists = await checkUserExists(userId);
	const restaurantExists = await checkRestaurantExists(restaurantId);

	if (userExists === false && restaurantExists === false) {
		return { status: false, message: `User ${userId} and restaurant ${restaurantId} do not exist.` };
	}
	if (userExists === false) {
		return { status: false, message: `User ${userId} does not exist.` };
	}
	if (restaurantExists === false) {
		return { status: false, message: `Restaurant ${restaurantId} does not exist.` };
	}

	const result = await db.query(
		`SELECT id, restaurant_id, user_id
			FROM restaurants_users
			WHERE restaurant_id = $1 AND user_id = $2`,
		[ restaurantId, userId ]
	);
	const restUser = result.rows[0];
	if (restUser) return { status: true };
	throw new UnauthrorizedError(`User ${userId} is not authorized to access restaurant ${restaurantId}.`);
}

/** CHECK IF ADMIN
	 * Checks if a given user is an admin of a given restaurant.
	 * 
	 * Accepts: restaurantId, userId
	 * Returns: true / false
	 * 
	 * Throws NotFoundError if restaurant or user does not exist.
	 */
async function checkUserIsRestAdmin(restaurantId, userId) {
	await checkUserExists(userId);
	await checkRestaurantExists(restaurantId);

	const result = await db.query(
		`SELECT id, restaurant_id, user_id, is_admin
			FROM restaurants_users
			WHERE restaurant_id = $1 AND user_id = $2`,
		[ restaurantId, userId ]
	);
	const restUser = result.rows[0];
	if (restUser && restUser.is_admin === true) return true;
	throw new UnauthrorizedError(
		`User ${userId} is not authorized to access restaurant ${restaurantId} as an administrator.`
	);
}

module.exports = {
	checkUserIsRestAccess,
	checkUserIsRestAdmin
};
