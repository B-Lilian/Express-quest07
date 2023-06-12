// importe les variables d'environnements
require("dotenv").config();
// importe le module mysql pour communiquer avec la BDD
const mysql = require("mysql2/promise");

const database = mysql.createPool({
  host: process.env.DB_HOST, // address of the server
  port: process.env.DB_PORT, // port of the DB server (mysql), not to be confused with the express app PORT !
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
// test la connexion à la BDD
database
  .getConnection()
  .then(() => {
    console.log("Can reach database");
  })
  .catch((err) => {
    console.error(err);
  });
// exporte la connexion pool vers la BDD
module.exports = database;
