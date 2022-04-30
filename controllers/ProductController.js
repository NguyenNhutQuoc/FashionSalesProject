const {
    Categories,
    Products,
    Colors,
    Sizes,
    Coupons,
    Users,
    Bills,
    BillDetails,
    Comments
} = require('../model/model');

const productController = {
    findAll: async (req, res) => {
        try {
            const products = await Products.find()
            res.status(200).json(products)
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    findBy: async (req, res) => {
        try {
            const product_name = await Products.find({
                name: req.query.search
            })
            const product_material = await Products.find({
                    material: req.query.search
                }
            )
            const product_origin = await Products.find({
                    origin: req.query.search
                }
            )
            const category = await Categories.findOne(
                {
                    name: req.query.search
                }
            )
            const product_category = await Products.find({
                    category: category ? category.get('_id') : null
            })

            const product_slug = await Products.find({
                slug: req.query.search
            })

            const color = await Colors.findOne({
                name: req.query.search
            })
            const product_color = await Products.find({
                colors: color ? color.get('_id') : null
            })

            const size = await Sizes.findOne({
                name: req.query.search
            })
            const product_size = await Products.find({
                sizes: size ? size.get('_id'): null
            })
            console.log(product_category.length)
            if (product_name.length > 0 || product_size.length > 0 || product_category.length > 0 || product_material.length > 0 || product_origin.length > 0 || product_slug.length > 0 || product_color.length > 0) {
                res.status(200).json(
                    product_name.length > 0 ? product_name :
                        product_size.length > 0 ? product_size :
                            product_category.length > 0 ? product_category :
                                product_material.length > 0 ? product_material :
                                    product_origin.length > 0 ? product_origin :
                                        product_slug.length > 0 ? product_slug :
                                            product_color.length > 0 ? product_color : []
                )
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Not found'
                })
            }

        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },

    create: async (req, res ) => {
        try {
            const category = Categories.findById(req.body.category)
            if (category) {
                const product = new Products(req.body)
                const result = await product.save()
                await category.updateOne({
                    $push: {
                        products: result._id
                    }
                })
                res.status(201).json(result)
            }
            else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Category not found'
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    update: async (req, res) => {
        try {
            const product = await Products.findById(req.params.id)
            if (product) {
                if(req.body.category) {
                    const oldCategory = await Categories.findById(product.get('category'))
                    const category = await Categories.findById(req.body.category)
                    if (category) {
                        const result = await Products.findByIdAndUpdate(req.params.id, req.body, {
                            new: true
                        })
                        await oldCategory.updateOne({
                            $pull: {
                                products: product.get('_id')
                            }
                        })
                        await category.updateOne({
                            $push: {
                                products: product.get('_id')
                            }
                        })
                        res.status(200).json(result)
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: 'Category not found'
                        })
                    }
                } else {
                    const result = await Products.findByIdAndUpdate(req.params.id, req.body)
                    res.status(200).json(result)
                }
            }
            else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Product not found'
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    delete: async (req, res) => {
        try {
            const product = await Products.findById(req.params.id)
            if (product) {
                if (product.get('colors').length > 0 || product.get('sizes').length > 0 || product.get('comments') > 0 || product.get('bill-details').length > 0) {
                    res.status(400).json({
                        status: 400,
                        errorMessage: product.get('colors').length > 0 ? 'Product has colors' : product.get('sizes').length > 0 ? 'Product has sizes' : product.get('comments') > 0 ? 'Product has comments' : 'Product has bill-details'
                    })
                }
                else {
                    const result = await Products.findByIdAndDelete(req.params.id)
                    res.status(200).json(result)
                }
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    }
}

module.exports = productController
