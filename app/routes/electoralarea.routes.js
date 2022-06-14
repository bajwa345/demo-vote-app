module.exports = app => {
	const electoralareas = require("../controllers/electoralarea.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.get("/listall-electoralareas", checkAuth, electoralareas.listAllElectoralAreas);
    router.get("/get-electoralarea-details/:electoralareaid", checkAuth, electoralareas.getElectoralAreaDetails);

	app.use('/api/electoralareas', router);
};
