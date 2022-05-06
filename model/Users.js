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
    'date-of-birth': {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    'number-bank-account': {
        type: String,
        required: true
    },
    'is-admin': {
        type: Number,
        default: 0
    },
    'is-customer': {
        type: Number,
        default: 0,
    },
    'is-provider': {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
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
    }
})

module.exports = mongoose.model('Users', usersSchema);