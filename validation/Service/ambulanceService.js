const Joi = require("joi");

// ambulanceInfoValidation
const ambulanceInfoValidation = Joi.object({
  registrationNo: Joi.string().required(),
});

// driverInfoValidation
const driverInfoValidation = Joi.object({
  name: Joi.string().required(),
  contactNumber: Joi.array().items(Joi.string()),
});

//ambulance main validation
const ambulanceMainValidation = Joi.object({
  ambulanceInfo: ambulanceInfoValidation,
  driverInfo: driverInfoValidation,
});

module.exports = ambulanceMainValidation;
