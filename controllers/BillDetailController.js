const {
    ProductDetails,
    Bills,
    BillDetails,
    Products,
    Coupons,
} = require('../model/model');
const isNumber = require('is-number')
const billDetailController = {
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const billDetails = await BillDetails.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    populate: {
                        path: 'bill productDetail',
                    }
                })
                const { docs, ...other } = billDetails

                res.status(200).json({
                    data: docs,
                    ...other
                })
            } else {
                const billDetails = await BillDetails.find().populate('bill productDetail')
                res.status(200).json({
                    data: billDetails
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errMessage: error.message
            })
        }
    },
    findBy: async(req, res) => {
        try {

            const product = await Products.findOne({
                name: req.query.s
            })

            const billDetailByProduct = await BillDetails.find({
                productDetail: product ? product.get("_id") : null
            })
            if (billDetailByProduct.length > 0) {
                res.status(200).json(billDetailByProduct)
            } else {
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
    findById: async(req, res) => {
        try {
            const billDetail = await BillDetails.findById(req.params.id)
            if (billDetail) {
                res.status(200).json(billDetail)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'BillDetail not found'
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    create: async(req, res) => {
        try {
            if (req.body.bill && req.body.productDetail && req.body.quantity && isNumber(req.body.quantity)) {
                const bill = await Bills.findById(req.body.bill)
                const product = await ProductDetails.findById(req.body.productDetail)
                if (bill && product && req.body.quantity > 0) {
                    console.log("Hello")
                    const billDetail = await BillDetails.create({
                        bill: req.body.bill,
                        productDetail: req.body.productDetail,
                        quantity: req.body.quantity,
                        status: 2
                    })
                    const quantity = billDetail.get('quantity')
                    console.log(quantity)
                    const product_ = await Products.findById(product.get('product'))
                    const price = product_.get('price')
                    console.log(price)
                    const total = quantity * price
                    if (bill.get('type') === 'X') {
                        if (bill.get('coupon')) {
                            const coupon = await Coupons.findById(bill.get('coupon'))
                            const percent = coupon.get('percent')
                            const discount = total * percent / 100
                            const finalPrice = total - discount
                            await BillDetails.findByIdAndUpdate(billDetail.get('_id'), {
                                $set: {
                                    price: finalPrice
                                }
                            })
                        } else {
                            await BillDetails.findByIdAndUpdate(billDetail.get('_id'), {
                                $set: {
                                    price: total
                                }
                            })
                        }
                        if ((product.get('quantity') < req.body.quantity) && isNumber(product.get('quantity')) && isNumber(req.body.quantity)) {
                            res.status(404).json({
                                status: 404,
                                errorMessage: 'Quantity is not enough'
                            })
                        } else {
                            await bill.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                            })
                            await product.updateOne({
                                $inc: {
                                    "quantity": -req.body.quantity
                                }
                            })
                            const prducded = await ProductDetails.findById(req.body.productDetail)
                            const quantity = prducded.get('quantity')
                            if (quantity === 0) {
                                await ProductDetails.findByIdAndUpdate(req.body.productDetail, {
                                    $set: {
                                        status: 0
                                    }
                                })
                            }
                        }
                    } else {
                        await BillDetails.findByIdAndUpdate(billDetail.get('_id'), {
                            price: total
                        })
                        await bill.updateOne({
                            $push: {
                                billDetails: billDetail.get('_id')
                            }
                        })
                        await product.updateOne({
                            $push: {
                                billDetails: billDetail.get('_id')
                            },
                        })
                        await product.updateOne({
                            $inc: {
                                "quantity": req.body.quantity
                            },
                            $set: {
                                status: 1
                            }
                        })
                    }
                    res.status(201).json(billDetail)
                } else {
                    res.status(400).json({
                        status: 400,
                        errorMessage: 'Invalid bill or product or quantity or price'
                    })
                }
            } else {
                res.status(400).json({
                    status: 400,
                    errorMessage: 'Invalid data'
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    update: async(req, res) => {
        try {
            const billDetail = await BillDetails.findById(req.params.id)
            if (billDetail) {
                const bill = await Bills.findById(req.body.bill)
                const product = await ProductDetails.findById(req.body.productDetail)
                if (bill && product) {
                    const oldBill = await Bills.findById(billDetail.get('bill'))
                    const oldProduct = await ProductDetails.findById(billDetail.get('productDetail'))
                    await oldBill.updateOne({
                        $pull: {
                            billDetails: billDetail.get('_id')
                        }
                    })
                    await bill.updateOne({
                        $push: {
                            billDetails: billDetail.get('_id')
                        }
                    })
                    if (oldBill.get('type') === 'N') {
                        await oldProduct.updateOne({
                            $pull: {
                                billDetails: billDetail.get('_id')
                            },
                            $inc: {
                                "quantity": -billDetail.get('quantity')
                            }
                        })
                    }
                    if (oldBill.get('type') === 'X') {
                        await oldProduct.updateOne({
                            $pull: {
                                billDetails: billDetail.get('_id')
                            },
                            $inc: {
                                "quantity": billDetail.get('quantity')
                            }
                        })
                    }
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $inc: {
                                    "quantity": req.body.quantity
                                },
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                        } else {
                            await product.updateOne({
                                $inc: {
                                    "quantity": billDetail.get('quantity')
                                },
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                        }
                    }
                    if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $inc: {
                                    "quantity": -req.body.quantity
                                },
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                        } else {
                            await product.updateOne({
                                $inc: {
                                    "quantity": -billDetail.get('quantity')
                                },
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                        }
                    }
                    await billDetail.updateOne(req.body)
                    res.status(200).json(
                        "Update success"
                    )
                } else if (product) {
                    const oldProduct = await ProductDetails.findById(billDetail.get('productDetail'))
                    const oldBill = await Bills.findById(billDetail.get('bill'))
                    if (oldBill.get('type') === 'N') {
                        await oldProduct.updateOne({
                            $pull: {
                                billDetails: billDetail.get('_id')
                            },
                            $inc: {
                                "quantity": -billDetail.get('quantity')
                            }
                        })
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $inc: {
                                    "quantity": req.body.quantity
                                },
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                                $inc: {
                                    "quantity": billDetail.get('quantity')
                                }
                            })
                        }
                    } else if (oldBill.get('type') === 'X') {
                        await oldProduct.updateOne({
                            $pull: {
                                billDetails: billDetail.get('_id')
                            },
                            $inc: {
                                "quantity": billDetail.get('quantity')
                            }
                        })
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $inc: {
                                    "quantity": -req.body.quantity
                                },
                                $push: {
                                    billDetails: billDetail.get('_id')
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                                $inc: {
                                    "quantity": -billDetail.get('quantity')
                                }
                            })
                        }
                    }

                    await billDetail.updateOne(req.body)
                    res.status(200).json(
                        "Update success"
                    )
                } else if (bill) {
                    const oldBill = await Bills.findById(billDetail.get('bill'))
                    const product = await ProductDetails.findById(billDetail.get('productDetail'))
                    await oldBill.updateOne({
                        $pull: {
                            billDetails: billDetail.get('_id')
                        }
                    })
                    await bill.updateOne({
                        $push: {
                            billDetails: billDetail.get('_id')
                        }
                    })
                    if (oldBill.get('type') === 'N') {
                        await product.updateOne({
                            $pull: {
                                billDetails: billDetail.get('_id')
                            },
                            $inc: {
                                "quantity": -billDetail.get('quantity')
                            }
                        })
                    } else if (oldBill.get('type') === 'X') {
                        console.log("Hello")
                        console.log(product.get('quantity'))
                        await product.updateOne({
                            $pull: {
                                billDetails: billDetail.get('_id')
                            },
                            $inc: {
                                quantity: billDetail.get('quantity')
                            }
                        })
                        console.log(product.get('quantity'))
                    }
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                                $inc: {
                                    quantity: req.body.quantity
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                                $inc: {
                                    quantity: billDetail.get('quantity')
                                }
                            })
                            console.log(product.get('quantity'))
                        }
                    } else if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                                $inc: {
                                    quantity: -req.body.quantity
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    billDetails: billDetail.get('_id')
                                },
                                $inc: {
                                    quantity: -billDetail.get('quantity')
                                }
                            })
                        }
                    }
                    await billDetail.updateOne(req.body)
                    res.status(200).json(
                        "Update success"
                    )
                } else {
                    const product = await ProductDetails.findOne({
                        _id: billDetail.get('productDetail')
                    })
                    const bill = await Bills.findOne({
                        _id: billDetail.get('bill')
                    })
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $inc: {
                                    "quantity": (req.body.quantity - billDetail.get('quantity'))
                                }
                            })
                        }
                    } else if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $inc: {
                                    "quantity": -(req.body.quantity - billDetail.get('quantity'))
                                }
                            })
                        }
                    }
                    await billDetail.updateOne(req.body)
                    res.status(200).json(
                        "Update success"
                    )
                }
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'BillDetail not found'
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    delete: async(req, res) => {
        try {
            const billDetail = await BillDetails.findById(req.params.id)
            if (billDetail) {
                const bill = await Bills.findById(billDetail.get('bill'))
                const product = await ProductDetails.findById(billDetail.get('productDetail'))
                await bill.updateOne({
                    $pull: {
                        billDetails: billDetail.get('_id')
                    }
                })
                await product.updateOne({
                    $pull: {
                        billDetails: billDetail.get('_id')
                    }
                })
                await billDetail.remove()
                res.status(200).json(
                    "Delete success"
                )
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'BillDetail not found'
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    deleteMany: async(req, res) => {
        try {
            const billDetail = await BillDetails.find({
                _id: {
                    $in: req.body
                }
            })
            if (billDetail.length > 0) {
                for (let element in billDetail) {
                    const bill = await Bills.findById(billDetail[element].get('bill'))
                    const product = await ProductDetails.findById(billDetail[element].get('productDetail'))
                    await bill.updateOne({
                        $pull: {
                            billDetails: billDetail[element].get('_id')
                        }
                    })
                    await product.updateOne({
                        $pull: {
                            billDetails: billDetail[element].get('_id')
                        }
                    })
                }
                await BillDetails.deleteMany({
                    _id: {
                        $in: req.body
                    }
                })
                res.status(200).json(
                    "Delete success"
                )
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    }
}

module.exports = billDetailController