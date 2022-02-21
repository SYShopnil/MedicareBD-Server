const Joi = require('joi')

// contact Validation
const contactValidation = Joi.object({
    email: Joi.string().required().regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    number: Joi.array().items(Joi.string())
})

// personalInfo Validation
const personalInfoValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    contact: contactValidation
})

// profile Image Validation
const profileImageValidation = Joi.object({
    base64: Joi.string().required(),
    size: Joi.number().required()
})



// officialInfoValidation
const officialInfoValidation = Joi.object({
    category: Joi.array().items(Joi.string()).required()
})

//main validation for admin 
const adminValidation = Joi.object({
    personalInfo: personalInfoValidation,
    profileImage: profileImageValidation,
    officialInfo: officialInfoValidation,
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    confirmPassword: Joi.ref("password")
})

module.exports = adminValidation
