const Joi = require('joi')


// stockInfoValidation
const stockInfoValidation = Joi.object({
    bloodGroup: Joi.string().required(),
    availableAmount: Joi.number().required()
})

//main bloodBank validation
const bloodBankMainValidation = Joi.object({
    stockInfo: stockInfoValidation
})

module.exports = bloodBankMainValidation