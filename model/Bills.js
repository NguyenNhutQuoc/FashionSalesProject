const mongoose = require("mongoose");

const billsSchema = new mongoose.Schema({
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
        autopopulate: true
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons',
        autopopulate: true
    },
    billDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BillDetails',
        }]
    },
    type: {
        type: String,
        default: ''
    },
    method: {
        type: String,
        default: 'COD'
    },
    feeShip: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    });
billsSchema.plugin(require('mongoose-autopopulate'))
billsSchema.plugin(require('mongoose-paginate-v2'))
module.exports = mongoose.model('Bills', billsSchema);