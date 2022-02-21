const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ambulanceServiceSchema = new Schema ({
    ambulanceInfo: {
        ambulanceNo: Number, 
        registrationNo: String //need
    }, 
    driverInfo: {
        name: String, //need
        contactNumber: [String] //need
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
})

module.exports = mongoose.model('AmbulanceService', ambulanceServiceSchema)