const Joi = require('joi')

// patient Details Validation
const patientDetailsValidation = Joi.object({
    name: Joi.string().required(),
    age: Joi.string().required(),
    sex: Joi.string().required(),
    contactNumber: Joi.string().required()
})

//main appointmentMainValidation Validation
const appointmentMainValidation = Joi.object({
    patientDetails: patientDetailsValidation,
    appointmentDate: Joi.date().required(),
    doctorId: Joi.string().required(),
    fees: Joi.string().required(),
    time: Joi.string().required()
})

module.exports = appointmentMainValidation

