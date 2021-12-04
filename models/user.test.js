'use strict';

const { NotFoundError, BadRequestError, UnauthrorizedError } = require('../expressError');
const db = require('../db');
const User = require('./user');
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

describe('authenticate existing user', function() {
	test('authentication works', async function() {
		const authUserRes = await User.authenticate('u1@user.com', 'passwordU1');
		expect(authUserRes).toEqual({
			id            : expect.any(Number),
			email_address : 'u1@user.com',
			firstName     : 'U1F',
			lastName      : 'U1L'
		});
	});

	test('unauthorized if no matching user', async function() {
		try {
			await User.authenticate('nouser@user.com', 'password');
			fail();
		} catch (err) {
			expect(err instanceof UnauthrorizedError).toBeTruthy();
		}
	});

	test('unauthorized if wrong password', async function() {
		try {
			await User.authenticate('u1@user.com', 'wrongpassword');
			fail();
		} catch (err) {
			expect(err instanceof UnauthrorizedError).toBeTruthy();
		}
	});
});

describe('register new user', function() {
	test('register works', async function() {
		const newUserData = {
			emailAddress : 'U1Test@user.com',
			firstName    : 'U1TEstFirst',
			lastName     : 'U1TestLast',
			password     : 'U1TestPassword'
		};

		const newUserRes = await User.register(newUserData);
		expect(newUserRes).toEqual({
			id           : expect.any(Number),
			emailAddress : newUserData.emailAddress,
			firstName    : newUserData.firstName,
			lastName     : newUserData.lastName
		});
	});
});

describe('update user', function() {
	test('update works', async function() {
		const newUserData = {
			emailAddress : 'U2Test@user.com',
			firstName    : 'U2TestFirst',
			lastName     : 'U2TestLast',
			password     : 'U2TestPassword'
		};

		const newUserRes = await User.register(newUserData);
		const updateUserRes = await User.update(newUserRes.id, { ...newUserData, firstName: 'U2TestFirstUpdated' });
		expect(updateUserRes).toEqual({
			...newUserRes,
			firstName : 'U2TestFirstUpdated'
		});
	});
});
