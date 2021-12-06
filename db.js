const { Client } = require('pg');
// const { DB_URI } = require('./config');
const { getDatabaseUri } = require('./config');

const client = new Client({
	connectionString : getDatabaseUri(),
	ssl              : { rejectUnauthorized: false }
});

client.connect();

module.exports = client;
