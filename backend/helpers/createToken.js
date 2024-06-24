const jwt = require("jsonwebtoken");

// Object containing methods to create different types of tokens
const createToken = {
  // Method to create an activation token
  activation: (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN, { expiresIn: "5m" });
  },
  // Method to create a refresh token
  refresh: (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "24h" });
  },
  // Method to create an access token
  access: (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
  },
};

module.exports = createToken;
