'use strict';

describe('config can come from env', function() {
	test('config variables work', function() {
		process.env.CORS_ORIGIN_URL = 'other';
		process.env.DATABASE_URL_2 = 'other2';
		process.env.PORT = 5000;
		process.env.SECRET_KEY = 'abc';
		process.env.NODE_ENV = 'other';

		const config = require('./config');
		expect(config.CORS_ORIGIN_URL).toEqual('other');
		expect(config.getDatabaseUri()).toEqual('other2');
		expect(config.PORT).toEqual(5000);
		expect(config.SECRET_KEY).toEqual('abc');

		delete process.env.CORS_ORIGIN_URL;
		delete process.env.DATABASE_URL_2;
		delete process.env.PORT;
		delete process.env.SECRET_KEY;

		expect(config.getDatabaseUri()).toEqual('postgresql:///capstone2');
		process.env.NODE_ENV = 'test';
		expect(config.getDatabaseUri()).toEqual('postgresql:///capstone2_test');
	});
});
