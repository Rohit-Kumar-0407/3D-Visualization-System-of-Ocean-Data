const mongoose = require("mongoose");
const config = require("../config/env");

async function connectMongo() {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");
}

module.exports = { connectMongo };