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
                    },
                    sort: {
                        createdAt: -1
                    }
                })
                const { docs, ...other } = billDetails
                res.status(200).json({
                    data: docs,
                    ...other
                })
            } else {
                const billDetails = await BillDetails.find().sort({
                    createdAt: -1
                }).populate('bill productDetail')
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
            const billDetail = await BillDetails.findById(req.params.id).populate("productDetail")
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
            let check = 0
            if (req.body.bill && req.body.productDetail && req.body.quantity && isNumber(req.body.quantity)) {
                const bill = await Bills.findById(req.body.bill)
                const product = await ProductDetails.findById(req.body.productDetail)
                if (bill && product && req.body.quantity > 0) {

                    const billDetail = await BillDetails.create({
                        bill: req.body.bill,
                        productDetail: req.body.productDetail,
                        quantity: req.body.quantity,
                    })
                    const quantity = billDetail.get('quantity')
                    const product_ = await Products.findById(product.get('product'))
                    let price = product_.get('price')
                    if (product_.get('startDate') >= new Date() && product_.get('endDate') <= new Date() && bill.get('type' === 'X')) {
                        const discount = product_.get('discount')
                        price = price - (price * discount / 100)
                    }
                    const total = quantity * price
                    if (bill.get('type') === 'X') {
                        console.log("Hello")
                        if (bill.get('coupon')) {
                            const coupon = await Coupons.findById(bill.get('coupon'))
                            const finalPrice = total - coupon.get('discount')
                            await BillDetails.findByIdAndUpdate(billDetail.get('_id'), {
                                $set: {
                                    price: finalPrice
                                }
                            })
                            await Bills.findByIdAndUpdate(bill.get('_id'), {
                                $inc: {
                                    totalPrice: finalPrice
                                }
                            })
                        } else {
                            await BillDetails.findByIdAndUpdate(billDetail.get('_id'), {
                                $set: {
                                    price: total
                                }
                            })
                            await Bills.findByIdAndUpdate(bill.get('_id'), {
                                $inc: {
                                    totalPrice: total
                                }
                            })
                        }
                        if ((product.get('quantity') < req.body.quantity) && isNumber(product.get('quantity')) && isNumber(req.body.quantity)) {
                            console.log(product.get('quantity') + '')
                            check =  1
                            res.status(404).json({
                                status: 404,
                                errorMessage: 'Quantity is not enough'
                            })
                        } else {
                            console.log('Updated billDetails')
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
                            const quantity = product.get('quantity')
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
                        await Bills.findByIdAndUpdate(bill.get('_id'), {
                            $inc: {
                                totalPrice: total
                            }
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
                    console.log('Product')
                    if (!check) {
                        res.status(201).json(billDetail)
                    }
                } else {
                    res.status(400).json({
                        status: 400,
                        errorMessage: 'Invalid bill or product or quantity or price'
                    })
                }
            } else {
                console.log("Please enter a valid bill or product")
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
            const bill = await Bills.findById(req.params.id)
            const billDetails = req.body
            if (bill) {
                const oldBillDetails = bill.get("billDetails")
                console.log(oldBillDetails)
                for (const detailID of oldBillDetails) {
                    const detail = await BillDetails.findById(detailID)
                    const productDetail = await ProductDetails.findById(detail.productDetail)
                    if (bill.type === "X") {
                        await productDetail.updateOne({
                            $inc: {
                                quantity: detail.quantity
                            },
                            $pull: {
                                billDetails: detail.get("_id")
                            }
                        })
                    } else {
                        await   productDetail.updateOne({
                            $inc: {
                                quantity: -detail.quantity
                            },
                            $pull: {
                                billDetails: detail.get("_id")
                            }
                        })
                    }
                    await bill.updateOne({
                        $pull: {
                            billDetails: detail.get("_id")
                        }
                    })
                    await detail.remove()
                }
                let checkError = 0
                let sttBillDetail = 0
                let arrayBillDetailInvalid = []
                for (item of billDetails) {
                    sttBillDetail++
                    const productDetail = await ProductDetails.findById(item.productDetail)
                    const product = await Products.findById(productDetail.product)
                    let quantity = item.quantity
                    if (bill.type === "X") {
                        if (quantity > productDetail.quantity) {
                            checkError=1
                            arrayBillDetailInvalid.push(sttBillDetail)
                        }
                        else {
                            const newBillDetail = await BillDetails.create(item)
                            await bill.updateOne({
                                $push: {
                                    billDetails: newBillDetail.get('_id')
                                }
                            })
                            await ProductDetails.findByIdAndUpdate(newBillDetail.get('productDetail'), {
                                $push: {
                                    billDetails: newBillDetail.get('_id')
                                },
                                $inc: {
                                    quantity: -quantity
                                }
                            })
                            const product = await Products.findById(productDetail.get('product'))
                            let total = newBillDetail.get('quantity') * product.get('price')
                            if (bill.coupon) {
                                const coupon = await Coupons.findById(bill.coupon)
                                if (coupon.minimumAmount <= total)
                                    total -= coupon.discount
                            }
                            if (product.get('startDate') >= new Date() && product.get('endDate') <= new Date()) {
                                total -= total * (product.get("discount") / 100 )
                            }
                            total += bill.get('feeShip')
                            await newBillDetail.updateOne({
                                $set: {
                                    price: total
                                }
                            })
                            await bill.updateOne({
                                $inc: {
                                    totalPrice: total
                                }
                            })
                            const quantityElseOfProductDetail = productDetail.get('quantity')
                            if (quantityElseOfProductDetail === 0) {
                                await productDetail.updateOne({
                                    $set: {
                                        status: 0
                                    }
                                })
                            }
                        }
                        if (checkError === 1) {
                            res.status(400).json({
                                errorMessage: 'Not enough quantity at bill detail at '+arrayBillDetailInvalid
                            })
                        } else {
                            res.status(200).json(
                                {message: "Update successfully"}
                            )
                        }
                    } else {
                        const newBillDetail = await BillDetails.create(item)
                        await bill.updateOne({
                            $push: {
                                billDetails: newBillDetail.get('_id')
                            }
                        })
                        await ProductDetails.findByIdAndUpdate(newBillDetail.get('productDetail'), {
                            $push: {
                                billDetails: newBillDetail.get('_id')
                            },
                            $inc: {
                                quantity: quantity
                            },
                            $set: {
                                status:1
                            }
                        })
                        const product = await Products.findById(productDetail.get('product'))
                        let total = newBillDetail.get('quantity') * product.get('price')
                        await newBillDetail.updateOne({
                            $set: {
                                price: total
                            }
                        })
                        await bill.updateOne({
                            $inc: {
                                totalPrice: total
                            }
                        })
                        res.status(200).json({
                            message: "Successful update"
                        })
                    }
                }
            }
            // const billDetail = await BillDetails.findById(req.params.id)
            // if (billDetail) {
            //     const bill = await Bills.findById(req.body.bill)
            //     const product = await ProductDetails.findById(req.body.productDetail)
            //     if (bill && product) {
            //         const oldBill = await Bills.findById(billDetail.get('bill'))
            //         const oldProduct = await ProductDetails.findById(billDetail.get('productDetail'))
            //         await oldBill.updateOne({
            //             $pull: {
            //                 billDetails: billDetail.get('_id')
            //             }
            //         })
            //         await bill.updateOne({
            //             $push: {
            //                 billDetails: billDetail.get('_id')
            //             }
            //         })
            //         if (oldBill.get('type') === 'N') {
            //             await oldProduct.updateOne({
            //                 $pull: {
            //                     billDetails: billDetail.get('_id')
            //                 },
            //                 $inc: {
            //                     "quantity": -billDetail.get('quantity')
            //                 }
            //             })
            //         }
            //         if (oldBill.get('type') === 'X') {
            //             await oldProduct.updateOne({
            //                 $pull: {
            //                     billDetails: billDetail.get('_id')
            //                 },
            //                 $inc: {
            //                     "quantity": billDetail.get('quantity')
            //                 }
            //             })
            //         }
            //         if (bill.get('type') === 'N') {
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": req.body.quantity
            //                     },
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     }
            //                 })
            //             } else {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": billDetail.get('quantity')
            //                     },
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     }
            //                 })
            //             }
            //         }
            //         if (bill.get('type') === 'X') {
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": -req.body.quantity
            //                     },
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     }
            //                 })
            //             } else {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": -billDetail.get('quantity')
            //                     },
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     }
            //                 })
            //             }
            //         }
            //         await billDetail.updateOne(req.body)
            //         res.status(200).json(
            //             "Update success"
            //         )
            //     } else if (product) {
            //         const oldProduct = await ProductDetails.findById(billDetail.get('productDetail'))
            //         const oldBill = await Bills.findById(billDetail.get('bill'))
            //         if (oldBill.get('type') === 'N') {
            //             await oldProduct.updateOne({
            //                 $pull: {
            //                     billDetails: billDetail.get('_id')
            //                 },
            //                 $inc: {
            //                     "quantity": -billDetail.get('quantity')
            //                 }
            //             })
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": req.body.quantity
            //                     },
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     }
            //                 })
            //             } else {
            //                 await product.updateOne({
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     },
            //                     $inc: {
            //                         "quantity": billDetail.get('quantity')
            //                     }
            //                 })
            //             }
            //         } else if (oldBill.get('type') === 'X') {
            //             await oldProduct.updateOne({
            //                 $pull: {
            //                     billDetails: billDetail.get('_id')
            //                 },
            //                 $inc: {
            //                     "quantity": billDetail.get('quantity')
            //                 }
            //             })
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": -req.body.quantity
            //                     },
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     }
            //                 })
            //             } else {
            //                 await product.updateOne({
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     },
            //                     $inc: {
            //                         "quantity": -billDetail.get('quantity')
            //                     }
            //                 })
            //             }
            //         }
            //         await billDetail.updateOne(req.body)
            //         res.status(200).json(
            //             "Update success"
            //         )
            //     } else if (bill) {
            //         const oldBill = await Bills.findById(billDetail.get('bill'))
            //         const product = await ProductDetails.findById(billDetail.get('productDetail'))
            //         await oldBill.updateOne({
            //             $pull: {
            //                 billDetails: billDetail.get('_id')
            //             }
            //         })
            //         await bill.updateOne({
            //             $push: {
            //                 billDetails: billDetail.get('_id')
            //             }
            //         })
            //         if (oldBill.get('type') === 'N') {
            //             await product.updateOne({
            //                 $pull: {
            //                     billDetails: billDetail.get('_id')
            //                 },
            //                 $inc: {
            //                     "quantity": -billDetail.get('quantity')
            //                 }
            //             })
            //         } else if (oldBill.get('type') === 'X') {
            //             console.log("Hello")
            //             console.log(product.get('quantity'))
            //             await product.updateOne({
            //                 $pull: {
            //                     billDetails: billDetail.get('_id')
            //                 },
            //                 $inc: {
            //                     quantity: billDetail.get('quantity')
            //                 }
            //             })
            //             console.log(product.get('quantity'))
            //         }
            //         if (bill.get('type') === 'N') {
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     },
            //                     $inc: {
            //                         quantity: req.body.quantity
            //                     }
            //                 })
            //             } else {
            //                 await product.updateOne({
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     },
            //                     $inc: {
            //                         quantity: billDetail.get('quantity')
            //                     }
            //                 })
            //                 console.log(product.get('quantity'))
            //             }
            //         } else if (bill.get('type') === 'X') {
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     },
            //                     $inc: {
            //                         quantity: -req.body.quantity
            //                     }
            //                 })
            //             } else {
            //                 await product.updateOne({
            //                     $push: {
            //                         billDetails: billDetail.get('_id')
            //                     },
            //                     $inc: {
            //                         quantity: -billDetail.get('quantity')
            //                     }
            //                 })
            //             }
            //         }
            //         await billDetail.updateOne(req.body)
            //         res.status(200).json(
            //             "Update success"
            //         )
            //     } else {
            //         const product = await ProductDetails.findOne({
            //             _id: billDetail.get('productDetail')
            //         })
            //         const bill = await Bills.findOne({
            //             _id: billDetail.get('bill')
            //         })
            //         if (bill.get('type') === 'N') {
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": (req.body.quantity - billDetail.get('quantity'))
            //                     }
            //                 })
            //             }
            //         } else if (bill.get('type') === 'X') {
            //             if (req.body.quantity && isNumber(req.body.quantity) && req.body.quantity > 0) {
            //                 await product.updateOne({
            //                     $inc: {
            //                         "quantity": -(req.body.quantity - billDetail.get('quantity'))
            //                     }
            //                 })
            //             }
            //         }
            //         await billDetail.updateOne(req.body)
            //         res.status(200).json(
            //             "Update success"
            //         )
            //     }
            // } else {
            //     res.status(404).json({
            //         status: 404,
            //         errorMessage: 'BillDetail not found'
            //     })
            // }
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