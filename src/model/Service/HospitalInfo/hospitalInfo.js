const mongoose = require('mongoose');
const Schema = mongoose.Schema

const hospitalSchema = new Schema({
    hospitalInfo: {
        name: String, //need
        address: String, //need
        district: String, //need
        country: String, //need
        appointmentNumber: [String], //need
        email: [String], //need
        emergencyNumber: [String], //need
        logo: String //need
    },
    modificationInfo:{
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt:{
            type: Date,
            default: Date.now
        }
    }
})

module.exports = mongoose.model('Hospital', hospitalSchema)