const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bloodBankRequestSchema = new Schema({
    requestUseInfo : {
        name: {
            type: String,
            required: true,
        },
        contactInfo : {
             email: {
                type: String,
                required: true,
            },
            contactNumber : {
                type: String,
                required: true,
            }
        },
        reqUserInfo : {
            ref: "Patient",
            type: mongoose.Types.ObjectId,
            required: true,
        }
    }, 
    requestInfo: {
        bloodGroup: {
            type: String,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        isApproved : {
            type: Boolean,
            default: false
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
});

module.exports = mongoose.model('BloodBankRequest', bloodBankRequestSchema);