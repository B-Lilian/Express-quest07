const database = require("./database");

// je récupère les utilisateurs
const getUsers = (req, res) => {
  const initialSql = "select * from users";
  const where = [];

  // je vérifie que le param "city" est bien dans la requête
  if (req.query.city != null) {
    where.push({
      column: "city",
      value: req.query.city,
      operator: "=",
    });
  }

  //je vérifié que le param "language" est bien dans la requête
  if (req.query.language != null) {
    where.push({
      column: "language",
      value: req.query.language,
      operator: "=",
    });
  }

  // reqûete SQL
  database
    .query(
      where.reduce(
        (sql, { column, operator }, index) =>
          `${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
        initialSql
      ),
      where.map(({ value }) => value)
    )
    .then(([users]) => {
      // renvoie les utilisateurs au format json
      res.json(users);
    })
    //s'occupe des erreurs de recup de données depuis BDD
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};
// récupère un user par son id
const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  
// requête SQL
  database
    .query("select id, firstname, lastname, email, city, language from users where id = ?", [id])
    .then(([users]) => {
      if (users[0] != null) {
        //utilisateur trouvé = renvoyé format json
        res.json(users[0]);
      } else {
        //utilisateur non trouvé = err 404
        res.status(404).send("Not Found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};
// Ajoute un nouvel user
const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } =
    req.body;
// requête pour insérer new user dans la BDD
  database
    .query(
      "INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      //renvoie le statut 201 = utilisateur crée
      res.location(`/api/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      // erreurs lors de l'ajout d'un nouvel utilisateur
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};
// met à jour un user existant
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { firstname, lastname, email, city, language, hashedPassword } = req.body;
//Requête SQL pour mettre à jour un user
  database
    .query(
      "update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?, hashedPassword = ? where id = ?",
      [firstname, lastname, email, city, language,hashedPassword, id]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        // si pas d'utilisateur affecté = erreur 404
        res.status(404).send("Not Found");
      } else {
        // mise à jour de user réussi
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      //gère les erreurs lors de la modif d'un user dans la BDD
      console.error(err);
      res.status(500).send("Error editing the user");
    });
};
// commande SQL pour supprimer un user
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("delete from users where id = ?", [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        //si aucun utilisateur affecté = erreur 404
        res.status(404).send("Not Found");
      } else {
        // suppression réussi = statut 204 (no content)
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      // gère les erreurs de supression d'utilisateur
      res.status(500).send("Error deleting the user");
    });
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next)=>{
  const {email} = req.body;
  database
  .query("select * from users where email = ?", [email])
  .then(([users])=>{
    if (users[0] != null) {
      req.user = users[0];
      next();
    }else{
      res.sendStatus(401);
    }
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send("Error retrieving data from database");
  });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
  getUserByEmailWithPasswordAndPassToNext
};
