// const DB_URI = process.env.NODE_ENV === 'test' ? 'postgresql:///capstone2_test' : 'postgresql:///capstone2';
// const DB_URI = process.env.DATABASE_URL || 'postgresql:///capstone2';
// const DB_URI = process.env.DATABASE_2 || 'postgresql:///capstone2';

const BCRYPT_WORK_FACTOR = 12;
const CORS_ORIGIN_URL = process.env.CORS_ORIGIN_URL || 'http://localhost:3001';
const DB_URI = process.env.DATABASE_URL_2 || 'postgresql:///capstone2';
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

module.exports = {
	BCRYPT_WORK_FACTOR,
	CORS_ORIGIN_URL,
	DB_URI,
	SECRET_KEY
};
