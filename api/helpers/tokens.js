const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

function createToken(user) {
	let payload = {
		emailAddress : user.emailAddress
	};
	return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
