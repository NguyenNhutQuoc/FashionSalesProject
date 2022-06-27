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
        default: 0
    },
    images: {
        type:[String],
        default: []
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        autopopulate: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductDetails',
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments',
        default: ""
    },
    childs: {
        type:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comments',
            }
        ],
        autopopulate: true
    }
}, {
    timestamps: true
})
commentsSchema.plugin(require('mongoose-autopopulate'));
commentsSchema.plugin(require('mongoose-paginate-v2'))
module.exports = mongoose.model('Comments', commentsSchema)