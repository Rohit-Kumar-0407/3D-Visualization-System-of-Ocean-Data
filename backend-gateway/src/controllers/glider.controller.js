const Station = require("../models/Station");

exports.getGliderStations = async (req, res, next) => {
  try {
    const stations = await Station.find({ instrumentType: "glider", status: "active" });
    res.json(stations);
  } catch (err) {
    next(err);
  }
};