module.exports = app => {
	const pollingstations = require("../controllers/pollingstation.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.put("/list-pollingstations", checkAuth, pollingstations.listPollingStations);
    router.get("/get-pollingstation-details/:pollingstationid", checkAuth, pollingstations.getPollingStationDetails);
    router.post("/update-pollingstation-details", checkAuth, pollingstations.updatePollingStationDetails);

	app.use('/api/pollingstations', router);
};
