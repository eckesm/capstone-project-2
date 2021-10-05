const express = require('express');
const router = new express.Router();

const ExpressError = require('../expressError');
const User = require('../models/user');
const { createToken } = require('../helpers/tokens');

/** Register user.
 * 
 * Accepts:
 *      {emailAddress, firstName, lastName, password}
 *  
 * Returns:
 *      {user: {emailAddress, firstName, lastName}, token}
 */
router.post('/register', async function(req, res, next) {
	try {
		const user = await User.register(req.body);
		const token = createToken(user);
		return res.status(201).json({ user, token });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
