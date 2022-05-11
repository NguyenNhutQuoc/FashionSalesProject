const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
mongoose.plugin(slug)
const CategoriesSchema = require('./Categories')
const Products = require('./Products')
const Users = require('./Users')
const SizesSchema = require('./Sizes')
const Colors = require('./Colors')
const Coupons = require('./Coupons')
const CommentsSchema = require('./Comments')
const Bills = require('./Bills')
const BillDetails = require('./BillDetails')
const ProductDetails = require('./ProductDetails')
const ImagesSchema = require('./Images')
const options = {
    page:1,
    limit: 10,
    sort: {
        name:1
    },
    collation: {
        locale: 'en'
    }
}
module.exports = {
    CategoriesSchema,
    Products,
    Colors,
    SizesSchema,
    Coupons,
    Users,
    Bills,
    BillDetails,
    CommentsSchema,
    ProductDetails,
    ImagesSchema
}