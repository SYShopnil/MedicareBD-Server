const mongoose = require('mongoose');
const Schema = mongoose.Schema

const appointmentSchema = new Schema({
    patientDetails: {
        name: String, //need
        age: Number, //need
        sex: {
            type: String,
            enum: ["male", "female", "others"]
        }, //need
        contactNumber: String //need
    },
    appointmentDetails: {
        appointmentDate: {
            type: Date,
            default: Date.now
        }, //need
        doctorDetails: {
            type: mongoose.Types.ObjectId,
            ref: "Doctor"
        }, //need in the time of create e new appointment
        appointmentId: String, 
        prescription: {
            type: mongoose.Types.ObjectId,
            ref: "Prescription"
        }, // need in the time of create a new prescription
        time: {
            type: String
        }
    },
    others: {
        isDelete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isPayment: {
            type: Boolean,
            default: false
        }
    },
    appointmentRequestUser: {
        type: mongoose.Types.ObjectId,
        ref: "Patient"
    }, //need in the time of create a new appointment
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

module.exports = mongoose.model('Appointment', appointmentSchema)