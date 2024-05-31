const Joi = require('joi');

const schema = Joi.object({
  iexecOut: Joi.string().required(),
  firstHalfPrivateKey: Joi.string().required(),
  secondHalfPrivateKey: Joi.string().required(),
});

function validateInputs(envVars) {
  const { error, value } = schema.validate(envVars, { abortEarly: false });
  if (error) {
    const validationErrors = error.details.map((detail) => detail.message);
    throw new Error(validationErrors.join('; '));
  }
  return value;
}

module.exports = validateInputs;
