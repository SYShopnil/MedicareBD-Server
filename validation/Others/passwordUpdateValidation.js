const Joi = require('joi')

//main password update Validation for existing password update
const existingPasswordValidation = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    confirmPassword: Joi.ref("newPassword")
})

//password  validation for reset password 
const resetPasswordValidation = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    confirmPassword: Joi.ref("newPassword")
})

module.exports = {
    existingPasswordValidation,
    resetPasswordValidation
}