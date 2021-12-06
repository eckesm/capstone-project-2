const db = require('../db');

const User = require('../models/user');
const Restaurant = require('../models/restaurant');

const { createToken } = require('../helpers/tokens');

let testUsers = [];
let testRestaurants = [];

async function commonBeforeAll() {
	await db.query('DELETE FROM restaurants');
	await db.query('DELETE FROM users');

	const resultUser1 = await User.register({
		emailAddress : 'u1@user.com',
		firstName    : 'U1F',
		lastName     : 'U1L',
		password     : 'passwordU1'
	});
	testUsers.splice(0, 0, resultUser1);

	const resultUser2 = await User.register({
		emailAddress : 'u2@user.com',
		firstName    : 'U2F',
		lastName     : 'U2L',
		password     : 'passwordU2'
	});

	const resultRestaurant1 = await Restaurant.register(resultUser1.id, {
		name    : 'Rest1',
		address : 'R1Address',
		phone   : 'R1Phone',
		email   : 'R1Email@restaurant.com',
		website : 'R1Website.com',
		notes   : 'R1Notes'
	});
	testRestaurants.splice(0, 0, resultRestaurant1);

	await Restaurant.register(resultUser2.id, {
		name    : 'Rest2',
		address : 'R2Address',
		phone   : 'R2Phone',
		email   : 'R2Email@restaurant.com',
		website : 'R2Website.com',
		notes   : 'R2Notes'
	});
}

async function commonBeforeEach() {
	// await db.query('BEGIN');
}

async function commonAfterEach() {
	// await db.query('ROLLBACK');
}

async function commonAfterAll() {
	await db.end();
}

module.exports = { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testUsers, testRestaurants };
