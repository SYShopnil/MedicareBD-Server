const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
    userType: String,
    email: String,
    _id: String,
    userId: String
}) 

module.exports = mongoose.model("User", userSchema)