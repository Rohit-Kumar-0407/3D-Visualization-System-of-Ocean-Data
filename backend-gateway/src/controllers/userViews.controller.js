const UserView = require("../models/UserView");

exports.saveView = async (req, res, next) => {
  try {
    const viewData = req.body;
    const view = new UserView(viewData);
    await view.save();
    res.status(201).json(view);
  } catch (err) {
    next(err);
  }
};

exports.getViews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const views = await UserView.find({ userId });
    res.json(views);
  } catch (err) {
    next(err);
  }
};