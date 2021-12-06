'use strict';

require('dotenv').config();

const BCRYPT_WORK_FACTOR = 12;
const CORS_ORIGIN_URL = process.env.CORS_ORIGIN_URL || 'http://localhost:3001';
const PORT = +process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

function getDatabaseUri() {
	return process.env.NODE_ENV === 'test'
		? 'postgresql:///capstone2_test'
		: process.env.DATABASE_URL_2 || 'postgresql:///capstone2';
	// process.env.DATABASE_URL || 'postgresql:///capstone2';
}

module.exports = {
	BCRYPT_WORK_FACTOR,
	CORS_ORIGIN_URL,
	getDatabaseUri,
	PORT,
	SECRET_KEY
};
