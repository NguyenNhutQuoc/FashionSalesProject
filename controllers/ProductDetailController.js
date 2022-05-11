const {
    ProductDetails,
    Products,
    SizesSchema,
    Colors
} = require('../model/model');
const isNumber = require('is-number')
const ImagesSchema = require("../model/Images");
const ProductDetailController = {
    findAll: async(req, res) => {
        try {
            const productDetails = await ProductDetails.find()
                .populate('color')
                .populate('size')
                .populate('images')
            res.status(200).json(
                productDetails
            )
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    findById: async(req, res) => {
        try {
            const productDetail = await ProductDetails.findById(req.params.id)
            if (productDetail) {
                res.status(200).json(
                    productDetail
                )
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Product not found"
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    create: async(req, res) => {
        try {
            const {
                quantity,
                status,
                product,
                size,
                color,
                image,
                imagesSub
            } = req.body
            if (quantity && status && product && size && color) {
                if (isNumber(quantity) && isNumber(status)) {
                    const product_id = await Products.findById(product)
                    if (product_id) {
                        const sizeCheck = size.toLowerCase()
                        const colorCheck = color.toLowerCase()
                        const size_id = await SizesSchema.findOne({
                            size: sizeCheck
                        })
                        const color_id = await SizesSchema.findOne({
                            color: colorCheck,
                        })
                        if (!size_id) {
                            await SizesSchema.create({
                                size: sizeCheck,
                                productDetails: []
                            })
                        }
                        if (!color_id) {
                            await Colors.create({
                                color: colorCheck,
                                productDetails: []
                            })
                        }
                        const size_id_ = await SizesSchema.findOne({
                            size: sizeCheck
                        })
                        const color_id_ = await Colors.findOne({
                            color: colorCheck,
                        })
                        await ImagesSchema.create({
                            image: image,
                            'imagesSub': imagesSub
                        })
                        const image_id = await ImagesSchema.findOne({
                            image: image
                        })
                        const productDetail = await ProductDetails.create({
                            quantity,
                            status,
                            product: product_id.get('_id'),
                            size: size_id_.get('_id'),
                            color: color_id_.get('_id'),
                            images: image_id.get('_id')
                        })
                        await ImagesSchema.updateOne({
                            'productDetail': productDetail.get('_id')
                        })
                        await Products.updateOne({
                            $push: {
                                productDetails: productDetail.get('_id')
                            }
                        })
                        await SizesSchema.updateOne({
                            $push: {
                                productDetails: productDetail.get('_id')
                            }
                        })
                        await Colors.updateOne({
                            $push: {
                                productDetails: productDetail.get('_id')
                            }
                        })
                        res.status(200).json({
                            data: productDetail
                        })
                    } else {
                        res.status(404).json({
                            errorMessage: 'Product not found'
                        })
                    }
                } else {
                    res.status(404).json({
                        errorMessage: 'Quantity, price, status must be number'
                    })
                }
            } else {
                res.status(400).json({
                    errorMessage: 'Missing parameters'
                })
            }
        } catch (e) {
            res.status(500).json({
                errorMessage: e.message
            })
        }
    },
    update: async(req, res) => {
        try {
            const productDetail = await ProductDetails.findById(req.params.id)
            if (productDetail) {
                if (req.body.quantity || req.body.status) {
                    if (req.body.quantity && !isNumber(req.body.quantity)) {
                        res.status(404).json({
                            errorMessage: 'Quantity must be number'

                        })
                    }
                    if (req.body.status && !isNumber(req.body.status)) {
                        res.status(404).json({
                            errorMessage: 'Status must be number'
                        })
                    }
                }
                if (req.body.product) {
                    const product_id = await Products.findById(req.body.product)
                    if (product_id) {
                        const oldProduct = await Products.findById(
                            productDetail.get('product')
                        )
                        const newProduct = await Products.findById(req.body.product)
                        oldProduct.updateOne({
                            $pull: {
                                productDetails: productDetail.get('_id')
                            }
                        })
                        newProduct.updateOne({
                            $push: {
                                productDetails: productDetail.get('_id')
                            }
                        })
                    } else {
                        res.status(404).json({
                            errorMessage: 'Product not found'
                        })
                    }
                }
                if (req.body.color) {
                    const oldColor = await Colors.findById(productDetail.get('color'))
                    oldColor.updateOne({
                        $pull: {
                            productDetails: productDetail.get('_id')
                        }
                    })
                    await Colors.create({
                        color: req.body.color,
                        productDetails: productDetail.get('_id')
                    })
                }
                if (req.body.size) {
                    const oldSize = await SizesSchema.findById(productDetail.get('size'))
                    oldSize.updateOne({
                        $pull: {
                            productDetails: productDetail.get('_id')
                        }
                    })
                    await SizesSchema.create({
                        size: req.body.size,
                        productDetails: productDetail.get('_id')
                    })
                }
                await productDetail.updateOne({
                    $set: {
                        ...req.body
                    }
                })
                res.status(200).json({
                    message: 'Update success'
                })
            } else {
                res.status(404).json({
                    errorMessage: 'Product detail not found'
                })
            }
        } catch (e) {
            res.status(500).json({
                errorMessage: e.message
            })
        }
    },
    delete: async(req, res) => {
        try {
            const productDetail = await ProductDetails.findById(req.params.id)
            if (productDetail) {
                const product = await Products.findById(productDetail.get('product'))
                const color = await Colors.findById(productDetail.get('color'))
                const size = await SizesSchema.findById(productDetail.get('size'))
                console.log(product)
                console.log(color)
                console.log(size)
                product.updateOne({
                    $pull: {
                        productDetails: productDetail.get('_id')
                    }
                })
                color.updateOne({
                    $pull: {
                        productDetails: productDetail.get('_id')
                    }
                })
                size.updateOne({
                    $pull: {
                        productDetails: productDetail.get('_id')
                    }
                })
                await productDetail.remove()
                res.status(200).json({
                    message: 'Delete success'
                })
            } else
                res.status(404).json({
                    errorMessage: 'Product detail not found'
                })
        } catch (err) {
            res.status(500).json({
                errorMessage: err.message
            })
        }
    }
}

module.exports = ProductDetailController