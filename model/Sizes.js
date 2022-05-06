const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)
const sizesSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        unique: true
    },
    'product-details': {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductDetails'
        }]
    },
})

module.exports = mongoose.model('Sizes', sizesSchema)