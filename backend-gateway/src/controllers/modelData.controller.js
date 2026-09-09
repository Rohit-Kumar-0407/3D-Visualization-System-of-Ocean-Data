const pythonService = require("../services/pythonService.client");

exports.getModelData = async (req, res, next) => {
  try {
    const { variable, depth, time } = req.query;
    const data = await pythonService.fetchModelData(variable, depth, time);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getTimesteps = async (req, res, next) => {
  try {
    const { variable } = req.query;
    const data = await pythonService.fetchTimesteps(variable);
    res.json(data);
  } catch (err) {
    next(err);
  }
};