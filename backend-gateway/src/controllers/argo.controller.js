const Station = require("../models/Station");
const Observation = require("../models/Observation");

exports.getArgoStations = async (req, res, next) => {
  try {
    const { bbox } = req.query;
    const [minLat, minLon, maxLat, maxLon] = bbox.split(",").map(Number);
    const stations = await Station.find({
      instrumentType: "argo",
      lat: { $gte: minLat, $lte: maxLat },
      lon: { $gte: minLon, $lte: maxLon },
      status: "active",
    });
    res.json(stations);
  } catch (err) {
    next(err);
  }
};

exports.getArgoProfile = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findOne({ stationId });
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }
    const profile = await Observation.find({ stationId }).sort({ depth: 1 });
    res.json({ station, profile });
  } catch (err) {
    next(err);
  }
};