const mongoose = require('mongoose');
const Schema = mongoose.Schema

const prescriptionSchema = new Schema({
    patientInfo: {
        personalInfo: {
            type: mongoose.Types.ObjectId,
            ref: "Appointment"
        } //need in the time of make a prescription
    }, 
    doctorInfo: {
        type: mongoose.Types.ObjectId,
        ref: "Doctor"
    }, //need in the time of create a new prescription
    prescriptionData: [
        {
           medicineName: String,
           amount: String,
           duration: String
        }
    ], //need
    // hospitalInfo: {
    //     type: mongoose.Types.ObjectId,
    //     ref: "Hospital"
    // }, //need in the time of create a new prescription
    other: {
        isDelete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        prescriptionId: {
            type: String
        }
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

module.exports = mongoose.model('Prescription', prescriptionSchema)