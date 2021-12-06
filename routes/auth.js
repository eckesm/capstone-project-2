'use strict';

const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');

const { BadRequestError } = require('../expressError');
const { createToken } = require('../helpers/tokens');

const User = require('../models/user');
const authTokenSchema = require('../schemas/authToken.json');

/** POST /token
 * Accepts JSON: {emailAddress, password}
 * Returns JSON: {token}
 * 
 */
router.post('/token', async function(req, res, next) {
	console.log('received request', req.body);

	try {
		const validator = jsonschema.validate(req.body, authTokenSchema);
		console.log('validator', validator);
		if (!validator.valid) {
			console.log('not valid');
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		console.log('valid');
		const { emailAddress, password } = req.body;
		const user = await User.authenticate(emailAddress, password);
		console.log('user', user);
		const token = createToken(user);
		console.log('token', token);
		return res.status(200).json({ token, id: user.id });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
