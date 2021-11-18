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
	try {
		const validator = jsonschema.validate(req.body, authTokenSchema);
		if (!validator.valid) {
			const errs = validator.errors.map(e => e.stack);
			throw new BadRequestError(errs);
		}
		const { emailAddress, password } = req.body;
		const user = await User.authenticate(emailAddress, password);
		const token = createToken(user);
		return res.status(200).json({ token, id: user.id });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
