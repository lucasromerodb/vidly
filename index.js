const express = require("express");
const app = express();

const Joi = require("@hapi/joi");

app.use(express.json());

const genres = [
  { id: 1, genre: "sports" },
  { id: 2, genre: "action" },
  { id: 3, genre: "adventure" }
];

// --- endpoints ---

app.get("/api/genres", (req, res) => {
  res.send(genres);
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
  genre.genre = req.body.name;
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
