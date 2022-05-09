const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    'image-sub': [
        {
            type: String,
            required: true
        }
    ],
    'product-detail': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductDetails',
        required: true
    }
})

module.exports = mongoose.model('ImagesSchema', ImageSchema)