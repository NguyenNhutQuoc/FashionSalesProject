const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    numberBankAccount: {
        type: String,
        default: '',
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