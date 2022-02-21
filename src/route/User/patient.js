const express = require('express');
const route = express.Router();
const {patientCreateController,
    seeAllPatientController,
    seePatientByIdController,
    deleteTemporaryPatientById,
    seeHisPrescriptionController} = require('../../controller/User/patient')

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization')

//my patient route

//post
route.post('/create', patientCreateController)

//put
route.get('/delete/temporary/:id', authentication, authorization(["admin"]), deleteTemporaryPatientById)

//get
route.get('/get/all', authentication, authorization(["admin", "doctor"]), seeAllPatientController)
route.get('/get/individual/:id',authentication, authorization(["admin", "doctor"]), seePatientByIdController)
route.get('/get/own/prescription', authentication, authorization(["patient"]), seeHisPrescriptionController)

//export part 
module.exports = route