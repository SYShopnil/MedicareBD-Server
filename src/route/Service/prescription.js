const express = require('express');
const route = express.Router();

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization') 

const {createPrescriptionController,
    updatePrescriptionByIdController,
    deletePrescriptionByIdController,
    getPrescriptionById} = require('../../controller/Service/prescription')

//post  
route.post('/create', authentication, authorization(["doctor"]), createPrescriptionController)

//put
route.put('/update/information/:id', authentication, authorization(["doctor"]), updatePrescriptionByIdController)
route.put('/delete/permanent/:id', authentication, authorization(["admin", "doctor"]), deletePrescriptionByIdController)

//get 
route.get('/get/:id', authentication, authorization(["admin", "patient", "doctor"]), getPrescriptionById)

//export part 
module.exports = route
