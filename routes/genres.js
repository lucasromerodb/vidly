const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// create schema
// create instance

const courseSchema = new mongoose.Schema({
  genre: { type: String, minlength: 3, maxlength: 50, trim: true, required: true }
});

const Genre = mongoose.model("Genre", courseSchema);

// const genres = [
//   { id: 1, genre: "sports" },
//   { id: 2, genre: "action" },
//   { id: 3, genre: "adventure" }
// ];

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const genre = await Genre.findById(id);

  // Look up (if not existing return 404 - not found)
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  res.send(genre);
});

router.post("/", async (req, res) => {
  // validate
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Send
  let newGenre = new Genre({ genre: req.body.genre });

  newGenre = await newGenre.save();

  res.send(newGenre);
});

router.put("/:id", async (req, res) => {
  // validate (if invalid return 400 - bad request)
  const isValid = validateGenre(req.body.genre);
  if (!isValid) {
    return res.status(400).send(isValid.details[0].message);
  }

  const id = req.params.id;
  const genre = await Genre.findByIdAndUpdate(id, { genre: req.body.genre }, { new: true });

  // Look up (if not existing return 404 - not found)
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  // Send (return updated)
  res.send(genre);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const genre = await Genre.findByIdAndRemove(id);

  // look up
  if (!genre) {
    return res.status(404).send("Género no encontrado");
  }

  // send
  res.send(genres);
});

function validateGenre(genre) {
  const schema = {
    genre: Joi.string()
      .min(5)
      .required()
  };

  return Joi.validate(genre, schema);
}

module.exports = router;
