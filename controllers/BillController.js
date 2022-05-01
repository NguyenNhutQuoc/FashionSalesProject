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

const BillController = {
    findAll: async (req, res) => {
        try {
            const bill = await Bills.find()
            res.json(bill)
        } catch (error) {
            res.json({
                status: 500,
                errorMessage: error.message
            })
        }

    },

    findByDate: async (req, res) => {
        try {
            const bill_date = await Bills.find({
                date: req.param.date
            })
            if (bill_date.length > 0) {
                res.status(200).json(bill_date)
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
    findByShippedDate: async (req, res) => {
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
    findBy: async (req, res) => {
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
    create: async (req, res) => {
        try {
            const user = await Users.findById(req.body.user)
            const coupon = await Users.findById(req.body.coupon)

            if (user && coupon && user.get("is-customer") === 1) {
                await user.updateOne(
                    {
                        $push: {
                            bills: req.body._id
                        }
                    }
                )
                await coupon.updateOne(
                    {
                        $push: {
                            bills: req.body._id
                        }
                    }
                )
                const bill = new Bills(req.body)
                const result = await bill.save()
                res.status(201).json(result)
            } else if (user && user.get("is-customer") === 1) {
                const bill = new Bills(req.body)
                const result = await bill.save()
                await user.updateOne(
                    {
                        $push: {
                            bills: bill.get("_id")
                        }
                    }
                )
                res.status(201).json(result)
            }
            else {
                res.status(400).json({
                    status: 400,
                    errorMessage: "We can't find this user or you are not allowed to buy this product. Please contact with admin"
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            })
        }
    },
    update: async (req, res) => {
        try {
            const bill = await Bills.findById(req.params.id)
            console.log(req.body.user)
            console.log(req.body.coupon)
            if (bill) {
                if (req.body.coupon && req.body.user) {
                    const user = await Users.findById(req.body.user)
                    const coupon = await Coupons.findById(req.body.coupon)
                    if (user && coupon  && user.get("is-customer") === 1) {
                        if (coupon) {
                            const oldCoupon = await Coupons.findById(bill.get("coupon"))
                            await oldCoupon.updateOne({
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            })
                            const newCoupon = await Coupons.findById(req.body.coupon)
                            await newCoupon.updateOne(
                                {
                                    $push: {
                                        bills: bill.get("_id")
                                    }
                                }
                            )
                        }
                        if (user) {
                            const oldUser = await Users.findById(bill.get("user"))
                            await oldUser.updateOne(
                                {
                                    $pull: {
                                        bills: bill.get("_id")
                                    }
                                }
                            )
                            const newUser = await Users.findById(req.body.user)
                            await newUser.updateOne(
                                {
                                    $push: {
                                        bills: bill.get("_id")
                                    }
                                }
                            )
                        }
                        await bill.updateOne(req.body)
                        res.status(200).json({
                            status: 200,
                            message: "Bill updated successfully"
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: user ? "Not Found user" : coupon ? "Cannot find this coupon": "You are not allowed to buy this product. Please contact with admin"
                        })
                    }
                } else if (req.body.user) {
                    const user = await Users.findById(req.body.user)
                    if (user && user.get("is-customer") === 1) {
                        const oldUser = await Users.findById(bill.get("user"))
                        await oldUser.updateOne(
                            {
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            }
                        )
                        const newUser = await Users.findById(req.body.user)
                        await newUser.updateOne(
                            {
                                $push: {
                                    bills: bill.get("_id")
                                }
                            }
                        )
                        await bill.updateOne(req.body)
                        res.status(200).json({
                            status: 200,
                            message: "Bill updated successfully"
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: "Not Found user or this user is not a customer"
                        })
                    }
                } else if (req.body.coupon) {
                    const coupon = await Coupons.findById(req.body.coupon)
                    if (coupon) {
                        const oldCoupon = await Coupons.findById(bill.get("coupon"))
                        await oldCoupon.updateOne({
                            $pull: {
                                bills: bill.get("_id")
                            }
                        })
                        const newCoupon = await Coupons.findById(req.body.coupon)
                        await newCoupon.updateOne(
                            {
                                $push: {
                                    bills: bill.get("_id")
                                }
                            }
                        )
                        await bill.updateOne(req.body)
                        res.status(200).json({
                            status: 200,
                            message: "Bill updated successfully"
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: "Not Found coupon"
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
    delete: async (req, res) => {
        try {
            const bill = await Bills.findById(req.params.id)
            if (bill) {
                if (bill.get("bill-details").length > 0) {
                    res.status(400).json({
                        status: 400,
                        errorMessage: "Can't delete this bill because it has bill-details"
                    })
                } else {
                    const user = await Users.findById(bill.get("user"))
                    const coupon = await Coupons.findById(bill.get("coupon"))
                    if (user) {
                        await user.updateOne(
                            {
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            }
                        )
                    }
                    if (coupon) {
                        await coupon.updateOne(
                            {
                                $pull: {
                                    bills: bill.get("_id")
                                }
                            }
                        )
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
    }
}

module.exports = BillController