const mongoose = require('mongoose')
const Schema = mongoose.Schema

const doctorSchema =  new Schema({
    personalInfo : {
        firstName: String,  //need
        lastName: String, //need
        profileImage: String, //need
        sex: {
            type: String,
            enum: ["male", "female", "others"]
        }, //need
        contact:{
            email: {
                type: String,
                unique: true,
            }, //need
            number: [String] //need
        }
    },
    officialInfo: {
        checkUpHistory: {
            appointment: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: "Appointment"
                }
            ] //need in the time of make a new  appointment
        },
        educationalHistory: [
            {
                degreeName: String,
                institute: String,
                year: String
            }
        ], //need
        category: [String], //need
        isActive: {
            type: Boolean,
            default: true
        },
        isDelete: {
            type: Boolean,
            default: false
        },
        fees: {
            type: String,
            default: "300"
        },
        time: {
            type: String
        }
    },
    userId: String, 
    password: String, //need
    userType: {
        type: String,
        default: "doctor"
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



module.exports = mongoose.model('Doctor', doctorSchema)

