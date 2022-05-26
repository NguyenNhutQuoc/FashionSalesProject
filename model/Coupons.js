const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const couponsSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  dateStart: {
    type: Date,
    required: true,
  },
  dateEnd: {
    type: Date,
    required: true,
  },
  minimumAmount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  bills: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bills",
      },
    ],
  },
},
    {
  timestamps: true,
});
couponsSchema.plugin(require("mongoose-autopopulate"));
couponsSchema.plugin(require("mongoose-paginate-v2"));
module.exports = mongoose.model("Coupons", couponsSchema);

