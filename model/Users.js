const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    numberBankAccount: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    isCustomer: {
        type: Number,
        default: 0,
    },
    isProvider: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments'
        }]
    },
    bills: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bills'
        }]
    },
    avatar: {
        type: String,
        default: ""
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model('Users', usersSchema);