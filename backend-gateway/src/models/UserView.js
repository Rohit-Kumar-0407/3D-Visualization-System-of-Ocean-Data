const mongoose = require("mongoose");

const userViewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  colorbarConfig: {
    palette: { type: String },
    min: { type: Number },
    max: { type: Number },
    scale: { type: String },
  },
  cameraPosition: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number },
  },
  selectedVariable: { type: String },
});

userViewSchema.index({ userId: 1 });

module.exports = mongoose.model("UserView", userViewSchema);