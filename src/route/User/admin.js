const express = require('express');
const route = express.Router();

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization')

const {createNewAdminController,
    getAllAdminController,
    getIndividualAdminByIdController,
    showThreeSuperAdminController} = require('../../controller/User/admin')

//post 
route.post('/create', createNewAdminController)

//get
route.get('/get/all' ,authentication, authorization(["admin"]), getAllAdminController)
route.get('/get/individual/:id',getIndividualAdminByIdController)
route.get('/get/three/superAdmin', showThreeSuperAdminController)

//export part 
module.exports = route

