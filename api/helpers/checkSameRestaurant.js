const db = require('../db');
const { BadRequestError } = require('../expressError');

async function checkCategoryAndGroup(categoryId, catGroupId) {
	const categoryRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM categories
		WHERE id = $1`,
		[ categoryId ]
	);
	const catGroupRes = await db.query(
		`SELECT id, restaurant_id AS "restaurantId"
		FROM cat_groups
		WHERE id = $1`,
		[ catGroupId ]
	);
	if (categoryRes.rows[0].restaurantId === catGroupRes.rows[0].restaurantId) return true;
	throw new BadRequestError(
		`Category ${categoryId} and group ${catGroupId} are not associated with the same restaurant.`
	);
}

module.exports = {
	checkCategoryAndGroup
};
