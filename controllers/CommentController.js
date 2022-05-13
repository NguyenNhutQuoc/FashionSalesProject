const {
    Products,
    Users,
    Bills,
    BillDetails,
    CommentsSchema
} = require('../model/model');

const isNumber = require('is-number')
const commentController = {

    findAll: async(req, res) => {
        try {
            const comments = await CommentsSchema.paginate({}, {
                populate: {
                    path: 'user product',
                },
                page: req.query.page || 1,
                limit: req.query.limit || 10,
            })
            const { docs, ...others } = comments
            docs.push(others)
            res.status(200).json(docs)
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },

    findById: async(req, res) => {
        try {
            const comment = await CommentsSchema.findById(req.params.id).populate('user').populate('product');
            if (comment) {
                res.status(200).json(comment)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Comment not found'
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
            const commentByStarNumber = await CommentsSchema.find({
                star: isNumber(req.query.s) ? req.query.s : -1
            })
            const user = await Users.findOne({
                name: req.query.u
            })
            const commentByUser = await CommentsSchema.find({
                user: user ? user.get('_id') : null
            })
            const product = await Products.findOne({
                name: req.query.p
            })
            const commentByProduct = await CommentsSchema.find({
                product: product ? product.get('_id') : null
            })

            if (commentByStarNumber.length > 0 || commentByProduct.length > 0 || commentByUser.length > 0) {
                res.status(200).json(
                    commentByStarNumber.length > 0 ? commentByStarNumber : commentByProduct.length > 0 ? commentByProduct :
                    commentByUser.length > 0 ? commentByUser : null
                )
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Not found any comment'
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
            if (req.body.user && req.body.product && req.body.star && req.body.content && isNumber(req.body.star)) {
                const user = await Users.findById(req.body.user)
                const product = await Products.findById(req.body.product)
                if (user && product && req.body.star >= 0) {
                    const bill = await Bills.findOne({
                        user: user.get('_id'),
                        status: 2
                    })
                    if (bill || user.get('isAdmin') === 1) {
                        const billDetail = await BillDetails.findOne({
                            bill: bill.get('_id'),
                            product: product.get('_id')
                        })
                        if (billDetail) {
                            const comment = new CommentsSchema(req.body)
                            const result = await comment.save()
                            await user.updateOne({
                                $push: {
                                    comments: result.get('_id')
                                }
                            })
                            await product.updateOne({
                                $push: {
                                    comments: result.get('_id')
                                }
                            })
                            res.status(201).json(comment)
                        } else {
                            res.status(400).json({
                                status: 400,
                                errorMessage: 'This user has not bought this product yet.'
                            })
                        }
                    } else {
                        res.status(400).json({
                            status: 400,
                            errorMessage: 'User has not bought any product'
                        })
                    }
                } else {
                    res.status(404).json({
                        status: 404,
                        errorMessage: 'Not found any' + user ? ' product' : ' user or star is invalid input'
                    })
                }
            } else {
                res.status(400).json({
                    status: 400,
                    errorMessage: 'Bad request. You need to input ' + req.body.user ? 'user' : req.body.product ? 'product' : req.body.star ? 'star' : req.body.content ? 'content' : isNumber(req.body.star) ? 'valid star' : 'all'
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    update: async(req, res) => {
        try {
            const comment = await CommentsSchema.findById(req.params.id)
            if (comment) {
                if (req.body.user && req.body.product) {
                    const user = await Users.findById(req.body.user)
                    const product = await Products.findById(req.body.product)
                    if (user && product) {
                        const bill = await Bills.findOne({
                            user: user.get('_id'),
                        })
                        if (bill || user.get('isAdmin') === 1) {
                            const billDetail = await BillDetails.findOne({
                                bill: bill.get('_id'),
                                product: product.get('_id')
                            })
                            if (billDetail) {
                                const oldUser = await Users.findById(comment.get('user'))
                                const oldProduct = await Products.findById(comment.get('product'))
                                if (req.body.star) {
                                    if (isNumber(req.body.star) && req.body.star >= 0) {
                                        await comment.updateOne(req.body)
                                    } else {
                                        res.status(400).json({
                                            status: 400,
                                            errorMessage: 'Bad request. Star is invalid input'
                                        })
                                    }
                                } else {
                                    await comment.updateOne(req.body)
                                }
                                await oldUser.updateOne({
                                    $pull: {
                                        comments: comment.get('_id')
                                    }
                                })
                                await oldProduct.updateOne({
                                    $pull: {
                                        comments: comment.get('_id')
                                    }
                                })
                                await user.updateOne({
                                    $push: {
                                        comments: comment.get('_id')
                                    }
                                })
                                await product.updateOne({
                                    $push: {
                                        comments: comment.get('_id')
                                    }
                                })
                            } else {
                                res.status(400).json({
                                    status: 400,
                                    errorMessage: 'This user has not bought this product'
                                })
                            }
                        } else {
                            res.status(400).json({
                                status: 400,
                                errorMessage: 'This user have not had any bill'
                            })
                        }
                    } else {
                        res.status(400).json({
                            status: 400,
                            errorMessage: 'User or product is not exist or user is not a customer'
                        })
                    }
                } else if (req.body.user) {
                    const user = await Users.findById(req.body.user)
                    if (user) {
                        const bill = await Bills.findOne({
                            user: user.get('_id'),
                        })
                        if (bill || user.get('isAdmin') === 1) {
                            const billDetail = await BillDetails.findOne({
                                bill: bill.get('_id'),
                                product: comment.get('product')
                            })
                            if (billDetail) {
                                const oldUser = await Users.findById(comment.get('user'))
                                if (req.body.star) {
                                    if (isNumber(req.body.star) && req.body.star >= 0) {
                                        await comment.updateOne(req.body)
                                    } else {
                                        res.status(400).json({
                                            status: 400,
                                            errorMessage: 'Bad request. Star is invalid input'
                                        })
                                    }
                                } else {
                                    await comment.updateOne(req.body)
                                }
                                await oldUser.updateOne({
                                    $pull: {
                                        comments: comment.get('_id')
                                    }
                                })
                                await user.updateOne({
                                    $push: {
                                        comments: comment.get('_id')
                                    }
                                })
                                res.status(200).json(
                                    "Update comment successfully"
                                )
                            } else {
                                res.status(400).json({
                                    status: 400,
                                    errorMessage: 'This user has not bought this product'
                                })
                            }
                        } else {
                            res.status(400).json({
                                status: 400,
                                errorMessage: 'This user have not had any bill'
                            })
                        }
                    } else {
                        res.status(400).json({
                            status: 400,
                            errorMessage: 'User is not exist'
                        })
                    }
                } else if (req.body.product) {
                    const product = await Products.findById(req.body.product)
                    if (product) {
                        const bill = await Bills.findOne({
                            user: comment.get('user'),
                        })
                        if (bill) {
                            const billDetail = await BillDetails.findOne({
                                bill: bill.get('_id'),
                                product: product.get('_id')
                            })
                            if (billDetail) {
                                const oldProduct = await Products.findById(comment.get('product'))
                                if (req.body.star) {
                                    if (isNumber(req.body.star) && req.body.star >= 0) {
                                        await comment.updateOne(req.body)
                                    } else {
                                        res.status(400).json({
                                            status: 400,
                                            errorMessage: 'Bad request. Star is invalid input'
                                        })
                                    }
                                } else {
                                    await comment.updateOne(req.body)
                                }
                                await oldProduct.updateOne({
                                    $pull: {
                                        comments: comment.get('_id')
                                    }
                                })
                                await product.updateOne({
                                    $push: {
                                        comments: comment.get('_id')
                                    }
                                })
                                res.status(200).json(
                                    "Update comment successfully"
                                )
                            } else {
                                res.status(400).json({
                                    status: 400,
                                    errorMessage: 'This user has not bought this product'
                                })
                            }
                        } else {
                            res.status(400).json({
                                status: 400,
                                errorMessage: 'This user have not had any bill'
                            })
                        }
                    } else {
                        res.status(400).json({
                            status: 400,
                            errorMessage: 'Product is not exist'
                        })
                    }
                } else {
                    if (req.body.star) {
                        if (isNumber(req.body.star) && req.body.star >= 0) {
                            await comment.updateOne(req.body)
                        } else {
                            res.status(400).json({
                                status: 400,
                                errorMessage: 'Bad request. Star is invalid input'
                            })
                        }
                    } else {
                        await comment.updateOne(req.body)
                    }
                    res.status(200).json(
                        "Update comment successfully"
                    )
                }
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Not found any comment'
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
            const comment = await CommentsSchema.findById(req.params.id)
            if (comment) {
                const user = await Users.findById(comment.get('user'))
                const product = await Products.findById(comment.get('product'))
                await comment.remove()
                await user.updateOne({
                    $pull: {
                        comments: comment.get('_id')
                    }
                })
                await product.updateOne({
                    $pull: {
                        comments: comment.get('_id')
                    }
                })
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: 'Not found any comment'
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    }
}

module.exports = commentController