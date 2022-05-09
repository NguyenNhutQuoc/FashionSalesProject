const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)

const couponsSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    percent: {
        type: Number,
        required: true
    },
    'date-start': {
        type: Date,
        required: true
    },
    'date-end': {
        type: Date,
        required: true
    },
    'minimum-amount': {
        type: Number,
        required: true
    },
    'is-active': {
        type: Boolean,
        default: true
    },
    bills: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bills'
        }]
    }
})

module.exports = mongoose.model('Coupons', couponsSchema);