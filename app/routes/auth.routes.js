module.exports = app => {
	const auth = require("../controllers/auth.controller.js");
    const checkAuth = require('../middleware/check-auth');
	var router = require("express").Router();


	router.post("/sign-in", auth.signIn );
	router.post("/sign-up", auth.signUp );
	router.post("/forgot-password", auth.forgetPassword );
	router.post("/reset-password", checkAuth, auth.resetPassword );
	router.post("/unlock-session", checkAuth, auth.signIn );
    router.post("/refresh-access-token", checkAuth, auth.refreshAccessToken );
	router.get("/get-user", checkAuth, auth.getLoggedInUser );

	app.use('/api/auth', router);
};
