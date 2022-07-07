const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://www.voogleapp.com"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Voogle" });
});

require("./app/routes/utils.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/appuser.routes")(app);
require("./app/routes/voter.routes")(app);
require("./app/routes/blockcode.routes")(app);
require("./app/routes/pollingstation.routes")(app);
require("./app/routes/pollinglocation.routes")(app);
require("./app/routes/pollingagent.routes")(app);
require("./app/routes/electoralarea.routes")(app);
require("./app/routes/report.routes")(app);
require("./app/routes/dashboard.routes")(app);

require("./app/routes/data.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
