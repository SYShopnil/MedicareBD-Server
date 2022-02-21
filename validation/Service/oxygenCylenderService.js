const Joi = require('joi');

//main oxygen cylinder validation
const mainOxygenCylinderValidation = Joi.object({
    amount: Joi.number().required()
}) 

module.exports = mainOxygenCylinderValidation