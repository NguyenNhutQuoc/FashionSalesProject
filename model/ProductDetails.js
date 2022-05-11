const mongoose = require("mongoose");

const productDetailsSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sizes',
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colors',
    },
    'images': [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ImagesSchema'
        }
        ],
    billDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BillDetails'
        }]
        }
    },

)

module.exports = mongoose.model('ProductDetails', productDetailsSchema);