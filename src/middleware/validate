const { createSchema } = require("express-joi-validation");

const validateResource = (schema) => {
  const validator = createSchema(schema);

  return (req, res, next) => {
    const { error } = validator.validate(req);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
};

export default validateResource;
