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
	if (!category) throw new NotFoundError(`There is no category with the id ${categoryId}.`);

	const catGroupRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM cat_groups
		WHERE id = $1`,
		[ catGroupId ]
	);
	const catGroup = catGroupRes.rows[0];
	if (!catGroup) throw new NotFoundError(`There is no category group with the id ${catGroupId}.`);

	if (category.restaurantId === catGroup.restaurantId) return true;
	throw new BadRequestError(
		`Category ${categoryId} and group ${catGroupId} are not associated with the same restaurant.`
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
	if (!invoice) throw new NotFoundError(`There is no invoice with the id ${invoiceId}.`);

	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const category = categoryRes.rows[0];
	if (!category) throw new NotFoundError(`There is no category with the id ${categoryId}.`);

	if (invoice.restaurantId === category.restaurantId) return true;
	throw new BadRequestError(
		`Invoice ${invoiceId} and category ${categoryId} are not associated with the same restaurant.`
	);
}

async function checkExpenseInvoiceCategory(expenseId, invoiceId, categoryId) {
	const expenseRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM expenses
		WHERE id = $1`,
		[ expenseId ]
	);
	const expense = expenseRes.rows[0];
	if (!expense) throw new NotFoundError(`There is no expense with the id ${expenseId}.`);

	const invoiceRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM invoices
		WHERE id = $1`,
		[ invoiceId ]
	);
	const invoice = invoiceRes.rows[0];
	if (!invoice) throw new NotFoundError(`There is no invoice with the id ${invoiceId}.`);

	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const category = categoryRes.rows[0];
	if (!category) throw new NotFoundError(`There is no category with the id ${categoryId}.`);

	if ((expense.restaurantId === invoice.restaurantId) === category.restaurantId) return true;
	throw new BadRequestError(
		`Expense ${expenseId}, invoice ${invoiceId}, and category ${categoryId} are not associated with the same restaurant.`
	);
}

module.exports = {
	checkCategoryAndGroup,
	checkInvoiceCategory,
	checkExpenseInvoiceCategory
};
