const {
    CategoriesSchema,
    Products,
    ProductDetails,
    Colors,
    SizesSchema,
    ImagesSchema,
    BillDetails
} = require("../model/model");

const isNumber = require("is-number");
const productController = {
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const productsAll = await Products.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                })
                let data = []
                const { docs, ...others } = productsAll
                docs.forEach(product => {
                    const comments = product.comments
                    let rating = 0
                    for (let index in comments) {
                        rating += comments[index].star
                    }
                    rating /= comments.length
                    const productObject = product.toObject()
                    productObject.rating = rating > 5 ? 5 : rating
                    data.push(productObject)
                })

                res.status(200).json({
                    data: data,
                    ...others
                })
            } else {
                const products = await Products.find({})
                let data = []
                products.forEach(product => {
                    const comments = product.comments
                    let rating = 0
                    for (let index in comments) {
                        rating += comments[index].star
                    }
                    rating /= comments.length
                    const productObject = product.toObject()
                    productObject.rating = rating > 5 ? 5 : rating
                    data.push(productObject)
                })
                res.status(200).json({
                    data: data
                })
            }

        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    findById: async(req, res) => {
        try {
            const product = await Products.findById(req.params.id)
            if (product) {
                let data;
                const comments = product.get("comments")
                let rating = 0
                for (let index in comments) {
                    rating += comments[index].star
                }
                rating /= comments.length
                let productObject = product.toObject()
                productObject.rating = rating > 5 ? 5 : rating
                data = productObject
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Product not found",
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            })
        }
    },
    findBySlug: async(req, res) => {
        try {
            const product = await Products.findOne({
                slug: req.params.slug
            }).populate('category').populate('productDetails')
            if (product) {
                let data
                const comments = product.comments
                let rating = 0
                for (let index in comments) {
                    rating += comments[index].star
                }
                rating /= comments.length
                data = {
                    "Product": product,
                    "Rating": rating
                }
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Product not found",
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            })
        }
    },
    findByName: async(req, res) => {
        try {
            const {
                name
            } = req.params;
            const products = await Products.find({
                name: {
                    $regex: name,
                    $options: "i"
                }
            });
            res.status(200).json(products);
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    findBy: async(req, res) => {
        try {
            const {
                material_option,
                origin_option,
                category_option
            } = req.query;
            const category = await CategoriesSchema.findOne({
                name: category_option
            })
            if ((!material_option && !category_option) || (!material_option && !origin_option) || (!origin_option && !category_option)) {
                const products = (!material_option && !category_option) ? await Products.find({
                    origin: origin_option,
                }) : (!material_option && origin_option) ? await Products.find({
                    category: category.get("_id"),
                }) : await Products.find({
                    material: material_option
                })
                res.status(200).json(products);
            } else {
                const products = !material_option ? await Products.find({
                    category: category.get("_id"),
                    origin: origin_option
                }) : !origin_option ? await Products.find({
                    category: category.get("_id"),
                    material: material_option
                }) : !category_option ? await Products.find({
                    material: material_option,
                    origin: origin_option
                }) : await Products.find({
                    material: material_option,
                    origin: origin_option,
                    category: category.get("_id")
                })
                res.status(200).json(products);
            }

        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },

    create: async(req, res) => {
        try {
            const category = await CategoriesSchema.findById(req.body.category)
            if (req.body.price && isNumber(req.body.price) && req.body.price > 0 && category) {
                const product = await Products.create(req.body);
                await category.updateOne({
                    $push: {
                        products: product.get("_id"),
                    },
                });
                res.status(201).json(product);
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Category not found or price is not a number or price is 0",
                });
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    update: async(req, res) => {
        try {
            const product = await Products.findById(req.params.id);
            if (product) {
                if (req.body.category) {
                    const oldCategory = await CategoriesSchema.findById(
                        product.get("category")
                    );
                    console.log(oldCategory)
                    const category = await CategoriesSchema.findById(req.body.category);
                    console.log(category)
                    if (category) {
                        const result = await Products.findByIdAndUpdate(
                            req.params.id,
                            req.body
                        );
                        await oldCategory.updateOne({
                            $pull: {
                                products: product.get("_id"),
                            },
                        });
                        await category.updateOne({
                            $push: {
                                products: product.get("_id"),
                            },
                        });
                        res.status(200).json(result);
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: "Category not found",
                        });
                    }
                } else {
                    const result = await Products.findByIdAndUpdate(
                        req.params.id,
                        req.body
                    );
                    res.status(200).json(result);
                }
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Product not found",
                });
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    delete: async(req, res) => {
        try {
            let checkDelete = 0
            const product = await Products.findById(req.params.id);
            if (product) {
                if (product.get("comments").length > 0) {
                    res.status(400).json({
                        status: 400,
                        errorMessage: "You can't delete it",
                    });
                } else {
                    const category = await CategoriesSchema.findById(product.get("category"))
                    await category.updateOne({
                        $pull: {
                            products: product.get("_id"),
                        },
                    });
                    const productDetails = await ProductDetails.find({
                        product: product.get("_id")
                    })
                    for (let productDetail of productDetails) {
                        const color = await Colors.findById(productDetail.get("color"))
                        const size = await SizesSchema.findById(productDetail.get("size"))
                        const images = await ImagesSchema.findById(productDetail.get("images")[0])
                        const billDetails = productDetail.get("billDetails")
                        if (billDetails.length === 0) {
                            if (color) {
                                await color.updateOne({
                                    $pull: {
                                        productDetails: productDetail.get("_id"),
                                    },
                                });
                            }
                            if (size) {
                                await size.updateOne({
                                    $pull: {
                                        productDetails: productDetail.get("_id"),
                                    },
                                });
                            }
                            if (images) {
                                await images.remove()
                            }
                            await productDetail.remove()
                        } else {
                            checkDelete = 1
                        }
                    }
                    if (checkDelete === 0) {
                        await product.remove()
                        res.status(200).json({
                            status: 200,
                            message: "Delete success",
                        });
                    } else {
                        res.status(400).json({
                            status: 400,
                            errorMessage: "You can't delete it",
                        });
                    }
                }
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    findAllCommentsBySlugProduct: async(req, res) => {
        try {
            const product = await Products.findOne({ slug: req.params.slug })
            if (product) {
                const comments = product.get("comments");
                if (comments.length > 0) {
                    res.status(200).json(comments);
                } else {
                    res.status(404).json({
                        status: 404,
                        errorMessage: "Comments not found",
                    });
                }
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Product not found",
                });
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    findAllProductDetailsBySlugProduct: async(req, res) => {
        try {
            const product = await Products.findOne({
                slug: req.params.slug,
            })
            if (product) {
                const properties = product.get('productDetails');
                if (properties.length > 0) {
                    res.status(200).json(properties)
                } else {
                    res.status(404).json({
                        status: 404,
                        errorMessage: "Properties not found with this slug product",
                    })
                }
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message,
            })
        }
    },
}

module.exports = productController;