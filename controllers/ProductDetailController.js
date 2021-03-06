const {
    ProductDetails,
    Products,
    Sizes,
    Colors, Bills
} = require('../model/model');
const ImagesSchema = require("../model/Images");
const ProductDetailController = {
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const productDetails = await ProductDetails.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    populate: {
                        path: 'images size color ',
                    },
                    sort: {
                        createdAt: -1
                    }
                })
                const { docs, ...others } = productDetails

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const productDetails = await ProductDetails.find({}).sort({
                    createdAt: -1
                }).populate('images size color')
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
    findBy: async(req, res) => {
        try {
            const {size_option,color_option} = req.query;
            const sizeTempt = await Sizes.findOne({
                size: size_option
            });
            const colorTempt = await  Colors.findOne({
                color: color_option
            });
            if(!size_option || !color_option){
                const  productDetail = (!color_option) ? await  ProductDetails.findOne({
                    size: sizeTempt.get("_id"),
                }): await ProductDetails.findOne({
                    color: colorTempt.get("_id")
                })
                res.status(200).json(productDetail)
            }else{
                const productDetail = (!size_option && color_option) ? await  ProductDetails.find({
                    color: colorTempt.get("_id")
                }): (!color_option && size_option) ? await ProductDetails.find({
                    size: sizeTempt.get("_id")
                }): await ProductDetails.find({
                    color: colorTempt.get("_id"),
                    size: sizeTempt.get("_id"),
                })
                res.status(200).json(productDetail)
            }

        }catch (e){
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            });
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

    calculateQuantityImportAndExport: async (req, res) => {
        try {
            const {
                fromDate, toDate
            } = req.query
            let importBills;
            let exportBills;
            if (fromDate && toDate) {
                importBills = await Bills.find({
                    type: 'N',
                    createdAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                })

                exportBills = await Bills.find({
                    type: 'X',
                    createdAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    },
                    status: 3
                })
            } else if (fromDate) {
                importBills = await Bills.find({
                    type: 'N',
                    createdAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date()
                    }
                })
                exportBills = await Bills.find({
                    type: 'X',
                    createdAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date()
                    },
                    status: 3
                })
            } else if (toDate) {
                importBills = await Bills.find({
                    type: 'N',
                    createdAt: {
                        $gte: new Date('2000-01-01'),
                        $lte: new Date(toDate)
                    }
                })
                exportBills = await Bills.find({
                    type: 'X',
                    createdAt: {
                        $gte: new Date('2000-01-01'),
                        $lte: new Date(toDate)
                    },
                    status: 3
                })
            } else {
                importBills = await Bills.find({
                    type: 'N',
                    createdAt: {
                        $gte: new Date('2000-01-01'),
                        $lte: new Date()
                    }
                })
                exportBills = await Bills.find({
                    type: 'X',
                    createdAt: {
                        $gte: new Date('2000-01-01'),
                        $lte: new Date()
                    },
                    status: 3
                })
            }

            res.status(200).json({
                data: {

                }
            })
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    create: async(req, res) => {
        try {
            let i = 0
            let checkExist = 0
            let checkErr = 0
            for (let element in req.body) {
                i = element + 1
                let {
                    product,
                    sizes,
                    color,
                    images
                } = req.body[element]
                if (product && sizes && color) {
                    const product_id = await Products.findById(product)
                    if (product_id) {
                        const colorCheck = color.toLowerCase()
                        const imageCheck = images[0].toLowerCase()
                        const imagesSub = images.slice(1)
                        const color_id = await Colors.findOne({
                            color: colorCheck,
                        })
                        for (const size of sizes) {
                            const check_size = await Sizes.findOne({
                                size: size.toLowerCase()
                            })
                            if (!check_size) {
                                await Sizes.create({
                                    size: size.toLowerCase()
                                })
                            }
                        }
                        if (!color_id) {
                            await Colors.create({
                                color: colorCheck,
                                productDetails: []
                            })
                        }

                        const newImage = await ImagesSchema.create({
                            image: imageCheck,
                        })
                        for (const index in imagesSub) {
                            await newImage.updateOne({
                                $push: {
                                    imagesSub: imagesSub[index]
                                }
                            })
                        }
                        const color_id_ = await Colors.findOne({
                            color: colorCheck,
                        })
                        for (const size of sizes) {
                            const check_size = await Sizes.findOne({
                                size: size.toLowerCase()
                            })
                            const productDetail = await ProductDetails.findOne({
                                product: product_id._id,
                                size: check_size._id,
                                color: color_id_._id,

                            })
                            if (productDetail) {

                            } else {
                                const productDetail = await ProductDetails.create({
                                    product: product_id.get('_id'),
                                    size: check_size.get('_id'),
                                    color: color_id_.get('_id'),
                                    images: newImage.get('_id')
                                })
                                console.log(productDetail.get('_id'))
                                await newImage.updateOne({
                                    'productDetail': productDetail.get('_id'),
                                })

                                await Products.updateOne({
                                    _id: product_id.get('_id')
                                }, {
                                    $push: {
                                        productDetails: productDetail.get('_id')
                                    }
                                })
                                await Sizes.updateOne({
                                    _id: check_size.get('_id')
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
                        }
                    } else {
                        res.status(404).json({
                            errorMessage: 'Product at locate' + (element + 1) + ' not found'
                        })
                        checkErr = 1
                        break
                    }
                } else {
                    res.status(404).json({
                        errorMessage: 'Missing data at ' + (element + 1) + ' row'
                    })
                    checkErr = 1
                    break
                }
            }
            if (checkExist && !checkErr) {
                res.status(200).json({
                    message: "Product detail at located " + checkExist + "is exist. Otherwise create new product detail"
                })
            } else if (!checkExist && !checkErr) {
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
                        if (productDetails[index].billDetails.length === 0 && productDetails[index].comments.length === 0) {
                            // await Colors.findByIdAndUpdate({
                            //     _id: productDetails[index].color
                            // }, {
                            //     $pull: {
                            //         productDetails: productDetails[index]._id
                            //     }
                            // })
                            await Colors.findByIdAndUpdate(productDetails[index].color, {
                                $pull: {
                                    productDetails: productDetails[index]._id
                                }
                            })


                            // await Sizes.updateOne({
                            //     _id: productDetails[index].size
                            // }, {
                            //     $pull: {
                            //         productDetails: productDetails[index]._id
                            //     }
                            // })
                            await Sizes.findByIdAndUpdate(productDetails[index].size, {
                                $pull: {
                                    productDetails: productDetails[index]._id
                                }
                            })

                            console.log(productDetails[index].get('images')[0].get('_id'))
                            if (productDetails[index].get('images')[0].get('_id')) {
                                // await ProductDetails.updateOne({
                                //     _id: productDetails[index]._id
                                // }, {
                                //     $pull: {
                                //         images: productDetails[index].images[0].get('_id')
                                //     }
                                // })
                                await ProductDetails.findByIdAndUpdate(productDetails[index]._id, {
                                    $pull: {
                                        images: productDetails[index].images[0].get('_id')
                                    }
                                })
                                await ImagesSchema.findByIdAndDelete(productDetails[index].get('images')[0].get('_id'))
                            }
                            await product.updateOne({
                                $pull: {
                                    productDetails: productDetails[index]._id
                                }
                            })
                            await productDetails[index].remove()
                        }
                    }

                    // await product.updateOne({
                    //     $set: {
                    //         productDetails: []
                    //     }
                    // })
                    //
                    for (let element in req.body) {
                        let {
                            product,
                            sizes,
                            color,
                            images,
                        } = req.body[element]
                        if (product && sizes && color) {
                            const product_id = await Products.findById(product)
                            if (product_id) {
                                const colorCheck = color.toLowerCase()

                                const color_id = await Colors.findOne({
                                    color: colorCheck,
                                })
                                for (const size of sizes) {
                                    const size_id = await Colors.findOne({
                                        size: size.toLowerCase()
                                    })
                                    if (!size_id) {
                                        await Sizes.create({
                                            size: size.toLowerCase(),
                                            productDetails: []
                                        })
                                    }
                                }
                                if (!color_id) {
                                    await Colors.create({
                                        color: colorCheck,
                                        productDetails: []
                                    })
                                }
                                const imagesSub = images.slice(1)
                                const newImage = await ImagesSchema.create({
                                    image: images[0],
                                })
                                for (const index in imagesSub) {
                                    await newImage.updateOne({
                                        $push: {
                                            imagesSub: imagesSub[index]
                                        }
                                    })
                                }
                                const color_id_ = await Colors.findOne({
                                    color: colorCheck,
                                })
                                for (const size of sizes) {
                                    const size_id_ = await Sizes.findOne({
                                        size: size.toLowerCase()
                                    })
                                    const productDetail = await ProductDetails.findOne({
                                        product: product_id._id,
                                        size: size_id_._id,
                                        color: color_id_._id
                                    })
                                    if (productDetail) {
                                    } else {
                                        const productDetail = await ProductDetails.create({
                                            product: product_id.get('_id'),
                                            size: size_id_.get('_id'),
                                            color: color_id_.get('_id'),
                                            images: newImage.get('_id')
                                        })
                                        await newImage.updateOne({
                                            'productDetail': productDetail.get('_id'),
                                        })
                                        await Products.updateOne({
                                            _id: product_id.get('_id')
                                        }, {
                                            $push: {
                                                productDetails: productDetail.get('_id')
                                            }
                                        })
                                        await Sizes.updateOne({
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
                                }
                            } else {
                                check = 1
                                res.status(404).json({
                                    errorMessage: 'Product at locate' + (element + 1) + ' not found'
                                })
                                break
                            }
                        } else {
                            check = 1
                            res.status(404).json({
                                errorMessage: 'Missing data at ' + (element + 1) + ' row'
                            })
                            break
                            return
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
                const size = await Sizes.findById(productDetail.get('size'))
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