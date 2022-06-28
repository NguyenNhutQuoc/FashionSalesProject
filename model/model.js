const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
mongoose.plugin(slug)
const Categories = require('./Categories')
const Products = require('./Products')
const Users = require('./Users')
const Sizes = require('./Sizes')
const Colors = require('./Colors')
const Coupons = require('./Coupons')
const Comments = require('./Comments')
const Bills = require('./Bills')
const BillDetails = require('./BillDetails')
const ProductDetails = require('./ProductDetails')
const Images = require('./Images')
const Trademarks = require('./Trademarks')
const Province = require('./ProvinceTable')
const District = require('./District')
const Commune = require('./Commune')
const Actions = require('./Actions')
module.exports = {
    Categories,
    Products,
    Colors,
    Sizes,
    Coupons,
    Users,
    Bills,
    BillDetails,
    Comments,
    ProductDetails,
    Images,
    Trademarks,
    Province,
    District,
    Commune,
    Actions
}