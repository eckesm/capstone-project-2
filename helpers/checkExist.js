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
	throw new NotFoundError(`There is no restaurant with id ${id}.`);
}

async function checkUserExists(id) {
	const result = await db.query(
		`SELECT id
        FROM users
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no user with id ${id}.`);
}

async function checkMealPeriodExists(id) {
	const result = await db.query(
		`SELECT id
        FROM meal_periods
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no meal period with id ${id}.`);
}

async function checkCatGroupExists(id) {
	const result = await db.query(
		`SELECT id
        FROM cat_groups
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no category group with id ${id}.`);
}

async function checkCategoryExists(id) {
	const result = await db.query(
		`SELECT id
        FROM categories
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no category with id ${id}.`);
}

async function checkMealPeriodCatExists(id) {
	const result = await db.query(
		`SELECT id
        FROM meal_periods_categories
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no meal period / category association with id ${id}.`);
}

async function checkDayOfWeekExists(id) {
	const result = await db.query(
		`SELECT id
        FROM days_of_week
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no day of the week with id ${id}.`);
}

async function checkSaleExists(id) {
	const result = await db.query(
		`SELECT id
        FROM sales
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no sale record with id ${id}.`);
}

async function checkDefaultSaleExists(id) {
	const result = await db.query(
		`SELECT id
        FROM default_sales
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no default sale entry with id ${id}.`);
}

async function checkInvoiceExists(id) {
	const result = await db.query(
		`SELECT id
        FROM invoices
        WHERE id = $1`,
		[ id ]
	);
	if (result.rows[0]) return true;
	throw new NotFoundError(`There is no invoice with id ${id}.`);
}

module.exports = {
	checkRestaurantExists,
	checkUserExists,
	checkMealPeriodExists,
	checkCatGroupExists,
	checkCategoryExists,
	checkMealPeriodCatExists,
	checkDayOfWeekExists,
	checkSaleExists,
	checkDefaultSaleExists,
	checkInvoiceExists
};
