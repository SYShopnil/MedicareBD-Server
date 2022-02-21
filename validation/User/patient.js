const joi = require('joi');

//contactValidation
const contactValidation = joi.object({
    email: joi.string().required().regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
})

// personalInfoValidation
const personalInfoValidation = joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    contact: contactValidation
})

// profileImageValidation
const profileImageValidation = joi.object({
    base64: joi.string().required(),
    size: joi.number().required()
})

//main validation
const mainPatientValidation = joi.object({
    personalInfo: personalInfoValidation,
    password: joi.string().required().pattern(new RegExp ('^[a-zA-Z0-9]{6,30}$')),
    confirmPassword: joi.ref('password'),
    profileImage: profileImageValidation
})

module.exports = mainPatientValidation