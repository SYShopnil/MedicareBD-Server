const mongoose = require('mongoose');
const Schema = mongoose.Schema

const oxygenCylinderSchema = new Schema({
   amount: {
       type: Number,
       default: 0
   }, //need
   other: {
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

module.exports = mongoose.model('OxygenCylinder', oxygenCylinderSchema)