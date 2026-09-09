function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(422).json({ error: error.details[0].message });
    }
    req.validated = value;
    next();
  };
}

module.exports = { validateRequest };