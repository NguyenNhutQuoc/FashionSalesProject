const mongoose = require("mongoose");

const billsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    shippedDate: {
        type: Date
    },
    status: {
        type: Number,
        default: 1
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons',
    },
    billDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BillDetails',
        }]
    },
    type: {
        type: String,
    }
})
billsSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Bills', billsSchema);