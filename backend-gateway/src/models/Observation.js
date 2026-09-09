const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema({
  stationId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  depth: { type: Number, required: true },
  temperature: { type: Number },
  salinity: { type: Number },
  chlorophyll: { type: Number },
});

observationSchema.index({ stationId: 1, timestamp: -1 });

module.exports = mongoose.model("Observation", observationSchema);