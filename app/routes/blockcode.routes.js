module.exports = app => {
	const blockcodes = require("../controllers/blockcode.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.put("/list-blockcodes", checkAuth, blockcodes.listBlockCodes);
	router.get("/get-blockcode-details/:blockcode", checkAuth, blockcodes.getBlockCodeDetails);

	app.use('/api/blockcodes', router);
};
