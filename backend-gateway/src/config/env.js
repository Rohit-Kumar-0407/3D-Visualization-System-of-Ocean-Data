require("dotenv").config();

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,
  pythonServiceUrl: process.env.PYTHON_SERVICE_URL,
};