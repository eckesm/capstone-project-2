'use strict';

const { NotFoundError, BadRequestError, UnauthrorizedError } = require('../expressError');

const db = require('../db');

const MealPeriod = require('./mealPeriod');
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

let addedMealPeriod = {};

describe('register new meal period', function() {
	test('register works', async function() {
		const newMealPeriodData = {
			name  : 'MP1TestName',
			notes : 'MP1TestNotes'
		};
		const newMealPeriodRes = await MealPeriod.register({
			restaurantId : testRestaurants[0]['id'],
			...newMealPeriodData
		});
		console.log(newMealPeriodRes);
		addedMealPeriod = newMealPeriodRes;

		expect(newMealPeriodRes).toEqual({
			...newMealPeriodData,
			id           : expect.any(Number),
			restaurantId : testRestaurants[0]['id']
		});
	});

	test('restaurant has added meal period', async function() {
		const restaurant1MealPeriodsRes = await MealPeriod.getAllForRestaurant(testRestaurants[0]['id']);
		expect(restaurant1MealPeriodsRes).toEqual([ addedMealPeriod ]);
	});
});

describe('remove meal period', function() {
	test('remove works and restaurant doees not have added meal period', async function() {
		await MealPeriod.remove(addedMealPeriod.id);
		const restaurant1MealPeriodsRes = await MealPeriod.getAllForRestaurant(testRestaurants[0]['id']);
		expect(restaurant1MealPeriodsRes).toEqual([]);
	});
});
