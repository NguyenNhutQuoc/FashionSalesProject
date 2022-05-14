const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    'imagesSub': [{
        type: String,
        default: ''
    }],
    'productDetail': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductDetails',

    }
})

module.exports = mongoose.model('ImagesSchema', ImageSchema)