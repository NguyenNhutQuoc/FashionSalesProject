const {
    ProductDetails,
    Products,
    SizesSchema,
    Colors
} = require('../model/model');
const isNumber = require('is-number')
const ImagesSchema = require("../model/Images");
const ProductDetailController = {
    //***
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const productDetails = await ProductDetails.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    populate: {
                        path: 'images size color',
                    }
                })
                const { docs, ...others } = productDetails

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const productDetails = await ProductDetails.find({}).populate('images size color')
                res.status(200).json({
                    data: productDetails
                })
            }
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
                .populate('color')
                .populate('size')
                .populate('images')
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
    findAllImagesByIdProduct: async(req, res) => {
        try {
            const images = await ImagesSchema.find({
                productDetail: req.params.id
            }).populate('productDetail')
            if (images.length > 0) {
                res.status(200).json(
                    images
                )
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Images not found"
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message || "error server"
            })
        }
    },
    //***
    create: async(req, res) => {
        try {
            let i = 0
            let checkExist = 0
            let checkErr = 0
            for (let element in req.body) {
                i = element + 1
                let {
                    product,
                    size,
                    color,
                    image,
                    'images-sub': imagesSub
                } = req.body[element]
                if (product && size && color) {
                    const product_id = await Products.findById(product)
                    if (product_id) {
                        const sizeCheck = size.toLowerCase()
                        const colorCheck = color.toLowerCase()
                        const imageCheck = image.toLowerCase()
                        const size_id = await SizesSchema.findOne({
                            size: sizeCheck
                        })
                        const color_id = await Colors.findOne({
                            color: colorCheck,
                        })
                        const image_id = await ImagesSchema.findOne({
                            image: imageCheck
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
                        if (!image_id) {
                            await ImagesSchema.create({
                                image: imageCheck,
                                productDetails: []
                            })
                        }
                        const size_id_ = await SizesSchema.findOne({
                            size: sizeCheck
                        })
                        const color_id_ = await Colors.findOne({
                            color: colorCheck,
                        })
                        const image_id_ = await ImagesSchema.findOne({
                            image: imageCheck
                        })
                        const productDetail = await ProductDetails.findOne({
                            product: product_id._id,
                            size: size_id_._id,
                            color: color_id_._id,
                            images: [
                                image_id_._id
                            ]
                        })
                        if (productDetail) {
                            checkExist += '1' + ' '
                        } else {
                            const productDetail = await ProductDetails.create({
                                product: product_id.get('_id'),
                                size: size_id_.get('_id'),
                                color: color_id_.get('_id'),
                                images: image_id_.get('_id')
                            })
                            console.log(productDetail.get('_id'))
                            await image_id_.updateOne({
                                'productDetail': productDetail.get('_id'),
                            })
                            for (const index in imagesSub) {
                                await image_id_.updateOne({
                                    $push: {
                                        imagesSub: imagesSub[index]
                                    }
                                })
                            }
                            await Products.updateOne({
                                _id: product_id.get('_id')
                            }, {
                                $push: {
                                    productDetails: productDetail.get('_id')
                                }
                            })
                            await SizesSchema.updateOne({
                                _id: size_id_.get('_id')
                            }, {
                                $push: {
                                    productDetails: productDetail.get('_id')
                                }
                            })
                            await Colors.updateOne({
                                _id: color_id_.get('_id')
                            }, {
                                $push: {
                                    productDetails: productDetail.get('_id')
                                }
                            })
                        }
                    } else {
                        res.status(404).json({
                            errorMessage: 'Product at locate'+(element + 1) +' not found'
                        })
                        checkErr = 1
                        break
                    }
                } else {
                    res.status(404).json({
                        errorMessage: 'Missing data at '+(element + 1) +' row'
                    })
                    checkErr = 1
                    break
                }
            }
            if (checkExist && !checkErr) {
                res.status(200).json({
                    message: "Product detail at located " + checkExist + "is exist. Otherwise create new product detail"
                })
            }else if (!checkExist && !checkErr) {
                res.status(201).json({
                    message: 'Create product detail success'
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

            let check = 0
            const product = await Products.findById(req.params.id)
            if (product) {
                const productDetails = await ProductDetails.find({
                    product: req.params.id
                })
                if (productDetails.length > 0) {
                    for (const index in productDetails) {
                        await Colors.updateOne({
                            _id: productDetails[index].color
                        }, {
                            $pull: {
                                productDetails: productDetails[index]._id
                            }
                        })

                        await SizesSchema.updateOne({
                            _id: productDetails[index].size
                        }, {
                            $pull: {
                                productDetails: productDetails[index]._id
                            }
                        })
                        console.log(productDetails[index].get('images')[0].get('_id'))
                        if (productDetails[index].get('images')[0].get('_id')) {
                            await ProductDetails.updateOne({
                                _id: productDetails[index]._id
                            }, {
                                $pull: {
                                    images: productDetails[index].images[0].get('_id')
                                }
                            })
                            await ImagesSchema.findByIdAndDelete(productDetails[index].get('images')[0].get('_id'))
                        }

                        await productDetails[index].remove()
                    }

                    await product.updateOne({
                        $set: {
                            productDetails: []
                        }
                    })
                    for (let element in req.body) {
                        let {
                            product,
                            size,
                            color,
                            image,
                            'images-sub': imagesSub
                        } = req.body[element]
                        if (product && size && color) {
                            const product_id = await Products.findById(product)
                            if (product_id) {
                                const sizeCheck = size.toLowerCase()
                                const colorCheck = color.toLowerCase()
                                const imageCheck = image.toLowerCase()
                                const size_id = await SizesSchema.findOne({
                                    size: sizeCheck
                                })
                                const color_id = await Colors.findOne({
                                    color: colorCheck,
                                })
                                const image_id = await ImagesSchema.findOne({
                                    image: imageCheck
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
                                if (!image_id) {
                                    await ImagesSchema.create({
                                        image: imageCheck,
                                        productDetails: []
                                    })
                                }
                                const size_id_ = await SizesSchema.findOne({
                                    size: sizeCheck
                                })
                                const color_id_ = await Colors.findOne({
                                    color: colorCheck,
                                })
                                const image_id_ = await ImagesSchema.findOne({
                                    image: imageCheck
                                })
                                const productDetail = await ProductDetails.findOne({
                                    product: product_id._id,
                                    size: size_id_._id,
                                    color: color_id_._id,
                                    images: [
                                        image_id_._id
                                    ]
                                })
                                if (productDetail) {
                                } else {
                                    const productDetail = await ProductDetails.create({
                                        product: product_id.get('_id'),
                                        size: size_id_.get('_id'),
                                        color: color_id_.get('_id'),
                                        images: image_id_.get('_id')
                                    })
                                    console.log(productDetail.get('_id'))
                                    await image_id_.updateOne({
                                        'productDetail': productDetail.get('_id'),
                                    })
                                    for (const index in imagesSub) {
                                        await image_id_.updateOne({
                                            $push: {
                                                imagesSub: imagesSub[index]
                                            }
                                        })
                                    }
                                    await Products.updateOne({
                                        _id: product_id.get('_id')
                                    }, {
                                        $push: {
                                            productDetails: productDetail.get('_id')
                                        }
                                    })
                                    await SizesSchema.updateOne({
                                        _id: size_id_.get('_id')
                                    }, {
                                        $push: {
                                            productDetails: productDetail.get('_id')
                                        }
                                    })
                                    await Colors.updateOne({
                                        _id: color_id_.get('_id')
                                    }, {
                                        $push: {
                                            productDetails: productDetail.get('_id')
                                        }
                                    })
                                }
                            } else {
                                check = 1
                                res.status(404).json({
                                    errorMessage: 'Product at locate'+(element + 1) +' not found'
                                })
                                break
                            }
                        } else {
                            check = 1
                            res.status(404).json({
                                errorMessage: 'Missing data at '+(element + 1) +' row'
                            })
                            break
                        }
                    }
                }
                if (check === 0) {
                    res.status(200).json({
                        successMessage: 'Import success'
                    })
                } else {
                    res.status(404).json({
                        errorMessage: 'Import fail'
                    })
                }
            } else {
                res.status(404).json({
                    errorMessage: 'Product not found'
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
                await product.updateOne({
                    $pull: {
                        productDetails: productDetail.get('_id')
                    }
                })
                await color.updateOne({
                    $pull: {
                        productDetails: productDetail.get('_id')
                    }
                })
                await size.updateOne({
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