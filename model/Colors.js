const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)
const colorsSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true,
        unique: true
    },
    productDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductDetails',
        }]
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Colors', colorsSchema);