'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn } = require('../middleware/auth');
const { checkUserIsRestAccess } = require('../helpers/checkAccess');

const Restaurant = require('../models/restaurant');
const Invoice = require('../models/invoice');
const Expense = require('../models/expense');

const invoiceNewSchema = require('../schemas/invoiceNew.json');
const invoiceUpdateSchema = require('../schemas/invoiceUpdate.json');

/** POST /
 * Adds an invoice to the database.
 * 
 * Accepts JSON: {restaurantId, date, invoice, vendor, total, notes}
 * Returns JSON: {invoice: {id, restaurantId, date, invoice, vendor, total, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.post('/', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, invoiceNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}

		const userId = res.locals.user.id;
		const { restaurantId } = req.body;

		/// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const invoice = await Invoice.register(req.body);
			return res.status(201).json({ invoice });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets single invoice.
 
 * Returns JSON: {invoice: {id, restaurantId, date, invoice, vendor, total, notes}}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const invoiceId = req.params.id;
		const userId = res.locals.user.id;

		const invoice = await Invoice.get(invoiceId);
		const restaurantId = invoice.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const restaurant = await Restaurant.get(restaurantId);
			invoice.restaurantName = restaurant.name;
			invoice.expenses = await Expense.getAllForInvoice(invoiceId);

			return res.status(200).json({ invoice });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /restaurants/[restaurantId]
 * Gets all invoices for a restaurant.
 
 * Returns JSON: {invoices: [{id, restaurantId, date, invoice, vendor, total, notes},...]}

 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.get('/restaurants/:restaurantId', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const { restaurantId } = req.params;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const invoices = await Invoice.getAllForRestaurant(restaurantId);
			return res.status(200).json({ invoices });
		}
	} catch (error) {
		return next(error);
	}
});

/** GET /restaurants/[restaurantId]/startdate/[startDate]/enddate/[endDate]
 * Gets all invoices for a restaurant over a given date range.
 
 * Returns JSON: {invoices: [{id, restaurantId, date, invoice, vendor, total, notes},...]}

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
			return res.status(200).json({ invoices });
		}
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for an invoice.
 * 
 * Accepts JSON: {date, invoice, vendor, total, notes}
 * Returns JSON: {invoice: {id, restaurantId, date, invoice, vendor, total, notes}}
 * 
 * Authorization: ensure logged in.
 * Access: any restaurant user.
 */
router.put('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, invoiceUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const userId = res.locals.user.id;
		const invoiceId = req.params.id;

		const existingInvoice = await Invoice.get(invoiceId);
		const restaurantId = existingInvoice.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			const invoice = await Invoice.update(invoiceId, req.body);
			invoice.expenses = await Expense.getAllForInvoice(invoiceId);
			return res.status(200).json({ invoice });
		}
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes an invoice from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure logged in.
 * Access: all restaurant users.
 */
router.delete('/:id', ensureLoggedIn, async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const invoiceId = req.params.id;

		const invoice = await Invoice.get(invoiceId);
		const restaurantId = invoice.restaurantId;

		// Check that user has access to the restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess) {
			await Invoice.remove(invoiceId);
			return res.status(200).json({ deleted: invoiceId });
		}
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
