const iauth = require("../config/auth.js");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = iauth._decodeToken(token);
    req.userData = {username: decodedToken.username, userId: decodedToken.usid, canId: decodedToken.cnid};
    next();
  } catch (error) {
      console.log(error);
    res.status(401).json({ message: "Invalid authentication credential" });
  }
};
