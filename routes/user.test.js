const request = require('supertest');

const db = require('../db');
const app = require('../app');

const User = require('../models/user');
const { createToken } = require('../helpers/tokens');

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

describe('POST /users', function() {
	test('Adding user works', async function() {
		const newUserData = {
			emailAddress : 'U1Test@user.com',
			firstName    : 'U1TEstFirst',
			lastName     : 'U1TestLast',
			password     : 'U1TestPassword'
		};
		const newUserRes = await request(app).post('/users').send(newUserData);
		expect(newUserRes.status).toEqual(201);
		expect(newUserRes.body).toEqual({
			user  : {
				id           : expect.any(Number),
				emailAddress : newUserData.emailAddress,
				firstName    : newUserData.firstName,
				lastName     : newUserData.lastName
			},
			token : expect.any(String)
		});
	});
});

describe('GET /users/:id', function() {
	test('Get user information works', async function() {
		const user1 = await User.authenticate('u1@user.com', 'passwordU1');
		u1Token = createToken(user1);

		const getUserRes = await request(app)
			.get(`/users/${testUsers[0]['id']}`)
			.set('Authorization', `bearer ${u1Token}`);
		expect(getUserRes.status).toEqual(200);
		expect(getUserRes.body).toEqual({
			user : {
				...testUsers[0],
				restaurants : [ { isAdmin: true, ...testRestaurants[0] } ]
			}
		});
	});
});
