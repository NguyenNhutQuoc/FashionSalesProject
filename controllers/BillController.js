const {
    Coupons,
    Users,
    Bills,
    BillDetails
} = require('../model/model');

const isNumber = require('is-number')

const BillController = {

    findAllBillByIdUser: async(req, res) => {
        try {
            const { id } = req.params;

            const bills = await Bills.find({
                user: id
            }).populate('billDetails').sort({
                createdAt: -1
            });
            res.status(200).json({
                data: bills
            })
        } catch (error) {
            res.status(500).json(error);
        }
    },
    findBillByStatusAndUserId: async(req, res) => {
        try {
            const {user} = req.params;
            const {status} = req.query;
            const bill = await Bills.find({
                user: user,
                status: status,
                type: 'X'
            }).populate('user').populate('billDetails')
            console.log("hello")
            res.status(200).json(bill);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    getRevenueDaily: async (req, res) => {
        let startToday;
        let endToday;
        try {
            startToday = new Date()
            endToday = new Date()
            startToday.setHours(0, 0, 0, 0)
            endToday.setHours(23, 59, 59, 999)
            const allBillExported = await Bills.find({
                type: 'X',
                status: 3,
                createdAt: {
                    $gte: startToday,
                    $lte: endToday
                }
            })
            let data = []
            for (let hour = 0; hour <= 21; hour++) {
                let total = 0
                for (const bill of allBillExported) {
                    if (bill.createdAt.getHours() === hour) {
                        total += bill.totalPrice
                    }
                }
                data.push({
                    hour: hour,
                    total: total
                })
            }
            res.status(200).json(
                {
                    data: data
                }
            )
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },

    calculateTotalRevenue: async (req, res) => {
        try {
            const allBillExported = await Bills.find({
                type: 'X',
                status: 3,
            })
            const allBillImported = await Bills.find({
                type: 'N',
                status: 3,
            })

            const years = new Set()
            for (const bill of allBillExported) {
                years.add(bill.createdAt.getFullYear())
            }
            for (const bill of allBillImported) {
                years.add(bill.createdAt.getFullYear())
            }
            let dataImport = []
            let dataProfit = []
            let dataExport = []
            for (const year of years) {
                const billExport = await Bills.find({
                    type: 'X',
                    status: 3,
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lt: new Date(year + 1, 0, 1)
                    }
                })
                const billImport = await Bills.find({
                    type: 'N',
                    status: 3,
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lt: new Date(year + 1, 0, 1)
                    }
                })
                let totalExport = 0
                for (const bill of billExport) {
                    totalExport += bill.feeShip
                    totalExport += bill.totalPrice
                }
                let totalImport = 0
                for (const bill of billImport) {
                    totalImport += bill.feeShip
                    totalImport += bill.totalPrice
                }
                dataExport.push(
                    {
                        year: year,
                        total: totalExport
                    }
                )
                dataImport.push(
                    {
                        year: year,
                        total: totalImport
                    }
                )
                dataProfit.push(
                    {
                        year: year,
                        total: totalExport - totalImport
                    }
                )
            }
            res.status(200).json({
                dataTotalRevenueByYears: dataExport,
                dataTotalCostOfGoodsSold: dataImport,
                dataTotalProfit: dataProfit
            })
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    },
    findByDate: async(req, res) => {
        try {
            let {
                fromDate,
                toDate,
                page,
                limit
            } = req.query
            if (!fromDate)
                fromDate = "2000-01-01"
            if (!toDate)
                toDate = new Date().toString()
            console.log(fromDate, toDate)
            if (page || limit) {
                const bills = await Bills.paginate({
                    createdAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }, {
                    page: page || 1,
                    limit: limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const { docs, ...others } = bills
                return res.json({
                    data: docs,
                    ...others
                })
            } else {
                const bills = await Bills.find({
                    createdAt: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }).sort({
                    createdAt: -1
                }).populate('user')
                res.json({
                    data: bills
                })
            }
        } catch (e) {
            console.log(e)
            res.json({
                error: e
            })
        }
    },
    search: async(req, res) => {
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
                        user: user ? user.get('_id') : null
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
            const { docs, ...others } = bills
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
                $or: [{
                        user: user ? user.get('_id') : null
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
                const { docs, ...others } = bills

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const bills = await Bills.find().sort({
                    createdAt: -1
                }).populate('user').populate('billDetails')

                res.status(200).json({
                    data: bills

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
                const { docs, ...others } = bills

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const bills = await Bills.find({
                    type: 'N'
                }).populate('user').populate('billDetails')

                res.status(200).json({
                    data: bills,

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
                const { docs, ...others } = bills

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const bills = await Bills.find({
                    type: 'X'
                }).populate('user').populate('billDetails')

                res.status(200).json({
                    data: bills,

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
                res.status(200).json(bill)
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
                await result.updateOne({
                    $set: {
                        'type': 'X'
                    }
                })

                await result.updateOne( {
                    $push: {
                        statusDetails: {
                            date: result.get("createdAt"),
                            status: result.get("status")
                        }
                    }
                })
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
                    await result.updateOne( {
                        $push: {
                            statusDetails: {
                                date: result.get("createdAt"),
                                status: result.get("status")
                            }
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
            if (bill) {
                const oldStatus = bill.status
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
                        if (req.body.status && req.body.status !== oldStatus) {
                            await bill.updateOne({
                                $push: {
                                    statusDetails: {
                                        date: bill.get("updatedAt"),
                                        status: req.body.status
                                    }
                                }
                            })
                        }
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
                            if (req.body.status && req.body.status !== oldStatus) {
                                await bill.updateOne({
                                    $push: {
                                        statusDetails: {
                                            date: bill.get("updatedAt"),
                                            status: req.body.status
                                        }
                                    }
                                })
                            }
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
                                if (req.body.status && req.body.status !== oldStatus) {
                                    await bill.updateOne({
                                        $push: {
                                            statusDetails: {
                                                date: bill.get("updatedAt"),
                                                status: req.body.status
                                            }
                                        }
                                    })
                                }
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
                    if (req.body.status && req.body.status !== oldStatus) {
                        await bill.updateOne({
                            $push: {
                                statusDetails: {
                                    date: bill.get("updatedAt"),
                                    status: req.body.status
                                }
                            }
                        })
                    }
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
                data = []
                for (const id of billDetails) {
                    const billDetail = await BillDetails.findById(id)
                    data.push(billDetail)
                }
                res.status(200).json(data)
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