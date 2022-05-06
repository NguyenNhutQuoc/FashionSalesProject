const mongoose = require("mongoose");

const billDetailsSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
    },
    'product-detail': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductDetails',
        required: true
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bills',
        required: true
    }
})

module.exports = mongoose.model('BillDetails', billDetailsSchema)