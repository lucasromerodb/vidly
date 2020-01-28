const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();

const genres = [
  { id: 1, genre: "sports" },
  { id: 2, genre: "action" },
  { id: 3, genre: "adventure" }
];

router.get("/", (req, res) => {
  res.send(genres);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const genre = genres.find(i => i.id === id);
  // Look up (if not existing return 404 - not found)
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  res.send(genre);
});

router.post("/", (req, res) => {
  // validate
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Send
  const newGenre = { id: genres.length + 1, genre: req.body.genre };
  genres.push(newGenre);
  res.send(genres);
});

router.put("/:id", (req, res) => {
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

router.delete("/:id", (req, res) => {
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

function validateGenre(genre) {
  const schema = {
    genre: Joi.string()
      .min(3)
      .required()
  };

  return Joi.validate(genre, schema);
}

module.exports = router;
