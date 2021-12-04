'use strict';

const { NotFoundError, BadRequestError, UnauthrorizedError } = require('../expressError');

const db = require('../db');

const Restaurant = require('./restaurant');
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testUsers,
	testRestaurants
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('register new restaurant', function() {
	test('register works', async function() {
		const newRestaurantData = {
			name    : 'R1TestName',
			address : 'R1TestAddress',
			phone   : 'R1TestPhone',
			email   : 'R1TestEmail',
			website : 'R1TestWebsite',
			notes   : 'R1TestNotes'
		};
		const newRestaurantRes = await Restaurant.register(testUsers[0]['id'], newRestaurantData);
		expect(newRestaurantRes).toEqual({
			...newRestaurantData,
			id      : expect.any(Number),
			ownerId : testUsers[0]['id']
		});
	});
});

describe('update restaurant', function() {
	test('update works', async function() {
		const newRestaurantData = {
			name    : 'R2TestName',
			address : 'R2TestAddress',
			phone   : '',
			email   : '',
			website : '',
			notes   : 'R2TestNotes'
		};

		const newRestaurantRes = await db.query(
			`
			INSERT INTO restaurants (owner_id, name, address, phone, email, website, notes)
			VALUES  ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id, owner_id as "ownerId", name, address, phone, email, website, notes
			`,
			[
				testUsers[0]['id'],
				newRestaurantData.name,
				newRestaurantData.address,
				newRestaurantData.phone,
				newRestaurantData.email,
				newRestaurantData.website,
				newRestaurantData.notes
			]
		);
		const newRestaurant = newRestaurantRes.rows[0];

		const updateRestaurantRes = await Restaurant.update(newRestaurant.id, {
			...newRestaurant,
			name : 'R2TestNameUpdated'
		});
		expect(updateRestaurantRes).toEqual({
			...newRestaurant,
			name : 'R2TestNameUpdated'
		});
	});
});
