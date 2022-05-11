const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)

const commentsSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    star: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    }
}, {
    timestamps: true
})
commentsSchema.plugin(require('mongoose-autopopulate'));
commentsSchema.plugin(require('mongoose-paginate-v2'))
module.exports = mongoose.model('Comments', commentsSchema)