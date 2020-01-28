const debug = require("debug")("vidly:startup");
const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./middleware/logger.js");
const home = require("./routes/home");
const genres = require("./routes/genres");
const express = require("express");
const app = express();

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extend: true }));
app.use(express.static("public"));
app.use(helmet()); // Helps secure your apps by setting various HTTP headers.

app.use("/", home);
app.use("/api/genres", genres);

console.log("App name:", config.get("name"));
console.log("Mail server:", config.get("mail.host"));
console.log("Mail password:", config.get("mail.password"));

if (app.get("env") === "development") {
  app.use(morgan("tiny")); // HTTP request logger.
  debug("Morgan enabled...");
}

app.use(logger);

app.use(function(req, res, next) {
  console.log("Authenticating...");
  next();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listen on port ${port}`));
