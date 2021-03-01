const mongoose = require('mongoose')




const userSchema = new mongoose.Schema({
    username: {
        type: String, trim: true, required: true, maxLength: 32, unique: true, index:true, lowercase:true
    },
    name: {
        type: String, trim: true, required: true, maxLength: 32, unique: true, index: true,
    },

    email: {
        type: String, trim: true, required: true, unique: true, lowercase: true
    },
    profile: {
        type: String, required: false
    },
    password: {
        type: String, required: true
    },

    role: {
        type: Number, default: 0
    },
    photo: {
        data: Buffer, contentType: String
    },
    resetPasswordLink: {
        data: String,
        default: ''
    },


}, { timestamps:  true })





module.exports = mongoose.model('User', userSchema);
