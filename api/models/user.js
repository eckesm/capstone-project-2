'use strict';

const bcrypt = require('bcrypt');

const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');

const { BCRYPT_WORK_FACTOR } = require('../config');

class User {
	/** Register user.
     * 
     * Accepts:
     *      {emailAddress, firstName, lastName, password}
     *  
     * Returns:
     *      {emailAddress, firstName, lastName}
     * 
     * Throws BadRequestError if emailAddress is a duplicate.
     */

	static async register({ emailAddress, firstName, lastName, password }) {
		const duplicateCheck = await db.query(
			`SELECT email_address
            FROM users
            WHERE email_address = $1`,
			[ emailAddress ]
		);

		if (duplicateCheck.rows[0]) {
			throw new BadRequestError(
				`The email address ${emailAddress} is already associated with an existing account.`
			);
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const result = await db.query(
			`INSERT INTO users (email_address, first_name, last_name, password)
            VALUES ($1, $2, $3, $4)
            RETURNING email_address AS "emailAddress", first_name AS "firstName", last_name AS "lastName"`,
			[ emailAddress, firstName, lastName, hashedPassword ]
		);
		const user = result.rows[0];
		return user;
	}
}

module.exports = User;
