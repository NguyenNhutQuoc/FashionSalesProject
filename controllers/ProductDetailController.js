const {
    ProductDetails,
    Products,
    Sizes,
    Colors,
    BillDetails,
    Bills,
    Trademarks,
    Categories
} = require('../model/model');
const ImagesSchema = require("../model/Images");
var translate = require('translate')
const ProductDetailController = {
    findAll: async(req, res) => {
        try {
            const text = await translate("Áo thun nam", { from: 'vi', to: 'en' });
            console.log(text);
            if (req.query.page || req.query.limit) {
                const productDetails = await ProductDetails.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    populate: {
                        path: 'images size color',
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
            const { size_option, color_option } = req.query;
            const sizeTempt = await Sizes.findOne({
                size: size_option
            });
            const colorTempt = await Colors.findOne({
                color: color_option
            });
            if (!size_option || !color_option) {
                const productDetail = (!color_option) ? await ProductDetails.findOne({
                    size: sizeTempt.get("_id"),
                }) : await ProductDetails.findOne({
                    color: colorTempt.get("_id")
                })
                res.status(200).json(productDetail)
            } else {
                const productDetail = (!size_option && color_option) ? await ProductDetails.find({
                    color: colorTempt.get("_id")
                }) : (!color_option && size_option) ? await ProductDetails.find({
                    size: sizeTempt.get("_id")
                }) : await ProductDetails.find({
                    color: colorTempt.get("_id"),
                    size: sizeTempt.get("_id"),
                })
                res.status(200).json(productDetail)
            }

        } catch (e) {
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

    calculateQuantityImportAndExport: async(req, res) => {
        try {
            const { fromDate, toDate } = req.query
            let exportBills;
            let importBills;
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
                    createAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                })
            } else if (fromDate){
                importBills = await Bills.find({
                    type: 'N',
                    createAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(new Date().toString())
                    }
                })
                exportBills = await Bills.find({
                    type: 'X',
                    createAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(new Date().toString())
                    }
                })
            } else if (toDate) {
                importBills = await Bills.find({
                    type: 'N',
                    createAt: {
                        $gte: new Date("2000-01-01"),
                        $lte: new Date(toDate)
                    }
                })
                exportBills = await Bills.find({
                    type: 'X',
                    createAt: {
                        $gte: new Date("2000-01-01"),
                        $lte: new Date(toDate)
                    }
                })
            } else {
                importBills = await Bills.find({
                    type: 'N'
                })
                exportBills = await Bills.find({
                    type: 'X'
                })
            }
            const productDetails = await ProductDetails.find({})

            const data = []

            for (const item of productDetails) {
                let importQuantity = 0
                let exportQuantity = 0
                let expense = 0
                let revenue = 0
                let profit = 0
                let loss = 0
                for (const bill of importBills) {
                    const billDetail = await BillDetails.find({
                        bill: bill._id,
                        productDetail: item._id
                    })
                    if (billDetail.length > 0) {
                        for (const itemBillDetail of billDetail) {
                            importQuantity += itemBillDetail.quantity
                            expense += itemBillDetail.price
                        }
                    }
                }
                for (const bill of exportBills) {
                    const billDetail = await BillDetails.find({
                        bill: bill._id,
                        productDetail: item._id
                    })
                    if (billDetail.length > 0) {
                        for (const itemBillDetail of billDetail) {
                            exportQuantity += itemBillDetail.quantity
                            revenue += itemBillDetail.price
                        }
                    }
                }
                profit = revenue - expense
                const productDetailPopulate = await ProductDetails.findById(item._id)
                if (profit < 0) {
                    loss = profit * -1
                    profit = 0
                } else {
                    loss = 0
                }
                data.push({
                    productDetail: productDetailPopulate,
                    importQuantity,
                    exportQuantity,
                    expense,
                    revenue,
                    profit,
                    loss
                })
            }
            res.status(200).json({
                data: data
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
            let dataset = []
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
                            productDetails: []
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

                                const trademark = await Trademarks.findById(product_id.get('trademark'))
                                const category = await Categories.findById(product_id.get('category'))
                                const color = color_id_.get('color')
                                const size = check_size.get('size')
                                const nameTrademark = trademark.get('name')
                                const nameCategory = category.get('name')
                                const colorTranslate = await translate(color, { from: 'vi', to: 'en' })
                                const sizeTranslate = await translate(size, { from: 'vi', to: 'en' })

                                const nameCategoryTranslate = await translate(nameCategory, { from: 'vi', to: 'en' })
                                console.log(nameCategoryTranslate)
                                console.log(colorTranslate)
                                console.log(sizeTranslate)
                                const arrayNameTrademark = nameTrademark.split(' ')
                                const sTrademark = arrayNameTrademark.map(item => item.substring(0, 1) + '')
                                const arrayNameCate = nameCategoryTranslate.split(' ')
                                const sCategory = arrayNameCate.map(item => item.substring(0, 1) + '')
                                const sColor = colorTranslate.substring(0, 2)

                                const code = sTrademark.join('') + sCategory.join('') + sColor + sizeTranslate
                                console.log(code)
                                await ProductDetails.findByIdAndUpdate(productDetail._id, {
                                    SKU: code
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
                                dataset.push(productDetail)
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
                    data: dataset
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

                        await Sizes.updateOne({
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
                                    productDetails: []
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
                                    if (productDetail) {} else {
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