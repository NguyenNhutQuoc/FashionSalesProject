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
    }
},
    {
        timestamps: true
    }
);

trademarkSchema.plugin(mongoose_auto_populate);
trademarkSchema.plugin(require('mongoose-paginate-v2'));


module.exports = mongoose.model("Trademarks", trademarkSchema);