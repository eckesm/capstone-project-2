'use strict';

const express = require('express');
const router = new express.Router();

const User = require('../models/user');
const { createToken } = require('../helpers/tokens');

/** POST /token
 * Accepts JSON: {emailAddress, password}
 * Returns JSON: {token}
 */
router.post('/token', async function(req, res, next) {
	try {
		const { emailAddress, password } = req.body;
		const user = await User.authenticate(emailAddress, password);
		const token = createToken(user);
		return res.status(200).json({ token });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
