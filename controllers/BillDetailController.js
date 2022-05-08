const {
    ProductDetails,
    Bills, BillDetails, Products,
} = require('../model/model');
const isNumber = require('is-number')
const billDetailController = {
    findAll: async(req, res) => {
        try {
            const billDetails = await BillDetails.find().populate('bill')
            res.status(200).json(billDetails)
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
                'product-detail': product ? product.get("_id") : null
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
            if (req.body.bill && req.body['product-detail'] && req.body.quantity && req.body.price && isNumber(req.body.quantity) && isNumber(req.body.price)) {
                const bill = await Bills.findById(req.body.bill)
                const product = await ProductDetails.findById(req.body['product-detail'])
                if (bill && product && req.body.quantity > 0 && req.body.price > 0) {
                    const billDetail = await BillDetails.create(
                        {
                            bill: req.body.bill,
                            'product-detail': req.body['product-detail'],
                            quantity: req.body.quantity,
                            price: req.body.price,
                            status:2
                        }
                    )
                    await bill.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await product.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        },
                    })
                    if (bill.get('type') === 'X') {
                        if (product.get('quantity') - req.body.quantity < 0) {
                            res.status(400).json({
                                status: 400,
                                errorMessage: 'Quantity is not enough'
                            })
                        }
                        else {
                            await product.updateOne({
                                $set: {
                                    "quantity": product.get('quantity') - req.body.quantity
                                }
                            })
                        }
                    }  else {
                        await product.updateOne({
                            $set: {
                                "quantity": product.get('quantity') + req.body.quantity
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
                const product = await ProductDetails.findById(req.body['product-detail'])
                if (bill && product) {
                    const oldBill = await Bills.findById(billDetail.get('bill'))
                    const oldProduct = await ProductDetails.findById(billDetail.get('product-detail'))
                    await oldBill.updateOne({
                        $pull: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await bill.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    if (oldBill.get('type') === 'N') {
                        await oldProduct.updateOne({
                            $pull: {
                                "bill-details": billDetail.get('_id')
                            },
                            $set: {
                                "quantity": oldProduct.get('quantity') - billDetail.get('quantity')
                            }
                        })
                    }
                    if (oldBill.get('type') === 'X') {
                        await oldProduct.updateOne({
                            $pull: {
                                "bill-details": billDetail.get('_id')
                            },
                            $set: {
                                "quantity": oldProduct.get('quantity') + billDetail.get('quantity')
                            }
                        })
                    }
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $set: {
                                    "quantity": product.get('quantity') + req.body.quantity
                                },
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                }
                            })
                        } else {
                            await product.updateOne({
                                $set: {
                                    "quantity": product.get('quantity') + billDetail.get('quantity')
                                },
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                }
                            })
                        }
                    }
                    if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $set: {
                                    "quantity": product.get('quantity') - req.body.quantity
                                },
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                }
                            })
                        } else {
                            await product.updateOne({
                                $set: {
                                    "quantity": product.get('quantity') - billDetail.get('quantity')
                                },
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                }
                            })
                        }
                    }
                    await billDetail.updateOne(req.body)
                    res.status(200).json(
                        "Update success"
                    )
                } else if (product) {
                    const oldProduct = await ProductDetails.findById(billDetail.get('product-detail'))
                    const oldBill = await billDetail.get('bill')
                    if (oldBill.get('type') === 'N') {
                        await oldProduct.updateOne({
                            $pull: {
                                "bill-details": billDetail.get('_id')
                            },
                            $set: {
                                "quantity": oldProduct.get('quantity') - billDetail.get('quantity')
                            }
                        })
                    } else if (oldBill.get('type') === 'X') {
                        await oldProduct.updateOne({
                            $pull: {
                                "bill-details": billDetail.get('_id')
                            },
                            $set: {
                                "quantity": oldProduct.get('quantity') + billDetail.get('quantity')
                            }
                        })
                    }
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    "quantity": product.get('quantity') + req.body.quantity
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    "quantity": product.get('quantity') + billDetail.get('quantity')
                                }
                            })
                        }
                    } else if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    "quantity": product.get('quantity') - req.body.quantity
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    "quantity": product.get('quantity') - billDetail.get('quantity')
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
                    const product = await ProductDetails.findById(billDetail.get('product-detail'))
                    const quantity = product.get('quantity')
                    console.log(quantity)
                    await oldBill.updateOne({
                        $pull: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await bill.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    if (oldBill.get('type') === 'N') {
                        await product.updateOne({
                            $pull: {
                                "bill-details": billDetail.get('_id')
                            },
                            $set: {
                                "quantity": quantity - billDetail.get('quantity')
                            }
                        })
                    } else if (oldBill.get('type') === 'X') {
                        console.log("Hello")
                        console.log(product.get('quantity'))
                        await product.updateOne({
                            $pull: {
                                "bill-details": billDetail.get('_id')
                            },
                            $set: {
                                quantity: quantity + billDetail.get('quantity')
                            }
                        })
                        console.log(product.get('quantity'))
                    }
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    quantity: quantity + req.body.quantity
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    quantity: quantity + billDetail.get('quantity')
                                }
                            })
                            console.log(product.get('quantity'))
                        }
                    } else if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    quantity: quantity - req.body.quantity
                                }
                            })
                        } else {
                            await product.updateOne({
                                $push: {
                                    "bill-details": billDetail.get('_id')
                                },
                                $set: {
                                    quantity: quantity - billDetail.get('quantity')
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
                        _id: billDetail.get('product-detail')
                    })
                    const quantity = product.get('quantity')
                    const bill = await Bills.findOne({
                        _id: billDetail.get('bill')
                    })
                    if (bill.get('type') === 'N') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $set: {
                                    "quantity": quantity + (req.body.quantity - billDetail.get('quantity'))
                                }
                            })
                        }
                    } else if (bill.get('type') === 'X') {
                        if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
                            await product.updateOne({
                                $set: {
                                    "quantity": quantity - (req.body.quantity - billDetail.get('quantity'))
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
                const product = await ProductDetails.findById(billDetail.get('product-detail'))
                await bill.updateOne({
                    $pull: {
                        "bill-details": billDetail.get('_id')
                    }
                })
                await product.updateOne({
                    $pull: {
                        "bill-details": billDetail.get('_id')
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
    }
}

module.exports = billDetailController