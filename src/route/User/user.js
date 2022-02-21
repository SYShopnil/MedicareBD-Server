const express = require('express');
const route = express.Router();

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization')
const {userLoginController,
    updateExistingPasswordController,
    forgotPasswordController,
    verifyOtpOfResetPasswordController,
    resetPasswordController,
    SeeOnlyHisAppointment,
    seeOwnProfileController,
    updateOwnProfileController,
    updateProfilePictureAndDeleteExistOneController} = require('../../controller/User/user')

//all user route 

//post
route.post('/login', userLoginController)
route.post('/update/password', authentication, authorization(["admin", "doctor", "patient"]), updateExistingPasswordController)
route.post('/forgot/password', forgotPasswordController)
route.post('/verify/email', verifyOtpOfResetPasswordController)
route.post('/reset/password', resetPasswordController)
route.post('/own/profile/update', authentication, authorization(["admin", "doctor", "patient"]), updateOwnProfileController)
route.post('/own/profile/picture/update', authentication, authorization(["admin", "doctor", "patient"]), updateProfilePictureAndDeleteExistOneController)

//get 
route.get('/get/own/appointment',authentication, authorization([ "doctor" , "patient"]), SeeOnlyHisAppointment )
route.get('/get/own/profile', authentication, authorization(["admin", "doctor", "patient"]), seeOwnProfileController )



//export part
module.exports = route