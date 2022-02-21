const Joi = require('joi');

//main Validation of company contact form 
const contactFormMainValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required().regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    message: Joi.string().required()
})

module.exports = contactFormMainValidation