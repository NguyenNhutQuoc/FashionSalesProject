const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug)
const categoriesSchema = new mongoose.Schema(
    {
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
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Products',
                }
            ]
        }
    }
)

const productsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        material: {
            type: String,
            required: true
        },
        shape: {
            type: String,
        },
        origin: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        unit:  {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Categories',
            required: true
        },
        colors: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Colors'
                }
            ]
        },
        sizes: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Sizes'
                }
            ]
        },
        comments: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Comments'
                }
            ]
        },
        'bill-details': {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'BillDetails'
                }
            ]
        }
    },
)

const colorsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: true
        },
        'image-sub': {
            type: [String],
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
    }
)

const sizesSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            required: true,
            unique: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        }
    }
)

const usersSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true
        },
        'date-of-birth': {
            type: Date,
            required: true
        },
        address: {
          type: String,
          required: true
        },
        'number-bank-account': {
            type: String,
            required: true
        },
        'is-admin': {
            type: Number,
            default: 0
        },
        'is-customer': {
            type: Number,
            default: 0,
        },
        'is-provider': {
            type: Number,
            default: 0
        },
        password: {
            type: String,
            required: true
        },
        image: {
            type: String,
        },
        comments: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Comments'
                }
            ]
        },
        bills: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Bills'
                }
            ]
        }
    }
)

const couponsSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true
        },
        percent: {
            type: Number,
            required: true
        },
        'date-start': {
            type: Date,
            required: true
        },
        'date-end': {
            type: Date,
            required: true
        },
        'minimum-amount': {
            type: Number,
            required: true
        },
        'is-active': {
            type: Boolean,
            default: true
        },
        bills: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Bills'
                }
            ]
        }
    }
)

const commentsSchema = new mongoose.Schema(
    {
        content: {
            type:String,
            required: true
        },
        star: {
            type: Number,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        }
    },
    {
        timestamps: true
    }
)

const billsSchema = new mongoose.Schema(
    {
        'date': {
            type: Date,
            required: true
        },
        'shipped-date': {
            type: Date,
            required: true
        },
        status: {
            type: Number,
            default: 1
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupons',
        },
        "bill-details":
        {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'BillDetails'
                }
            ]
        }
    }
)

const billDetailsSchema = new mongoose.Schema(
    {
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type:Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        bill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bills',
            required: true
        }
    }
)

let Categories = mongoose.model('Categories', categoriesSchema)
let Products = mongoose.model('Products', productsSchema)
let Colors = mongoose.model('Colors', colorsSchema)
let Sizes = mongoose.model('Sizes', sizesSchema)
let Coupons = mongoose.model('Coupons', couponsSchema)
let Users = mongoose.model('Users', usersSchema)
let Bills = mongoose.model('Bills', billsSchema)
let BillDetails = mongoose.model('BillDetails', billDetailsSchema)
let Comments = mongoose.model('Comments', commentsSchema)

module.exports = {
    Categories,
    Products,
    Colors,
    Sizes,
    Coupons,
    Users,
    Bills,
    BillDetails,
    Comments
}

const productController = {
    findAll: async (req, res) => {
        try {
            const products = Products.find()
            res.status(200).json(products)
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    findById: async (req, res) => {
        try {
            const product = await Products.findById(req.params.id)
            if (product) {
                res.status(200).json(product)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Product not found'
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    findBySlug: async (req, res) => {
        try {
            const product = await Products.findOne({
                slug: req.params.slug
            })
            if (product) {
                res.status(200).json(product)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Product not found'
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    }
}