const mongoose = require("mongoose")
const Schema = mongoose.Schema

const patientSchema = new Schema({
    personalInfo : {
        firstName: String, //need
        lastName: String, //need
        profileImage: String, //need
        contact:{
            email: {
                type: String,
                unique: true,
            } //need
        } 
    },
    officialInfo: {
        isActive: {
            type: Boolean,
            default: true
        },
        isDelete: {
            type: Boolean,
            default: false
        },
        checkUpHistory: {
            prescription: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: "Prescription"
                } //make  a relation with prescription schema by storing prescription object id
            ], //need in the time of create a prescription
            appointment: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: "Appointment"
                }
            ] //need in the time of make a new appointment
        }
    },
    userId: String, 
    password: String, //need
    userType: {
        type: String,
        default: "patient"
    },
    recoveryToken: {
        type: String,
        default: ""
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



module.exports = mongoose.model("Patient", patientSchema)


