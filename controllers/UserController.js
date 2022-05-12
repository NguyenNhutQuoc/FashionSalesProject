const {
    Users
} = require('../model/model');
const mongoose = require("mongoose");

const userController = {
    findAll: async(req, res) => {
        try {
            const users = await Users.paginate()
            const {docs, ...others} = users
            res.status(200).json(
                docs
            )
        } catch (err) {
            res.status(500).json({ status: 500, message: err.message })
        }
    },
    findCustomers: async(req, res) => {
        try {
            const users = await Users.find({
                isCustomer: 1
            })
            if (users.length > 0) {
                res.status(200).json(users)
            } else {
                res.status(404).json({ status: 404, errorMessage: 'No customers found' })
            }
        } catch (err) {
            res.status(500).json({ status: 500, errorMessage: err.message })
        }
    },
    findProviders: async(req, res) => {
        try {
            const users = await Users.find({
                isProvider: 1
            })
            if (users.length > 0) {
                res.status(200).json(users)
            } else {
                res.status(404).json({ status: 404, errorMessage: 'No providers found' })
            }
        } catch (e) {
            res.status(500).json({ status: 500, errorMessage: e.message })
        }
    },
    findById: async(req, res) => {
        try {
            const user = await Users.findById(req.params.id)
            if (user) {
                res.status(200).json(user)
            } else {
                res.status(404).json({ status: 404, errorMessage: "User not found" })
            }
        } catch (err) {
            res.status(500).json({ status: 500, errorMessage: err.message })
        }
    },
    findBy: async(req, res) => {
        try {
            const user_name = await Users.find({
                name: req.query.search
            })

            const user_phone = await Users.find({
                phone: req.query.search
            })

            const user_email = await Users.find({
                email: req.query.search
            })

            const user_address = await Users.find({
                address: req.query.search
            })

            const user_bank_account = await Users.find({
                numberBankAccount: req.query.search
            })

            const user_position =
                req.query.search === "admin" ? await Users.find({
                    isAdmin: 1
                }) : req.query.search === "user" ? await Users.find({
                    isCustomer: 1
                }) : await Users.find({
                    isProvider: 1
                })

            if (user_name.length > 0 ||
                user_phone.length > 0 || user_email.length > 0 ||
                user_address.length > 0 || user_bank_account.length > 0 ||
                user_position.length > 0) {
                res.status(200).json(
                    user_name.length > 0 ? user_name :
                    user_phone.length > 0 ? user_phone :
                    user_email.length > 0 ? user_email :
                    user_address.length > 0 ? user_address :
                    user_bank_account.length > 0 ? user_bank_account :
                    user_position.length > 0 ? user_position : []
                )
            } else {
                res.status(404).json({
                    status: 404,
                    message: "Not found"
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    create: async(req, res) => {
        try {
            const user = new Users(req.body)
            const result = await user.save()
            res.status(201).json(result)
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    update: async(req, res) => {
        try {
            const user = await Users.findById(req.params.id)
            if (!user) {
                res.status(404).json({
                    status: 404,
                    message: "Not found"
                })
            } else {
                const result = await Users.findByIdAndUpdate(req.params.id, req.body, {
                    new: true
                })
                res.status(200).json(result)
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
            const user = await Users.findById(req.params.id)
            if (!user) {
                res.status(404).json({
                    status: 404,
                    message: "Not found"
                })
            } else {
                if (user.get('comments').length > 0 || user.get('bills').length > 0) {
                    res.status(400).json({
                        status: 400,
                        message: "User has comments or bills"
                    })
                } else {
                    const result = await Users.findByIdAndDelete(req.params.id)
                    res.status(200).json(result)
                }
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    findAllCommentsByIdUser: async(req, res) => {
        try {
            const user = await Users.findById(req.params.id)
            if (user) {
                const comments = user.get('comments')
                if (comments.length > 0) {
                    res.status(200).json(comments)
                } else {
                    res.status(404).json({
                        status: 404,
                        message: "Not found"
                    })
                }
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    findAllBillsByIdUser: async(req, res) => {
        try {
            const user = await Users.findOne({
                _id: new mongoose.Types.ObjectId(req.params.id)
            })
            if (user) {
                const bills = user.get('bills')
                if (bills.length > 0) {
                    res.status(200).json(bills)
                } else {
                    res.status(404).json({
                        status: 404,
                        message: "Not found"
                    })
                }
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    }
}

module.exports = userController