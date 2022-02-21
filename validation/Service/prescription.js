const Joi = require('joi');



// prescription Single Data Validation
const prescriptionSingleDataValidation = Joi.object({
    medicineName: Joi.string().required(),
    amount: Joi.string().required(),
    duration: Joi.string().required()
})

// prescription Data validation
const prescriptionDataValidation = Joi.array().items(prescriptionSingleDataValidation)

//main prescription validation 
const prescriptionMainValidation = Joi.object({
    appointmentId: Joi.string().required(),
    prescriptionData: prescriptionDataValidation,
    // hospitalUniqueId: Joi.string().required(),
    patientUserId: Joi.string().required(),
    // doctorId: Joi.string().required()
})


module.exports = prescriptionMainValidation