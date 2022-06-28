const {
    Products,
    Users,
    Bills,
    BillDetails,
    Comments,
    ProductDetails
} = require('../model/model');

const isNumber = require('is-number')
const commentController = {

    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const comments = await Comments.paginate({

                }, {
                    populate: {
                        path: 'user product',
                    },
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = comments
                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const comments = await Comments.find({}).sort({
                    createdAt: -1
                }).populate('user product')
                res.status(200).json({
                    data: comments
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message
            })
        }
    },

    findById: async(req, res) => {
        try {
            const comment = await Comments.findById(req.params.id).populate('user').populate('product');
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
            const commentByStarNumber = await Comments.find({
                star: isNumber(req.query.s) ? req.query.s : -1
            })
            const user = await Users.findOne({
                name: req.query.u
            })
            const commentByUser = await Comments.find({
                user: user ? user.get('_id') : null
            })
            const product = await ProductDetails.findOne({
                name: req.query.p
            })
            const commentByProduct = await Comments.find({
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
            if (req.body.user && req.body.product && req.body.content) {
                const user = await Users.findById(req.body.user)
                const product = await ProductDetails.findById(req.body.product)
                if (user && product) {
                    if (user.isCustomer === 1) {
                        const bill = await Bills.findOne({
                            user: user.get('_id'),
                            status: 3
                        })
                        console.log(bill)
                        if (bill) {
                            const billDetail = await BillDetails.findOne({
                                bill: bill.get('_id'),
                                productDetail: product.get('_id')
                            })
                            if (billDetail) {
                                const comment = new Comments(req.body)
                                const result = await comment.save()
                                if (req.body.parent) {
                                    const commentParent = await Comments.findById(result.parent)
                                    await commentParent.update({
                                        $push: {
                                            children: result.get('_id')
                                        }
                                    })
                                }
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
                        const comment = new Comments(req.body)
                        const result = await comment.save()
                        if (req.body.parent) {
                            const commentParent = await Comments.findById(result.parent)
                            await commentParent.update({
                                $push: {
                                    children: result.get('_id')
                                }
                            })
                        }
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
            const comment = await Comments.findById(req.params.id)
            if (comment) {
                if (req.body.user && req.body.product) {
                    const user = await Users.findById(req.body.user)
                    const product = await ProductDetails.findById(req.body.product)
                    if (user && product) {
                        const bill = await Bills.findOne({
                            user: user.get('_id'),
                        })
                        if (bill || user.get('isAdmin') === 1) {
                            const billDetail = await BillDetails.findOne({
                                bill: bill.get('_id'),
                                productDetail: product.get('_id')
                            })
                            if (billDetail) {
                                const oldUser = await Users.findById(comment.get('user'))
                                const oldProduct = await ProductDetails.findById(comment.get('product'))
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
                                productDetail: comment.get('product')
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
                    const product = await ProductDetails.findById(req.body.product)
                    if (product) {
                        const bill = await Bills.findOne({
                            user: comment.get('user'),
                        })
                        if (bill) {
                            const billDetail = await BillDetails.findOne({
                                bill: bill.get('_id'),
                                productDetail: product.get('_id')
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
            const comment = await Comments.findById(req.params.id)
            const userAdmin = await Users.findById(req.params.user)
            const checkAdmin = userAdmin.get("isAdmin") === 1;
            if (comment && checkAdmin) {
                const user = await Users.findById(comment.get('user'))
                console.log(user.get('name'))
                const product = await ProductDetails.findById(comment.get('product'))
                if (comment.children.length > 0) {
                    const children = comment.children
                    for (const child of children) {
                        await Comments.deleteOne({
                            _id: child.get('_id')
                        })
                    }
                }
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
                await comment.remove()
                res.status(200).json({
                    message: 'Deleted successfully'
                })
            } else {
                res.status(401).json({
                    status: 401,
                    errorMessage: 'Authentication failed'
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