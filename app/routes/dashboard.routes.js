module.exports = app => {
	const dashboard = require("../controllers/dashboard.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.get("/data-dashboard", checkAuth, dashboard.getDashboardData);

	app.use('/api/dashboard', router);
};
