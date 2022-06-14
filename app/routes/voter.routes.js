module.exports = app => {
	const voters = require("../controllers/voter.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();

	router.put("/list-voters", checkAuth, voters.listVoters);
	router.get("/get-voter-name-image/:icnic", checkAuth, voters.getVoterNameImage);
	router.get("/get-voter-address-image/:icnic", checkAuth, voters.getVoterAddressImage);
    router.get("/get-voter-basic-details/:icnic", checkAuth, voters.getVoterBasicDetails);
	router.post("/update-voter-details", checkAuth, voters.updateVoterDetails);
    router.post("/pdf-voter-parchi", checkAuth, voters.downloadVoterParchiPdf);

	app.use('/api/voters', router);
};
