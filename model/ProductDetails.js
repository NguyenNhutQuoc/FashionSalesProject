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
        required: true,
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sizes',
        autopopulate: true
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colors',
        autopopulate: true
    },
    'images': [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ImagesSchema',
            autopopulate: true
        }
        ],
    billDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BillDetails',
            autopopulate: true
        }]
        }
    },
)
productDetailsSchema.plugin(require('mongoose-autopopulate'));
productDetailsSchema.plugin(require('mongoose-paginate-v2'))
module.exports = mongoose.model('ProductDetails', productDetailsSchema);