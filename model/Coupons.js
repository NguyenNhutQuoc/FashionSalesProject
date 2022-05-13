const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

const couponsSchema = new mongoose.Schema({
<<<<<<< HEAD
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
});
couponsSchema.plugin(require("mongoose-autopopulate"));
couponsSchema.plugin(require("mongoose-paginate-v2"));
module.exports = mongoose.model("Coupons", couponsSchema);
=======
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    dateStart: {
        type: Date,
        required: true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    minimumAmount: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    bills: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bills',
        }]
    }
})
couponsSchema.plugin(require('mongoose-autopopulate'))
couponsSchema.plugin(require('mongoose-paginate-v2'))
module.exports = mongoose.model('Coupons', couponsSchema);
>>>>>>> bbce33a1900013411c16b68a7f48a4937c35a894
