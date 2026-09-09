const express = require("express");
const router = express.Router();
const { saveView, getViews } = require("../controllers/userViews.controller");
const { validateRequest } = require("../middleware/validateRequest");
const Joi = require("joi");

const saveViewSchema = Joi.object({
  userId: Joi.string().required(),
  colorbarConfig: Joi.object({
    palette: Joi.string(),
    min: Joi.number(),
    max: Joi.number(),
    scale: Joi.string(),
  }),
  cameraPosition: Joi.object({
    x: Joi.number(),
    y: Joi.number(),
    z: Joi.number(),
  }),
  selectedVariable: Joi.string(),
});

router.post("/", validateRequest(saveViewSchema), saveView);
router.get("/:userId", getViews);

module.exports = router;