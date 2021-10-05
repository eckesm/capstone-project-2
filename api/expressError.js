class ExpressError extends Error {
	constructor(message, status) {
		super();
		this.message = message;
		this.status = status;
		if (process.env.NODE_ENV != 'test') {
			console.error(this.stack);
		}
	}
}

/** 404: not found error */
class NotFoundError extends ExpressError {
	constructor(message = 'Not Found') {
		super(message, 404);
	}
}

/** 400: Bad request error */
class BadRequestError extends ExpressError {
	constructor(message = 'Bad Request') {
		super(message, 400);
	}
}

module.exports = { ExpressError, NotFoundError, BadRequestError };
