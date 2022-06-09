const {
    Users
} = require('../model/model');
const mongoose = require("mongoose");

const bcrpyt = require('bcrypt')

const userController = {
    findByPhoneNumber: async (req, res) => {
        const user = await Users.findOne({
            phone: req.params.phone
        })
        res.status(200).json(
            user
        )
    },
    findByUserId: async (req, res) => {
        const user = await Users.findOne({
            id: req.params.id
        })
        res.status(200).json(
            user
        )
    },
    search: async (req, res) => {
        try {
            const {
                q,
                page,
                limit,
                auth
            } = req.query;
            const regex = new RegExp(q, 'i');
            if (page || limit) {
                const users = await Users.paginate({
                    $or: [{
                        name: regex
                    },
                        {
                            email: regex
                        },
                        {
                            phone: regex
                        },
                        {
                            address: regex
                        },
                        {
                            address: regex
                        },
                        {
                            numberAccount: regex
                        },
                    ],
                    isAdmin: 0,
                    isCustomer: auth === "customer" ? 1 : 0,
                    isProvider: auth === "provider" ? 1 : 0,
                }, {
                    page: page | 1,
                    limit: limit | 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = users
                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const users = await Users.find({
                    $or: [{
                        name: regex
                    },
                        {
                            email: regex
                        },
                        {
                            phone: regex
                        },
                        {
                            address: regex
                        },
                        {
                            address: regex
                        },
                        {
                            numberAccount: regex
                        },
                    ],
                    isAdmin: 0,
                    isCustomer: auth === "customer" ? 1 : 0,
                    isProvider: auth === "provider" ? 1 : 0,
                })
                res.status(200).json({
                    data: users
                })
            }
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    },
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const users = await Users.paginate({

                }, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = users

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const users = await Users.find().sort({
                    createdAt: -1
                });
                res.status(200).json({
                    data: users
                });
            }
        } catch (err) {
            res.status(500).json({ status: 500, message: err.message })
        }
    },
    //**
    findCustomers: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const users = await Users.paginate({
                    isCustomer: 1
                }, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                })
                const {docs, ...others} = users

                res.status(200).json({
                    data: docs,
                    ...others
                })

            } else {
                const users = await Users.find({isCustomer: 1});
                res.status(200).json({
                    data: users,
                })
            }
        } catch (err) {
            res.status(500).json({ status: 500, errorMessage: err.message })
        }
    },
    findProviders: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const users = await Users.paginate({
                    isProvider: 1
                }, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                })
                const {docs, ...others} = users

                res.status(200).json({
                    data: docs,
                    ...others
                })

            } else {
                const users = await Users.find({isProvider: 1});
                res.status(200).json({
                    data: users
                })
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
    findByEmail: async (req, res) => {
        try {
            const user = await Users.findOne({
                email: req.params.email
            })
            res.status(200).json(user)
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
    login: async(req, res) => {
        try {
            const { email, password } = req.body
            const user = await Users.findOne({
                email: email,
            })
            if (!user) {
                res.status(200).json(null)
            }else {
                const validPassword = await bcrpyt.compare(password, user.password)
                if (!validPassword) {
                    res.status(200).json(null)
                } else {
                    res.status(200).json(
                        user
                    )
                }
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
                    
            if (req.body.password) {
                const salt = bcrpyt.genSalt(10)
                const hased = await bcrpyt.hash(req.body.password, salt)
                req.body.password = hased
            }
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
            if (req.body.password) {
                const salt = bcrpyt.genSalt(10)
                const hased = await bcrpyt.hash(req.body.password, salt)
                req.body.password = hased
            }
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