const express = require('express');
const route = express.Router();

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization')

const {createAmbulanceServiceController,
    updateAmbulanceServiceByIdController,
    deleteAmbulanceServiceById,
    showAllAmbulanceServiceController,
    makeAmbulanceServiceController,
    getAllUnapprovedAmbulanceServiceController,
    approvePendingAmbulanceServiceRequestController} = require('../../controller/Service/ambulanceService')

//post 
route.post('/create', authentication, authorization(["admin"]), createAmbulanceServiceController)
route.post('/make/new/service', authentication, authorization(["patient"]), makeAmbulanceServiceController)


//put
route.put('/update/:id', authentication, authorization(["admin"]), updateAmbulanceServiceByIdController)
route.put('/delete/temporary/:id', authentication, authorization(["admin"]), deleteAmbulanceServiceById)
route.put('/request/approved/:id', authentication, authorization(["admin"]), approvePendingAmbulanceServiceRequestController)

//get
route.get('/get/all', showAllAmbulanceServiceController)
route.get('/get/all/unApproved/request', authentication, authorization(["admin"]), getAllUnapprovedAmbulanceServiceController)
//export part 
module.exports = route