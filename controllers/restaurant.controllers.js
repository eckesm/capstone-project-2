var RestaurantService = require('../services/restaurant.services');
const { checkUserIsRestAccess } = require('../helpers/checkAccess');

exports.getRestaurant = async function(req, res, next) {
	try {
		const userId = res.locals.user.id;
		const restaurantId = req.params.id;

		// Check that user is admin for restaurant
		const checkAccess = await checkUserIsRestAccess(restaurantId, userId);
		if (checkAccess.status) {
			var restaurant = await RestaurantService.getRestaurant(restaurantId);
			return res.status(200).json({ status: 'success', restaurant, message: checkAccess.message });
		}
		else {
			return res.status(400).json({ status: 'fail', message: checkAccess.message });
		}
	} catch (err) {
		return res.status(400).json({ status: 400, message: err.message });
	}
};
//
