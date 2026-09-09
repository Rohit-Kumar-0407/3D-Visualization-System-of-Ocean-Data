const express = require("express");
const router = express.Router();
const { getModelData, getTimesteps } = require("../controllers/modelData.controller");
const { validateRequest } = require("../middleware/validateRequest");
const Joi = require("joi");

const querySchema = Joi.object({
  variable: Joi.string().required(),
  depth: Joi.number().required(),
  time: Joi.string().isoDate().required(),
});

router.get("/", validateRequest(querySchema), getModelData);
router.get("/timesteps", async (req, res, next) => {
  try {
    const { variable } = req.query;
    if (!variable) {
      return res.status(400).json({ error: "variable is required" });
    }
    await getTimesteps(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;