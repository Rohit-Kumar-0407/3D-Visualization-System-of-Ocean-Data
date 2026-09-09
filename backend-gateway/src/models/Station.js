const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  instrumentType: {
    type: String,
    enum: ["argo", "glider", "ctd"],
    required: true,
  },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  deployedAt: { type: Date },
  lastUpdated: { type: Date },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

stationSchema.index({ stationId: 1 });
stationSchema.index({ instrumentType: 1, status: 1 });

module.exports = mongoose.model("Station", stationSchema);