// j'importe le module argon2
const argon2 = require("argon2");
// fonction asynchrone pour hacher le mot de passe
const hashPassword = async (req, res, next) => {
  try {
    // extrait le mdp de la requête
    const {password}= req.body;

    //options de hachage du mot de passe
    const hashingOptions = {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 1,
    };

    //j'utilise argon2 pour hacher le mot de passe
    const hashedPassword = await argon2.hash(password, hashingOptions);
    //modifier le corps de la requête pour inclure le mot de passe haché
    req.body.hashedPassword = hashedPassword;
    // supprime le mot de passe du corps de la requête
    delete req.body.password;
    // passe à la fonction middleware suivante
    next();
  } catch (error) {
    //gère les erreurs
    console.error(error);
    res.sendStatus(500);
  }
};
// j'exporte la fonction
module.exports = {
  hashPassword,
};
