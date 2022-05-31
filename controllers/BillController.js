const {
    Coupons,
    Users,
    Bills,
    BillDetails
} = require('../model/model');

const isNumber = require('is-number')

const BillController = {
    search: async (req, res) => {
        const {
            page,
            limit,
            q,
            type
        } = req.query;
        const regex = new RegExp(q, 'i')
        if (page || limit) {
            const user = await Users.findOne({
                where: {
                    name: {
                        $regex: regex
                    }
                }
            })
            const bills = await Bills.paginate({
                $or: [{
                    method: {
                        $regex: regex
                    }
                },
                    {
                        user: user? user.get('_id') : null
                    },
                    {
                        status: isNumber(q) ? q : 0
                    },
                ],
                type: type
            }, {
                page: page || 1,
                limit: limit || 10,
                sort: {
                    createdAt: -1
                }
            })
            const {docs, ...others} = bills
            res.json({
                data: docs,
                ...others
            })

        } else {
            const user = await Users.findOne({
                where: {
                    name: {
                        $regex: regex
                    }
                }
            })
            const bills = await Bills.find({
                $or: [
                    {
                        user:user ? user.get('_id'): null
                    },
                    {
                        status: isNumber(q) ? q : 0
                    },
                    {
                        method: {
                            $regex: regex
                        }
                    }
                ],
                type: type
            }).populate('user').populate('billDetails')
            res.status(200).json({
                data: bills
            })
        }

    },
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const bills = await Bills.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = bills
                let data = []
                for (let index in docs) {

                    const bill = await Bills.findById(docs[index].get('_id')).populate('user').populate('billDetails')
                    const billDetails = bill.get("billDetails")
                    let totalPrice = 0
                    for (let i = 0; i < billDetails.length; i++) {
                        const billDetail = await BillDetails.findById(billDetails[i].get('_id'))
                        totalPrice += billDetail.get("price")
                    }
                    if (bill.coupon) {
                        const coupon = await Coupons.findById(bill.coupon)
                        totalPrice -= coupon.discount
                    }
                    const billObject = bill.toObject()
                    totalPrice += bill.get("feeShip")
                    billObject.totalPrice = totalPrice
                    data.push(
                        billObject
                    )
                }
                res.status(200).json({
                    data: data,
                    ...others
                })
            } else {
                const bills = await Bills.find().sort({
                    createdAt: -1
                }).populate('user').populate('billDetails')
                let data = []
                for (let index in bills) {
                    const bill = await Bills.findById(bills[index].get('_id')).populate('user').populate('billDetails')
                    const billDetails = bill.get("billDetails")
                    let totalPrice = 0
                    for (let i = 0; i < billDetails.length; i++) {
                        const billDetail = await BillDetails.findById(billDetails[i].get('_id'))
                        totalPrice += billDetail.get("price")
                    }
                    if (bill.coupon) {
                        const coupon = await Coupons.findById(bill.coupon)
                        totalPrice -= coupon.discount
                    }
                    const billObject = bill.toObject()
                    billObject.totalPrice = totalPrice
                    data.push(
                        billObject
                    )
                }

                res.status(200).json({
                    data: data,

                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },

    findAllImportType: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const bills = await Bills.paginate({
                    type: 'N'
                }, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = bills
                let data = []
                for (let index in docs) {

                    const bill = await Bills.findById(docs[index].get('_id')).populate('user').populate('billDetails')
                    const billDetails = bill.get("billDetails")
                    let totalPrice = 0
                    for (let i = 0; i < billDetails.length; i++) {
                        const billDetail = await BillDetails.findById(billDetails[i].get('_id'))
                        totalPrice += billDetail.get("price")
                    }
                    if (bill.coupon) {
                        const coupon = await Coupons.findById(bill.coupon)
                        totalPrice -= coupon.discount
                    }
                    const billObject = bill.toObject()
                    billObject.totalPrice = totalPrice
                    data.push(
                        billObject
                    )
                }
                res.status(200).json({
                    data: data,
                    ...others
                })
            } else {
                const bills = await Bills.find({
                    type: 'N'
                }).populate('user').populate('billDetails')
                let data = []
                for (let index in bills) {
                    const bill = await Bills.findById(bills[index].get('_id')).populate('user').populate('billDetails')
                    const billDetails = bill.get("billDetails")
                    let totalPrice = 0
                    for (let i = 0; i < billDetails.length; i++) {
                        const billDetail = await BillDetails.findById(billDetails[i].get('_id'))
                        totalPrice += billDetail.get("price")
                    }
                    if (bill.coupon) {
                        const coupon = await Coupons.findById(bill.coupon)
                        totalPrice -= coupon.discount
                    }
                    const billObject = bill.toObject()
                    billObject.totalPrice = totalPrice
                    data.push(
                        billObject
                    )
                }

                res.status(200).json({
                    data: data,

                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    findAllExportType: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const bills = await Bills.paginate({
                    type: 'X'
                }, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = bills
                let data = []
                for (let index in docs) {

                    const bill = await Bills.findById(docs[index].get('_id')).populate('user').populate('billDetails')
                    const billDetails = bill.get("billDetails")
                    let totalPrice = 0
                    for (let i = 0; i < billDetails.length; i++) {
                        const billDetail = await BillDetails.findById(billDetails[i].get('_id'))
                        totalPrice += billDetail.get("price")
                    }
                    if (bill.coupon) {
                        const coupon = await Coupons.findById(bill.coupon)
                        totalPrice -= coupon.discount
                    }
                    const billObject = bill.toObject()
                    billObject.totalPrice = totalPrice
                    data.push(
                        billObject
                    )
                }
                res.status(200).json({
                    data: data,
                    ...others
                })
            } else {
                const bills = await Bills.find({
                    type: 'X'
                }).populate('user').populate('billDetails')
                let data = []
                for (let index in bills) {
                    const bill = await Bills.findById(bills[index].get('_id')).populate('user').populate('billDetails')
                    const billDetails = bill.get("billDetails")
                    let totalPrice = 0
                    for (let i = 0; i < billDetails.length; i++) {
                        const billDetail = await BillDetails.findById(billDetails[i].get('_id'))
                        totalPrice += billDetail.get("price")
                    }
                    if (bill.coupon) {
                        const coupon = await Coupons.findById(bill.coupon)
                        totalPrice -= coupon.discount
                    }
                    const billObject = bill.toObject()
                    billObject.totalPrice = totalPrice
                    data.push(
                        billObject
                    )
                }

                res.status(200).json({
                    data: data,

                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },

    findById: async(req, res) => {
        try {

            const bill = await Bills.findById(req.params.id).populate("billDetails").populate("user")

            if (bill) {
                const billDetails = bill.get("billDetails")
                let totalPrice = 0
                for (let i = 0; i < billDetails.length; i++) {
                    const billDetail = await BillDetails.findById(billDetails[i]._id)
                    totalPrice += billDetail.get("price")
                }
                if (bill.coupon) {
                    const coupon = await Coupons.findById(bill.coupon)
                    totalPrice -= coupon.discount
                }
                const billObject = bill.toObject()
                billObject.totalPrice = totalPrice
                res.status(200).json(billObject)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Bill not found'
                })
            }
        } catch (error) {
            res.json({
                status: 500,
                errorMessage: error.message
            })
        }
    },

    findByShippedDate: async(req, res) => {
        try {
            const bills_shipped_date = await Bills.find({
                shipped_date: req.param.shipped_date
            })
            if (bills_shipped_date.length > 0) {
                res.status(200).json(bills_shipped_date)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Not Found"
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    findBy: async(req, res) => {
        try {
            const bill_statuses = isNumber(req.query.s) ? await Bills.find({
                status: req.query.s
            }) : []

            const user = await Users.findOne({
                name: req.query.s
            })
            const bill_users = await Bills.find({
                user: user ? user.get("_id") : []
            })

            const coupon_code = await Coupons.findOne({
                code: req.query.s
            })
            const bill_coupons = await Bills.find({
                coupon: coupon_code ? coupon_code.get("_id") : []
            })

            if (bill_statuses.length > 0 || bill_coupons.length > 0 || bill_users.length > 0) {
                res.status(200).json(
                    bill_statuses.length > 0 ? bill_statuses :
                    bill_coupons.length > 0 ? bill_coupons :
                    bill_users.length > 0 ? bill_users : []
                )
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Not Found"
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
            const user = await Users.findById(req.body.user)
            const coupon = await Users.findById(req.body.coupon)
            if (user && coupon && user.get("isCustomer") === 1) {
                await user.updateOne({
                    $push: {
                        bills: req.body._id
                    }
                })
                await coupon.updateOne({
                    $push: {
                        bills: req.body._id
                    }
                })
                const bill = new Bills(req.body)
                const result = await bill.save()
                res.status(201).json(result)
            } else if (user && (user.get("isCustomer") === 1 || user.get("isProvider") === 1)) {
                if (user.get("isCustomer") === 1) {
                    const bill = new Bills(req.body)
                    const result = await bill.save()
                    await result.updateOne({
                        $set: {
                            'type': 'X'
                        }
                    })
                    await user.updateOne({
                        $push: {
                            bills: result.get("_id")
                        }
                    })
                    res.status(201).json(result)
                } else {
                    const bill = new Bills(req.body)
                    const result = await bill.save()
                    await result.updateOne({
                        $set: {
                            'type': 'N'
                        }
                    })
                    await user.updateOne({
                        $push: {
                            bills: result.get("_id")
                        }
                    })
                    res.status(201).json(result)
                }
            } else {
                res.status(400).json({
                    status: 400,
                    errorMessage: "We can't find this user or this provider or you are not allowed to buy this product. Please contact with admin"
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
            console.log(req.body.user)
            console.log(req.body.coupon)
            if (bill) {
                if (req.body.coupon && req.body.user) {
                    const user = await Users.findById(req.body.user)
                    const coupon = await Coupons.findById(req.body.coupon)
                    if (user && coupon && user.get("isCustomer") === 1) {
                        if (coupon) {
                            const newCoupon = await Coupons.findById(req.body.coupon)
                            const minimumAmount = newCoupon.minimumAmount
                            let totalPrice = 0
                            bill.billDetails.forEach(billDetail => {
                                totalPrice += billDetail.price
                            })
                            if (totalPrice >= minimumAmount) {
                                const oldCoupon = await Coupons.findById(bill.get("coupon"))
                                await oldCoupon.updateOne({
                                    $pull: {
                                        bills: bill.get("_id")
                                    }
                                })
                                await newCoupon.updateOne({
                                    $push: {
                                        bills: bill.get("_id")
                                    }
                                })
                            } else {
                                res.status(400).json({
                                    status: 400,
                                    errorMessage: "You can't use this coupon because you don't have enough amount"
                                })
                            }
                        }
                        if (user) {
                            const oldUser = await Users.findById(bill.get("user"))
                            await oldUser.updateOne({
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            })
                            const newUser = await Users.findById(req.body.user)
                            await newUser.updateOne({
                                $push: {
                                    bills: bill.get("_id")
                                }
                            })
                        } else {
                            res.status(400).json({
                                status: 400,
                                errorMessage: "We can't find this user or this provider or you are not allowed to buy this product. Please contact with admin"
                            })
                        }
                        await bill.updateOne(req.body)
                        await bill.updateOne({
                            $set: {
                                type: "X"
                            }
                        })
                        res.status(200).json({
                            status: 200,
                            message: "Bill updated successfully"
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: user ? "Not Found user" : coupon ? "Cannot find this coupon" : "You are not allowed to buy this product. Please contact with admin"
                        })
                    }
                } else if (req.body.user) {
                    const user = await Users.findById(req.body.user)
                    if (user && (user.get("isCustomer") === 1 || user.get("isProvider") === 1)) {
                        if (user.get("isCustomer") === 1) {
                            const oldUser = await Users.findById(bill.get("user"))
                            await oldUser.updateOne({
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            })
                            const newUser = await Users.findById(req.body.user)
                            await newUser.updateOne({
                                $push: {
                                    bills: bill.get("_id")
                                }
                            })
                            await bill.updateOne(req.body)
                            await bill.updateOne({
                                $set: {
                                    type: "X"
                                }
                            })
                            res.status(200).json({
                                status: 200,
                                message: "Bill updated successfully"
                            })
                        } else {
                            const oldUser = await Users.findById(bill.get("user"))
                            await oldUser.updateOne({
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            })
                            const newUser = await Users.findById(req.body.user)
                            await newUser.updateOne({
                                $push: {
                                    bills: bill.get("_id")
                                }
                            })
                            await bill.updateOne(req.body)
                            await bill.updateOne({
                                $set: {
                                    type: "N"
                                }
                            })
                            res.status(200).json({
                                status: 200,
                                message: "Bill updated successfully"
                            })
                        }
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: "Not Found user or provider or this user is not a customer"
                        })
                    }
                } else if (req.body.coupon) {
                    if (bill.type === "X") {
                        const coupon = await Coupons.findById(req.body.coupon)
                        if (coupon) {
                            const minimumAmount = coupon.minimumAmount
                            let totalPrice = 0
                            const billDetails = bill.billDetails
                            for (let index in billDetails) {
                                const billDetail = await BillDetails.findById(billDetails[index])
                                totalPrice += billDetail.get("price")
                            }
                            if (totalPrice >= minimumAmount) {
                                const oldCoupon = await Coupons.findById(bill.get("coupon"))
                                if (oldCoupon)
                                    await oldCoupon.updateOne({
                                        $pull: {
                                            bills: bill.get("_id")
                                        }
                                    })
                                const newCoupon = await Coupons.findById(req.body.coupon)
                                await newCoupon.updateOne({
                                    $push: {
                                        bills: bill.get("_id")
                                    }
                                })
                                await bill.updateOne(req.body)
                                res.status(200).json({
                                    status: 200,
                                    message: "Bill updated successfully"
                                })
                            } else {
                                res.status(400).json({
                                    status: 400,
                                    errorMessage: "The total price is not enough to use this coupon"
                                })
                            }
                        } else {
                            res.status(404).json({
                                status: 404,
                                errorMessage: "Not Found coupon"
                            })
                        }
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: "Coupon just apply for imports"
                        })
                    }
                } else {
                    await bill.updateOne(req.body)
                    res.status(200).json({
                        status: 200,
                        message: "Update bill success"
                    })
                }
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Not Found Bill to update."
                })
            }

        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    delete: async(req, res) => {
        try {
            const bill = await Bills.findById(req.params.id)
            if (bill) {
                if (bill.get("billDetails").length > 0) {
                    res.status(400).json({
                        status: 400,
                        errorMessage: "Can't delete this bill because it has bill-details"
                    })
                } else {
                    const user = await Users.findById(bill.get("user"))
                    const coupon = await Coupons.findById(bill.get("coupon"))
                    if (user) {
                        await user.updateOne({
                            $pull: {
                                bills: bill.get("_id")
                            }
                        })
                    }
                    if (coupon) {
                        await coupon.updateOne({
                            $pull: {
                                bills: bill.get("_id")
                            }
                        })
                    }
                    await bill.remove()
                    res.status(200).json({
                        status: 200,
                        message: "Delete bill success"
                    })
                }
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Not Found Bill to delete."
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    },
    findAllBillDetailsByIdBill: async(req, res) => {
        try {
            const bill = await Bills.findById(req.params.id)
            if (bill) {
                const billDetails = bill.get("billDetails")
                if (billDetails.length > 0) {
                    res.status(200).json(billDetails)
                } else {
                    res.status(404).json({
                        status: 404,
                        errorMessage: "Not Found bill-details"
                    })
                }
            } else
                res.status(404).json({
                    status: 404,
                    errorMessage: "Not Found bill"
                })
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message
            })
        }
    }
}

module.exports = BillController