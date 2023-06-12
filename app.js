// charge les variables d'envrionnement à partir de .env
require("dotenv").config();

const express = require("express");
const app = express();
// utilse le middleware pour analyser les données au format JSON
app.use(express.json());

// j'importe les modules et gestionnaires de routes
const { hashPassword } = require("./auth");
const userHandlers = require("./userHandlers");
const movieHandlers = require("./movieHandlers");

//je défini sur quel port écouter mon app
const port = process.env.APP_PORT ?? 5000;

// route pour la page d'accueil
const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);


//gère les routes pour les films
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

//gère les routes pour les users
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);
app.post("/api/users",hashPassword, userHandlers.postUser);
app.put("/api/users/:id",hashPassword, userHandlers.updateUser);
app.delete("/api/users/:id", userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
