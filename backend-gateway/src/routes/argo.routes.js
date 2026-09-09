const express = require("express");
const router = express.Router();
const { getArgoStations, getArgoProfile } = require("../controllers/argo.controller");
const { validateRequest } = require("../middleware/validateRequest");
const Joi = require("joi");

const bboxSchema = Joi.object({
  bbox: Joi.string().required(),
});

router.get("/stations", validateRequest(bboxSchema), getArgoStations);
router.get("/:stationId/profile", getArgoProfile);

module.exports = router;