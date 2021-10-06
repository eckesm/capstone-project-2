const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

function createToken(user) {
	let payload = {
		id : user.id
	};
	return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
