'use strict';

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { checkRestaurantExists } = require('../helpers/checkExist');
const { checkExpenseInvoiceCategory } = require('../helpers/checkSameRestaurant');

class Expense {
	/** REGISTER
     * Adds an expense to the database.
     * 
     * Accepts: {restaurantId, categoryId, invoiceId, amount, notes}
     * Returns: {id, restaurantId, categoryId, invoiceId, amount, notes}
     */
	static async register({ restaurantId, categoryId, invoiceId, amount, notes }) {
		await checkRestaurantExists(restaurantId);
		await checkInvoiceCategory(invoiceId, categoryId);

		const result = await db.query(
			`INSERT INTO expenses (restaurant_id, category_id, invoice_id, amount, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, restaurant_id AS "restaurantId", category_id AS "categoryId", invoice_id AS "invoiceId", amount, notes, notes`,
			[ restaurantId, categoryId, invoiceId, amount, notes ]
		);
		return result.rows[0];
	}

	/** GET 
	 * Get a single expense by ID.
	 * 
	 * Accepts: id
	 * Returns: {id, restaurantId, categoryId, invoiceId, amount, notes}
	 * 
	 * Throws NotFoundError if expense does not exist.
	 */
	static async get(id) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", category_id AS "categoryId", invoice_id AS "invoiceId", amount, notes, notes
			FROM expenses
			WHERE id = $1`,
			[ id ]
		);
		const expense = result.rows[0];
		if (!expense) throw new NotFoundError(`There is no expense with the id ${id}.`);
		return expense;
	}

	/** GET ALL FOR INVOICE
	 * Returns array of all expenses associated with an invoice.
	 * 
	 * Accepts: invoiceId
	 * Returns: [{id, restaurantId, categoryId, invoiceId, amount, notes},...]
	 */
	static async getAllForInvoice(invoiceId) {
		const result = await db.query(
			`SELECT id, restaurant_id AS "restaurantId", category_id AS "categoryId", invoice_id AS "invoiceId", amount, notes, notes
			FROM expenses
			WHERE invoice_id = $1`,
			[ invoiceId ]
		);
		return result.rows;
	}

	/** UPDATE
	 * Replace expense's categoryId, amount, notes.
	 * 
	 * Accepts: id, {categoryId, amount, notes}
	 * Returns: {id, restaurantId, categoryId, invoiceId, amount, notes}
	 */
	static async update(expenseId, invoiceId, { categoryId, amount, notes }) {
		await checkExpenseInvoiceCategory(expenseId, invoiceId, categoryId);

		const result = await db.query(
			`UPDATE expenses
			SET category_id = $1, amount = $2, notes = $3
			WHERE id = $4
			RETURNING id, restaurant_id AS "restaurantId", category_id AS "categoryId", invoice_id AS "invoiceId", amount, notes, notes`,
			[ categoryId, amount, notes, expenseId ]
		);
		return result.rows[0];
	}

	/** REMOVE
	 * Deletes ane expense from the database.
	 * 
	 * Accepts: id
	 * Returns: (nothing)
	 * 
	 * Throws NotFoundError if expense does not exist.
	 */
	static async remove(id) {
		const result = await db.query(
			`DELETE FROM expenses
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const expense = result.rows[0];
		if (!expense) throw new NotFoundError(`There is no expense with id ${id}.`);
	}
}

module.exports = Expense;
