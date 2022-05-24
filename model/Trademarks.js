const mongoose = require('mongoose');
const mongoose_auto_populate = require('mongoose-autopopulate');
const Schema = mongoose.Schema;

const trademarkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    products: {
        type: [Schema.Types.ObjectId],
        ref: 'Products',
        autopopulate: true
    }
})

trademarkSchema.plugin(mongoose_auto_populate);
module.exports = mongoose.model("Trademarks", trademarkSchema);