const Joi = require('joi')

// logoValidation
const logoValidation = Joi.object({
    base64: Joi.string().required(),
    size: Joi.number().required()
})

//hospital main validation
const hospitalMainValidation = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    district: Joi.string().required(),
    country: Joi.string().required(),
    email: Joi.string().required(),
    emergencyNumber: Joi.array().items(Joi.string()),
    logo: logoValidation
})


module.exports = hospitalMainValidation