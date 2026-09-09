const mongoose = require("mongoose");

const modelRunSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
  variable: { type: String, required: true },
  timeStep: { type: String, required: true },
  filePath: { type: String, required: true },
  boundingBox: {
    minLat: { type: Number },
    maxLat: { type: Number },
    minLon: { type: Number },
    maxLon: { type: Number },
  },
  resolution: { type: Number },
});

modelRunSchema.index({ modelName: 1, variable: 1 });
modelRunSchema.index({ timeStep: 1 });

module.exports = mongoose.model("ModelRun", modelRunSchema);