const { Client } = require('pg');
const { getDatabaseUri } = require('./config');

const client = new Client({
	connectionString : getDatabaseUri()
	// ssl              : { rejectUnauthorized: false }
});

client.connect();

module.exports = client;
