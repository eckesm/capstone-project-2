'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkUserIsRestAccess } = require('../helpers/checkAccess');

const Expense = require('../models/expense');
const Invoice = require('../models/invoice');

const expenseNewSchema = require('../schemas/expenseNew.json');
const expenseUpdateSchema = require('../schemas/expenseUpdate.json');

/** POST /
 * Adds an expense to the database.
 * 
 * Accepts JSON: {restaurantId, categoryId, invoiceId, amount, notes}
 * Returns JSON: {expense: {restaurantId, categoryId, invoiceId, amount, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, expenseNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { restaurantId } = req.body;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const expense = await Expense.register(req.body);
			return res.status(201).json({ expense });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets expense informaion for a single expense.
 
 * Returns JSON: {expense: {id, restaurantId, categoryId, invoiceId, amount, notes}}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const expenseId = req.params.id;

		const expense = await Expense.get(expenseId);
		const restaurantId = expense.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const invoice = await Invoice.get(expense.invoiceId);
			expense.invoice = invoice;

			return res.status(200).json({ expense });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET ALL /invoices/[invoiceId]
 * Gets all expenses for an invoice.
 
 * Returns JSON: {expenses: [{id, restaurantId, categoryId, invoiceId, amount, notes},...]}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/invoices/:invoiceId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { invoiceId } = req.params;

		const invoice = await Invoice.get(invoiceId);
		const restaurantId = invoice.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const expenses = await Expense.getAllForInvoice(invoiceId);
			return res.status(200).json({ expenses });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET ALL /restaurants/[restaurantId]/startdate/[startDate]/enddate/[endDate]
 * Gets all expenses for a restaurant over a given period.
 
 * Returns JSON: {expenses: [{id, restaurantId, categoryId, invoiceId, amount, notes},...]}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/restaurants/:restaurantId/startdate/:startDate/enddate/:endDate', ensureLoggedIn, async function(
	req,
	res,
	next
) {
	try {
		const userId = res.locals.user.id;
		const { restaurantId, startDate, endDate } = req.params;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const invoices = await Invoice.getDatesForRestaurant(restaurantId, startDate, endDate);
			const expenses = [];
			for (let i = 0; i < invoices.length; i++) {
				let invoice = invoices[i];
				const invExpenses = await Expense.getAllForInvoice(invoice.id);
				expenses.push(...invExpenses);
			}
			return res.status(200).json({ expenses });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for an expense.
 * 
 * Accepts JSON: {categoryId, amount, notes}
 * Returns JSON: {expense: {id, restaurantId, categoryId, invoiceId, amount, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, expenseUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const userId = res.locals.user.id;
		const expenseId = req.params.id;

		const existingExpense = await Expense.get(expenseId);
		const restaurantId = existingExpense.restaurantId;
		const invoiceId = existingExpense.invoiceId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const expense = await Expense.update(expenseId, invoiceId, req.body);
			return res.status(200).json({ expense });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes an expense from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const expenseId = req.params.id;

		const expense = await Expense.get(expenseId);
		const restaurantId = expense.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			await Expense.remove(expenseId);
			return res.status(200).json({ deleted: expenseId });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
