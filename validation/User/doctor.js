const Joi = require('joi');

// contact Validation
const contactValidation = Joi.object({
    email: Joi.string().required().regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    number: Joi.array().items(Joi.string())
})

// personalInfo Validation
const personalInfoValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    sex: Joi.string().required(),
    contact: contactValidation
})

// profile Image Validation
const profileImageValidation = Joi.object({
    base64: Joi.string().required(),
    size: Joi.number().required()
})

const educationalHistoryDiscription = Joi.object({
    degreeName: Joi.string().required(),
    institute: Joi.string().required(),
    year: Joi.string().required()
})

const educationalHistoryValidation = Joi.array().items(educationalHistoryDiscription)

// category Validation
const categoryValidation = Joi.array().items(Joi.string())



// official Info Validation
const officialInfoValidation = Joi.object({
    educationalHistory: educationalHistoryValidation,
    category: categoryValidation,
    time: Joi.string()
})
//main validation of doctor
const doctorMainValidation = Joi.object({
    personalInfo: personalInfoValidation,
    profileImage: profileImageValidation,
    officialInfo: officialInfoValidation,
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    confirmPassword: Joi.ref("password")
})

module.exports = doctorMainValidation