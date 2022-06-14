module.exports = app => {
	const pollinglocations = require("../controllers/pollinglocation.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.get("/list-pollinglocation-heads", checkAuth, pollinglocations.listPollingLocationHeads);
    router.get("/get-pollinglocation-details/:pollinglocationid", checkAuth, pollinglocations.getPollingLocationDetails);
    router.post("/update-pollinglocation-details", checkAuth, pollinglocations.updatePollingLocationDetails);

	app.use('/api/pollinglocations', router);
};
