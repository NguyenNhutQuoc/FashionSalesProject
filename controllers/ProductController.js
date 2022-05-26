const {
    CategoriesSchema,
    Products,
    ProductDetails,
    Colors,
    SizesSchema,
    ImagesSchema,
    BillDetails, Trademarks
} = require("../model/model");

const isNumber = require("is-number");
const Console = require("console");
const productController = {
    search: async (req, res) => {
        try {
            const {
                word,
                page,
                limit
            } = req.query
            const categories = await CategoriesSchema.find(
                {
                    name: {
                        $regex: word,
                        $options: "i"
                    }
                }
            )
            const trademark = await Trademarks.find({
                name: {
                    $regex: word,
                    $options: "i"
                }
            })
            if (page || limit) {
                const products = await Products.paginate({
                    $or: [
                        {
                            name: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            material: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            origin: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            unit: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            category: {
                                $regex: categories.get("_id"),
                                $options: "i"
                            }
                        },
                        {
                            trademark: {
                                $regex: trademark.get("_id"),
                                $options: "i"
                            }
                        }
                    ]
                }, {
                    page: page | 1,
                    limit: limit | 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = products
                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const products = await Products.find({
                    $or: [
                        {
                            name: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            material: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            origin: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            unit: {
                                $regex: word,
                                $options: "i"
                            }
                        },
                        {
                            category: {
                                $regex: categories.get("_id"),
                                $options: "i"
                            }
                        },
                        {
                            trademark: {
                                $regex: trademark.get("_id"),
                                $options: "i"
                            }
                        }
                    ]
                })
                res.status(200).json({
                    data: products
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
                const productsAll = await Products.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                let data = []
                const { docs, ...others } = productsAll
                docs.forEach(product => {
                    const comments = product.comments
                    let rating = 0
                    let fiveStar = 0
                    let fourStar = 0
                    let threeStar = 0
                    let twoStar = 0
                    let oneStar = 0
                    for (let index in comments) {
                        comments[index].star === 5 ? fiveStar += 1 :
                            comments[index].star === 4 ? fourStar += 1 :
                                comments[index].star === 3 ? threeStar += 1 :
                                    comments[index].star === 2 ? twoStar += 1 :
                                        comments[index].star === 1 ? oneStar += 1 : null
                        rating += comments[index].star
                    }
                    rating /= comments.length
                    const productObject = product.toObject()
                    productObject.rating = rating > 5 ? 5 : rating
                    productObject.numberOfComments = comments.length
                    productObject.fiveStar = fiveStar
                    productObject.fourStar = fourStar
                    productObject.threeStar = threeStar
                    productObject.twoStar = twoStar
                    productObject.oneStar = oneStar
                    data.push(productObject)
                })
                res.status(200).json({
                    data: data,
                    ...others
                })
            } else {
                const products = await Products.find({}).sort({
                    createdAt: -1
                })
                let data = []
                products.forEach(product => {
                    const comments = product.comments
                    let rating = 0
                    let fiveStar = 0
                    let fourStar = 0
                    let threeStar = 0
                    let twoStar = 0
                    let oneStar = 0
                    for (let index in comments) {
                        comments[index].star === 5 ? fiveStar += 1 :
                            comments[index].star === 4 ? fourStar += 1 :
                                comments[index].star === 3 ? threeStar += 1 :
                                    comments[index].star === 2 ? twoStar += 1 :
                                        comments[index].star === 1 ? oneStar += 1 : null
                        rating += comments[index].star
                    }
                    rating /= comments.length
                    const productObject = product.toObject()
                    productObject.rating = rating > 5 ? 5 : rating
                    productObject.numberOfComments = comments.length
                    productObject.fiveStar = fiveStar
                    productObject.fourStar = fourStar
                    productObject.threeStar = threeStar
                    productObject.twoStar = twoStar
                    productObject.oneStar = oneStar
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
    //****
    findById: async(req, res) => {
        try {
            const product = await Products.findById(req.params.id)
            if (product) {
                let data;
                const comments = product.get("comments")
                let rating = 0
                let fiveStar = 0
                let fourStar = 0
                let threeStar = 0
                let twoStar = 0
                let oneStar = 0
                for (let index in comments) {
                    comments[index].star === 5 ? fiveStar += 1 :
                        comments[index].star === 4 ? fourStar += 1 :
                            comments[index].star === 3 ? threeStar += 1 :
                                comments[index].star === 2 ? twoStar += 1 :
                                    comments[index].star === 1 ? oneStar += 1 : null
                    rating += comments[index].star
                }
                rating /= comments.length
                let productObject = product.toObject()
                productObject.rating = rating > 5 ? 5 : rating
                productObject.numberOfComments = comments.length
                productObject.fiveStar = fiveStar
                productObject.fourStar = fourStar
                productObject.threeStar = threeStar
                productObject.twoStar = twoStar
                productObject.oneStar = oneStar
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
    //***
    findBySlug: async(req, res) => {
        try {
            const product = await Products.findOne({
                slug: req.params.slug
            }).populate('category').populate('productDetails')
            if (product) {
                let data
                const comments = product.get("comments")
                let rating = 0
                let fiveStar = 0
                let fourStar = 0
                let threeStar = 0
                let twoStar = 0
                let oneStar = 0
                for (let index in comments) {
                    comments[index].star === 5 ? fiveStar += 1 :
                        comments[index].star === 4 ? fourStar += 1 :
                            comments[index].star === 3 ? threeStar += 1 :
                                comments[index].star === 2 ? twoStar += 1 :
                                    comments[index].star === 1 ? oneStar += 1 : null
                    rating += comments[index].star
                }
                rating /= comments.length
                let productObject = product.toObject()
                productObject.rating = rating > 5 ? 5 : rating
                productObject.numberOfComments = comments.length
                productObject.fiveStar = fiveStar
                productObject.fourStar = fourStar
                productObject.threeStar = threeStar
                productObject.twoStar = twoStar
                productObject.oneStar = oneStar
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
    findBySizeColor: async(req, res) => {
        try {
            // //id của product
            const productId = await Products.findById(req.params.id)
            const {size_option, color_option} = req.query;

            if (productId) {

                let data = [];
                if(size_option){
                    const sizeSearch = await SizesSchema.findOne({size: size_option});
                    const getSize = sizeSearch.get("_id");
                    const productDetailsSize = await ProductDetails.find({size:getSize})
                    for (let i = 0; i < productDetailsSize.length; i++) {
                        data.push(await Products.findOne({productDetails: productDetailsSize[i]._id}))
                    }
                }else if(color_option){
                    const colorSearch = await Colors.findOne({color: color_option})
                    const getColor = colorSearch.get("_id");
                    const productDetailsColor = await  ProductDetails.find({color: getColor})
                    for (let i = 0; i < productDetailsColor.length; i++) {
                        data.push(await Products.findOne({productDetails: productDetailsColor[i]._id}))
                    }
                }else {
                    const sizeSearch = await SizesSchema.findOne({size: size_option});
                    const getSize = sizeSearch.get("_id");
                    const colorSearch = await Colors.findOne({color: color_option})
                    const getColor = colorSearch.get("_id");
                    const productDetailsSAC = await  ProductDetails.find({size: getSize, color: getColor})
                    for (let i = 0; i < productDetailsSAC.length; i++) {
                        data.push(await Products.findOne({productDetails: productDetailsSAC[i]._id}))
                    }
                }
                console.log("data",data)
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    status: 404,
                    message: "Not found product"
                })
            }

        }catch(e){
            res.status(500).json({
                status: 500,
                errorMessage: e.message,
            });
        }
    },
    create: async(req, res) => {
        try {
            const category = await CategoriesSchema.findById(req.body.category)
            const trademark = await Trademarks.findById(req.body.trademark)
            if (req.body.price && isNumber(req.body.price) && req.body.price > 0 && category && trademark) {
                const product = await Products.create(req.body);
                await category.updateOne({
                    $push: {
                        products: product.get("_id"),
                    },
                });
                await trademark.updateOne({
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
                } else if (req.body.trademark){
                    const oldTrademark = await Trademarks.findById(
                        product.get("trademark")
                    );
                    console.log(oldTrademark)
                    const trademark = await Trademarks.findById(req.body.trademark);
                    if (trademark) {
                        const result = await Products.findByIdAndUpdate(
                            req.params.id,
                            req.body
                        );
                        await oldTrademark.updateOne({
                            $pull: {
                                products: product.get("_id"),
                            },
                        });
                        await trademark.updateOne({
                            $push: {
                                products: product.get("_id"),
                            },
                        });
                        res.status(200).json(result);
                    } else {
                        res.status(404).json({
                            status: 404,
                            errorMessage: "Trademark not found",
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
                    const trademark = await Trademarks.findById(product.get("trademark"))
                    await trademark.updateOne({
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