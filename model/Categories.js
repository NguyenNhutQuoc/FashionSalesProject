const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)
const categoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        slug: 'name',
        unique: true
    },
    products: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            autopopulate: true
        }]
    }
})
categoriesSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Categories', categoriesSchema)