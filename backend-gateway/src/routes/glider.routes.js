const express = require("express");
const router = express.Router();
const { getGliderStations } = require("../controllers/glider.controller");

router.get("/stations", getGliderStations);

module.exports = router;