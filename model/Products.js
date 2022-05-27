const mongoose = require("mongoose");
const slug = require('mongoose-slug-generator');
const mongoose_auto_populate = require('mongoose-autopopulate');
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
        required: true,
    },
    price: {
      type: Number,
      required: true
    },
    productDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductDetails'
        }],
        autopopulate: true
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments',
        }],
        autopopulate: true
    },
    trademark: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trademarks',
        required: true,
        autopopulate:true
    },
},
    {
        timestamps: true
    });
productsSchema.plugin(mongoose_auto_populate);
productsSchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Products', productsSchema);

