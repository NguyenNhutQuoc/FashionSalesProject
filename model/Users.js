const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)

const usersSchema = new mongoose.Schema({
    id: {
        type: String,
    },
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
    password: {
        type: String,
        default: '',
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments',
        }]
    },
    bills: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bills',
        }]
    },
    avatar: {
        type: String,
        default: ""
    },
    actions: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Actions',
            }
        ]
    }
},
    {
        timestamps: true
    })
usersSchema.plugin(require('mongoose-autopopulate'));
usersSchema.plugin(require('mongoose-paginate-v2'))
module.exports = mongoose.model('Users', usersSchema);