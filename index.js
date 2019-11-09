const debug = require("debug")("vidly:startup");
const dbDebugger = require("debug")("vidly:db");
const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const Joi = require("@hapi/joi");
const logger = require("./logger.js");
const express = require("express");
const app = express();

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extend: true }));
app.use(express.static("public"));
app.use(helmet()); // Helps secure your apps by setting various HTTP headers.

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

const genres = [
  { id: 1, genre: "sports" },
  { id: 2, genre: "action" },
  { id: 3, genre: "adventure" }
];

// --- endpoints ---

app.get("/", (req, res) => {
  res.render("index", { title: "Vidly", message: "Welcome to Vidly" });
});

app.get("/api/genres", (req, res) => {
  res.send(genres);
});

app.get("/api/genres/:id", (req, res) => {
  const id = Number(req.params.id);
  const genre = genres.find(i => i.id === id);
  // Look up (if not existing return 404 - not found)
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  res.send(genre);
});

app.post("/api/genres", (req, res) => {
  // validate
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Send
  const newGenre = { id: genres.length + 1, genre: req.body.genre };
  genres.push(newGenre);
  res.send(genres);
});

app.put("/api/genres/:id", (req, res) => {
  const id = Number(req.params.id);
  const genre = genres.find(i => i.id === id);
  // Look up (if not existing return 404 - not found)
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  // validate (if invalid return 400 - bad request)
  const isValid = validateGenre(req.body);
  if (!isValid) {
    return res.status(400).send(isValid.details[0].message);
  }

  // Send (return updated)
  genre.genre = req.body.genre;
  res.send(genre);
});

app.delete("/api/genres/:id", (req, res) => {
  const id = Number(req.params.id);
  const genre = genres.find(i => i.id === id);

  // look up
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  // delete
  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  // send
  res.send(genres);
});

// --- Helpers ---
function validateGenre(genre) {
  const schema = {
    genre: Joi.string()
      .min(3)
      .required()
  };

  return Joi.validate(genre, schema);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listen on port ${port}`));
