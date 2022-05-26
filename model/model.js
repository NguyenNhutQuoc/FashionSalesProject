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
const Trademarks = require('./Trademarks')
const Province = require('./ProvinceTable')
const District = require('./District')
const Commune = require('./Commune')
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
    ImagesSchema,
    Trademarks,
    Province,
    District,
    Commune
}