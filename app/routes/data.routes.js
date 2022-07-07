module.exports = app => {
	const data = require("../controllers/data.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.post("/app-sign-in", data.appSignIn );
	router.post("/app-sign-up", data.appSignUp );
	router.post("/app-change-password", data.appChangePassword );
	router.post("/app-forget-password", data.appForgetPassword );
	router.post("/upload-voter-phones", data.updateVoterPhones );
	router.post("/upload-voter-location", data.updateVoterLocation );
	router.post("/upload-complaint-report", data.reportComplaint );
	router.get("/download-blockcode-voters/:blockcode", data.downloadBlockcodeVotersData);
	router.get("/download-family-voters/:cnic", data.downloadFamilyVotersDataByCnic);
    router.get("/download-blockcode-list/:userid", data.downloadBlockcodeListData);
    router.get("/download-pollinglocation-list/:userid", data.downloadPollingLocationListData);

	app.use('/api/data', router);
};
