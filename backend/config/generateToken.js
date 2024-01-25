const jwt = require("jsonwebtoken");
const env = require("dotenv");

env.config();
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SEC, {
    expiresIn: "4d", // expires in 24 hours
  });
};

module.exports = generateToken;
