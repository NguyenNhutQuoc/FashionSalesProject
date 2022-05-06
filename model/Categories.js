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
        type: String
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
        }]
    }
})

module.exports = mongoose.model('Categories', categoriesSchema)