'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { createToken } = require('../helpers/tokens');
const { ensureCorrectUser } = require('../middleware/auth');

const User = require('../models/user');

const userNewSchema = require('../schemas/userNew.json');
const userUpdateSchema = require('../schemas/userUpdate.json');

/** POST /
 * Adds a user to the database.
 * 
 * Accepts JSON: {emailAddress, firstName, lastName, password}
 * Returns JSON: {user: {emailAddress, firstName, lastName}, token}
 */
router.post('/', async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const user = await User.register(req.body);
		const token = createToken(user);
		return res.status(201).json({ user, token });
	} catch (error) {
		return next(error);
	}
});

/** GET /[id]
 * Gets user informaion for a single user.
 * 
 * Returns JSON: {user: {id, emailAddress, firstName, lastName}}
 * 
 * Authorization: ensure correct user
 */
router.get('/:id', ensureCorrectUser, async function(req, res, next) {
	try {
		const user = await User.get(req.params.id);
		return res.status(200).json({ user });
	} catch (error) {
		return next(error);
	}
});

/** PUT /[id]
 * Updates information for a user.
 * 
 * Accepts JSON: {emailAddress, firstName, lastName, password}
 * Returns JSON: {user: {id, emailAddress, firstName, lastName}}
 * 
 * Authorization: ensure correct user
 */
router.put('/:id', ensureCorrectUser, async function(req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, userUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const user = await User.update(req.params.id, req.body);
		return res.status(200).json({ user });
	} catch (error) {
		return next(error);
	}
});

/** DELETE /[id]
 * Deletes a restaurant from the database.
 * 
 * Returns JSON: {deleted: id}
 * 
 * Authorization: ensure correct user
 */
router.delete('/:id', ensureCorrectUser, async function(req, res, next) {
	try {
		await User.remove(req.params.id);
		return res.status(200).json({ deleted: req.params.id });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
