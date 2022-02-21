const express = require('express');
const route = express.Router();

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization')

const {createAppointmentController,
    showTodaysAppointmentController,
    showALlAppointmentController,
    seeSevenDaysAppointment,
    updateAppointmentById,
    deleteAppointmentById,
    getAppointmentByIdController,
    appointmentPaymentSuccessController,
    paymentFailedController} = require('../../controller/Service/appointment')


//post  
route.post('/create', authentication, authorization(["patient"]),  authentication,  createAppointmentController)
route.post('/payment/success', appointmentPaymentSuccessController)
route.post('/payment/failed', paymentFailedController)


//put 
route.put('/update/:id', authentication, authorization(["admin"]), updateAppointmentById)
route.put('/delete/temporary/:id', authentication, authorization(["admin"]), deleteAppointmentById)


//get
route.get('/get/today/all', authentication, authorization(["admin", "doctor"]), showTodaysAppointmentController)
route.get('/get/all', authentication, authorization(["admin", "doctor"]), showALlAppointmentController)
route.get('/get/seven/days/all', authentication, authorization(["admin", "doctor"]), seeSevenDaysAppointment)
route.get('/get/individual/:id', authentication, authorization(["admin", "doctor", "patient"]), getAppointmentByIdController)

module.exports = route