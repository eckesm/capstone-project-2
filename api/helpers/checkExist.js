const db = require('../db');
const { NotFoundError } = require('../expressError');

async function checkRestaurantExists(id) {
	const result = await db.query(
		`SELECT id
		FROM restaurants
		WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	// return false;
	throw new NotFoundError(`There is no restaurant with ID ${id}.`);
}

async function checkUserExists(id) {
	const result = await db.query(
		`SELECT id
        FROM users
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	// return false;
	throw new NotFoundError(`There is no user with ID ${id}.`);
}

async function checkMealPeriodExists(id) {
	const result = await db.query(
		`SELECT id
        FROM meal_periods
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no meal period with ID ${id}.`);
	// return false;
}

async function checkCatGroupExists(id) {
	const result = await db.query(
		`SELECT id
        FROM cat_groups
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	// return false;
	throw new NotFoundError(`There is no category group with ID ${id}.`);
}

async function checkCategoryExists(id) {
	const result = await db.query(
		`SELECT id
        FROM categories
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	// return false;
	throw new NotFoundError(`There is no category with ID ${id}.`);
}

async function checkMealPeriodCatExists(id) {
	const result = await db.query(
		`SELECT id
        FROM meal_periods_categories
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	// return false;
	throw new NotFoundError(`There is no meal period / category association with ID ${id}.`);
}

module.exports = {
	checkRestaurantExists,
	checkUserExists,
	checkMealPeriodExists,
	checkCatGroupExists,
	checkCategoryExists,
	checkMealPeriodCatExists
};
