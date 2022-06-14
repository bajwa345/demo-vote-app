module.exports = app => {
	const report = require("../controllers/report.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.get("/report-foodincharge", checkAuth, report.reportFoodIncharge);
	router.get("/report-transportincharge", checkAuth, report.reportTransportIncharge);
	router.get("/report-voterreachability", checkAuth, report.reportVoterReachability);
	router.get("/report-workerscampaignsummary", checkAuth, report.reportWorkersCampaignSummary);
    router.post("/update-foodincharge-details", checkAuth, report.updateFoodInchargeDetails);

	app.use('/api/reports', router);
};
