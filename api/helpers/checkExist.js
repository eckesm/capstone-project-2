const db = require('../db');

async function checkRestaurantExists(id) {
	const result = await db.query(
		`SELECT id
		FROM restaurants
		WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	return false;
}

async function checkUserExists(id) {
	const result = await db.query(
		`SELECT id
        FROM users
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	return false;
}

module.exports = { checkRestaurantExists, checkUserExists };
