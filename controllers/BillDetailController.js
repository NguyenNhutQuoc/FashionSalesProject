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
const isNumber = require('is-number')
const billDetailController = {
    findAll: async(req, res) => {
        try {
            const billDetails = await BillDetails.find()
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
                product: product ? product._id : null
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
            if (req.body.bill && req.body.product && req.body.quantity && req.body.price && isNumber(req.body.quantity) && isNumber(req.body.price)) {
                const bill = await Bills.findById(req.body.bill)
                const product = await Products.findById(req.body.product)
                if (bill && product && req.body.quantity > 0 && req.body.price > 0) {
                    const billDetail = new BillDetails(req.body)
                    await billDetail.save()
                    await bill.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await product.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
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
                const product = await Products.findById(req.body.product)
                if (bill && product) {
                    const oldBill = await Bills.findById(billDetail.get('bill'))
                    const oldProduct = await Products.findById(billDetail.get('product'))
                    await billDetail.updateOne(req.body)
                    await oldBill.updateOne({
                        $pull: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await oldProduct.updateOne({
                        $pull: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await bill.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await product.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    res.status(200).json(
                        "Update success"
                    )
                } else if (product) {
                    const oldProduct = await Products.findById(billDetail.get('product'))
                    await billDetail.updateOne(req.body)
                    await oldProduct.updateOne({
                        $pull: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    await product.updateOne({
                        $push: {
                            "bill-details": billDetail.get('_id')
                        }
                    })
                    res.status(200).json(
                        "Update success"
                    )
                } else if (bill) {
                    const oldBill = await Bills.findById(billDetail.get('bill'))
                    await billDetail.updateOne(req.body)
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
                    res.status(200).json(
                        "Update success"
                    )
                } else {
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
                const product = await Products.findById(billDetail.get('product'))
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