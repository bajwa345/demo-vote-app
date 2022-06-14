module.exports = app => {
	const utils = require("../controllers/utils.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

    router.get("/dd-paconstituencies", checkAuth, utils.ddListPaConstituencies);
    router.put("/dd-ucconstituencies", checkAuth, utils.ddListUcConstituencies);
	router.put("/dd-pollingstations", checkAuth, utils.ddListPollingStations);
	router.put("/dd-pollinglocations", checkAuth, utils.ddListPollingLocations);
	router.put("/dd-electoralareas", checkAuth, utils.ddListElectoralAreas);
	router.put("/dd-blockcodes", checkAuth, utils.ddListBlockcodes);

	app.use('/api/utils', router);
};
