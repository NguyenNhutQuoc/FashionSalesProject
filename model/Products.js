const mongoose = require("mongoose");
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)

const productsSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        material: {
            type: String,
            required: true
        },
        shape: {
            type: String,
        },
        origin: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            slug: 'name'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categories',
            required: true
        },
        price: {
          type: Number,
          required: true
        },
        productDetails: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductDetails'
            }]
        },
        comments: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comments'
            }]
        },
    }
)

module.exports = mongoose.model('Products', productsSchema);

