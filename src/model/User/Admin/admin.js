const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema =  new Schema({
    personalInfo : {
        firstName: String, //need
        lastName: String, //need
        profileImage: String, //need
        contact:{
            email: {
                type: String,
                unique: true,
            }, //need
            number: [String] //need
        }
    },
    officialInfo: {
        category: [String], //need
        isDelete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    userId: String,
    password: String, //need
    userType: {
        type: String,
        default: "admin"
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



module.exports = mongoose.model('Admin', adminSchema)

