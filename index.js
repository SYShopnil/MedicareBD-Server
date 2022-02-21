//required part
const express = require("express");
const app = express()
require('dotenv').config();
const mongoose = require("mongoose");
const cors = require('cors')
const patientRoute = require('./src/route/User/patient')
const userRoute = require('./src/route/User/user')
const doctorRoute = require('./src/route/User/doctor')
const adminRoute = require('./src/route/User/admin')
const ambulanceServiceRoute = require('./src/route/Service/ambulanceService')
const bloodBankServiceRoute = require('./src/route/Service/bloodBankService')
const oxygenCylenderRoute = require('./src/route/Service/oxygenCylender')
const appointmentRoute = require('./src/route/Service/appointment')
const moment = require('moment')
const prescriptionRoute = require('./src/route/Service/prescription')
const companyRoute = require('./src/route/Service/company')

//dot env part
const port = process.env.PORT || 8080 //get the port from .env file
const urlOfMongo = process.env.URL //get the mongo url from .env file

//pase the body the global middleware part
app.use(express.json({limit: "250mb"}));
app.use(express.urlencoded({ extended: true, limit: '250mb'}));
app.use(express.static('public'))
app.use(cors())

//create the server 
app.listen(port, () => {console.log(`Server is running on ${port}`)})

//connected to the database
mongoose.connect(urlOfMongo, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {console.log(`Server is conntected to the data base`);})
.catch(err => {console.log(err);})

//root route
app.get("/", (req, res) => {
    res.send("Hello I am from root")
})

//other's route
app.use('/patient', patientRoute)
app.use('/user', userRoute)
app.use('/doctor', doctorRoute)
app.use('/admin', adminRoute)
app.use('/ambulanceService', ambulanceServiceRoute)
app.use('/bloodBankService', bloodBankServiceRoute)
app.use('/oxygenCylinder', oxygenCylenderRoute)
app.use('/appointment', appointmentRoute)
app.use('/prescription', prescriptionRoute)
app.use('/company', companyRoute)

//default route
app.get("*", (req, res) => {
    res.status(404).send("404 page not found")
});


