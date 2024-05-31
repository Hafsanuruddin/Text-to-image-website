require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  jwtSecretKey: process.env.JWT_SECRET
};
