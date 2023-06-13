// j'importe les modules argon2 et jsonwebtoken
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
// fonction asynchrone pour hacher le mot de passe
const hashPassword = async (req, res, next) => {
  try {
    // extrait le mdp de la requête
    const { password } = req.body;

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

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
const verifyPassword = async (req, res) => {
  try {
    const isVerified = await argon2.verify(
      req.user.hashedPassword,
      req.body.password
    );

    if (isVerified) {
      const payload = { sub: req.user.id };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      delete req.user.hashedPassword;
      res.send({ token, user: req.user });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }

    req.payload = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  verifyToken, 
};
