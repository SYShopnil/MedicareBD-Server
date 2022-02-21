const mongoose = require('mongoose');
const Schema = mongoose.Schema

const transactionSchema = new Schema({
    transictionDetails : {
        trxId: String,
        netAmount: String,
        getAmount: String,
        cardType: String,
        bankTxdId: String,
        txDate: String,
        cardBrand: String,
        store_id: String
    },
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: "Appointment"
    }
},{
    timestamps: true
})

module.exports = mongoose.model ("Transiction", transactionSchema )