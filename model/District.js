const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const district = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        province: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Province',
        },
        commune:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Commune',
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('District', district);