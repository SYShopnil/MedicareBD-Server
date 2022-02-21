const express = require('express');
const route = express.Router();
const {makeContactFormForMedicare} = require('../../controller/Service/company')

const authentication = require('../../../middleware/auth/authentication');
const authorization = require('../../../middleware/auth/authorization')

//post
route.post("/contact/us", makeContactFormForMedicare)

//export part 
module.exports = route