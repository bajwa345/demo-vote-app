module.exports = app => {
	const pollingagents = require("../controllers/pollingagent.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.put("/list-pollingagents", checkAuth, pollingagents.listPollingAgents);
	router.get("/get-pollingagents-list/:pollingstationid", checkAuth, pollingagents.getPollingAgentsList);
    router.post("/update-pollingagents", checkAuth, pollingagents.updatePollingAgents);

	app.use('/api/pollingagents', router);
};
