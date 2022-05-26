const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const province = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        districts: [{
            type: Schema.Types.ObjectId,
            ref: 'District'
        }]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Province', province);