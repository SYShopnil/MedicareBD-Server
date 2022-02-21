const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bloodBankSchema = new Schema({
    stockInfo: {
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
            unique: true
        }, //need
        availableAmount: Number //need
    }, //n
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

module.exports = mongoose.model('BloodBank', bloodBankSchema);