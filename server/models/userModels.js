const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
    email_address:{
        type: String,
        required: true,
        unique: true,
    },
    full_name:{
        type: String,
        required:true,
    },
    phone_number:{
        type: String,
        required:false,
        unique:true
    },
    password:{
        type:String,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    accessToken: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model('User', userSchema);