const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

async function checkCategoryAndGroup(categoryId, catGroupId) {
	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const category = categoryRes.rows[0];
	if (!category) throw new NotFoundError(`There is no category with id ${categoryId}.`);

	const catGroupRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM cat_groups
		WHERE id = $1`,
		[ catGroupId ]
	);
	const catGroup = catGroupRes.rows[0];
	if (!catGroup) throw new NotFoundError(`There is no category group with id ${catGroupId}.`);

	if (category.restaurantId === catGroup.restaurantId) return true;
	throw new BadRequestError(
		`Category ${categoryId} and group ${catGroupId} are not associated with the same restaurant.`
	);
}

async function checkCatGroupAndRestaurant(catGroupId, restaurantId) {
	const catGroupRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM cat_groups
		WHERE id = $1`,
		[ catGroupId ]
	);
	const catGroup = catGroupRes.rows[0];
	if (!catGroup) throw new NotFoundError(`There is no category group with id ${catGroupId}.`);

	const restaurantRes = await db.query(
		`SELECT id
		FROM restaurants
		WHERE id = $1`,
		[ restaurantId ]
	);
	const restaurant = restaurantRes.rows[0];
	if (!restaurant) throw new NotFoundError(`There is no restaurant with id ${restaurantId}.`);

	if (catGroup.restaurantId === restaurant.id) return true;
	throw new BadRequestError(
		`Category group ${catGroupId} is not associated with retaurant ${restaurantId}.`
	);
}

async function checkCategoryMealPeriod(categoryId, mealPeriodId) {
	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const category = categoryRes.rows[0];
	if (!category) throw new NotFoundError(`There is no category with id ${categoryId}.`);

	const mealPeriodRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM meal_periods
		WHERE id = $1`,
		[ mealPeriodId ]
	);
	const mealPeriod = mealPeriodRes.rows[0];
	if (!mealPeriod) throw new NotFoundError(`There is no meal period with id ${mealPeriodId}.`);

	if (category.restaurantId === mealPeriod.restaurantId) return true;
	throw new BadRequestError(
		`Category ${categoryId} and meal period ${mealPeriodId} are not associated with the same restaurant.`
	);
}

async function checkInvoiceCategory(invoiceId, categoryId) {
	const invoiceRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM invoices
		WHERE id = $1`,
		[ invoiceId ]
	);
	const invoice = invoiceRes.rows[0];
	if (!invoice) throw new NotFoundError(`There is no invoice with id ${invoiceId}.`);

	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const category = categoryRes.rows[0];
	if (!category) throw new NotFoundError(`There is no category with id ${categoryId}.`);

	if (invoice.restaurantId === category.restaurantId) return true;
	throw new BadRequestError(
		`Invoice ${invoiceId} and category ${categoryId} are not associated with the same restaurant.`
	);
}

// async function checkInvoiceCategoryRestaurant(invoiceId, categoryId, restaurantId) {
// 	const invoiceRes = await db.query(
// 		`SELECT id, restaurant_id AS "restaurantId"
// 		FROM invoices
// 		WHERE id = $1`,
// 		[ invoiceId ]
// 	);
// 	const invoice = invoiceRes.rows[0];
// 	if (!invoice) throw new NotFoundError(`There is no invoice with id ${invoiceId}.`);

// 	const categoryRes = await db.query(
// 		`SELECT id, restaurant_id AS "restaurantId"
// 		FROM categories
// 		WHERE id = $1`,
// 		[ categoryId ]
// 	);
// 	const category = categoryRes.rows[0];
// 	if (!category) throw new NotFoundError(`There is no category with id ${categoryId}.`);

// 	const restaurantRes = await db.query(
// 		`SELECT id
// 		FROM restaurants
// 		WHERE id = $1`,
// 		[ restaurantId ]
// 	);
// 	const restaurant = restaurantRes.rows[0];
// 	if (!restaurant) throw new NotFoundError(`There is no restaurant with id ${restaurantId}.`);

// 	if (invoice.restaurantId === restaurantId && category.restaurantId === restaurantId) return true;
// 	throw new BadRequestError(
// 		`Invoice ${invoiceId} and category ${categoryId} are not both associated with restaurant ${restaurantId}.`
// 	);
// }

async function checkExpenseInvoiceCategory(expenseId, invoiceId, categoryId) {
	const expenseRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM expenses
		WHERE id = $1`,
		[ expenseId ]
	);
	const expense = expenseRes.rows[0];
	if (!expense) throw new NotFoundError(`There is no expense with id ${expenseId}.`);

	const invoiceRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM invoices
		WHERE id = $1`,
		[ invoiceId ]
	);
	const invoice = invoiceRes.rows[0];
	if (!invoice) throw new NotFoundError(`There is no invoice with id ${invoiceId}.`);

	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const category = categoryRes.rows[0];
	if (!category) throw new NotFoundError(`There is no category with id ${categoryId}.`);

	if (expense.restaurantId === invoice.restaurantId && expense.restaurantId === category.restaurantId) return true;
	throw new BadRequestError(
		`Expense ${expenseId}, invoice ${invoiceId}, and category ${categoryId} are not associated with the same restaurant.`
	);
}

module.exports = {
	checkCategoryAndGroup,
	checkCatGroupAndRestaurant,
	checkCategoryMealPeriod,
	checkInvoiceCategory,
	// checkInvoiceCategoryRestaurant,
	checkExpenseInvoiceCategory
};
