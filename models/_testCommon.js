const bcrypt = require('bcrypt');

const db = require('../db');
const { BCRYPT_WORK_FACTOR } = require('../config');

let testUsers = [];
let testRestaurants = [];

async function commonBeforeAll() {
	await db.query('DELETE FROM restaurants');
	await db.query('DELETE FROM users');

	const resultsUsers = await db.query(
		`
        INSERT INTO users (email_address, first_name, last_name, password)
        VALUES  ('u1@user.com', 'U1F', 'U1L', $1),
                ('u2@user.com', 'U2F', 'U2L', $2)
        RETURNING email_address, id
        `,
		[ await bcrypt.hash('passwordU1', BCRYPT_WORK_FACTOR), await bcrypt.hash('passwordU2', BCRYPT_WORK_FACTOR) ]
	);

	testUsers.splice(
		0,
		0,
		...resultsUsers.rows.map(u => {
			return { email_address: u.email_address, id: u.id };
		})
	);

	const resultsRestaurants = await db.query(
		`
	    INSERT INTO restaurants (owner_id, name, address, phone, email, website, notes)
	    VALUES  ($1, 'Rest1', 'R1Address', 'R1Phone', 'R1Email@restaurant.com', 'R1Website.com', 'R1Notes'),
	            ($2, 'Rest2', 'R2Address', 'R2Phone', 'R2Email@restaurant.com', 'R2Website.com', 'R2Notes')
	    RETURNING id, owner_id as "ownerId", name, address, phone, email, website, notes
	    `,
		[ testUsers[0]['id'], testUsers[1]['id'] ]
	);

	testRestaurants.splice(
		0,
		0,
		...resultsRestaurants.rows.map(r => {
			return { ...r };
		})
	);
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
