const { Categories, Trademarks, BillDetails, Bills, Users, Colors, Sizes} = require("../model/model");

const categoryController = {
    //***
    searchAllPropertiesIntoCategory: async (req, res) => {
        let data = {}
        let material_options = []
        let color_options = []
        let size_options =  []
        let origin_options = []
        let provider_options = []
        let price_options = []
        let trademark_options = []
        const category = await Categories.findOne({
            where: {
                _id: req.params.id
            }
        })
        if (category) {
            const products = category.products
            for (const product of products) {
                if (product.material) {
                    if (!material_options.includes(product.material)) {
                        material_options.push(product.material)
                    }
                }
                if (product.origin) {
                    if (!origin_options.includes(product.origin)) {
                        origin_options.push(product.origin)
                    }
                }
                if (product.price) {
                    if (!price_options.includes(product.price)) {
                        price_options.push(product.price)
                    }
                }
                if (product.trademark) {
                    const trademark = await Trademarks.findById(product.trademark)
                    if (trademark) {
                        if (!trademark_options.includes(trademark.get('name'))) {
                            trademark_options.push(trademark.get('name'))
                        }
                    }
                }
                const productDetails = product.get('productDetails')
                for (const detail of productDetails) {
                    if (detail.color) {
                        const color = await Colors.findById(detail.color)
                        if (!color_options.includes(color.get('color'))) {
                            color_options.push(color.get('color'))
                        }
                    }
                    if (detail.size) {

                        const size = await Sizes.findById(detail.size)
                        if (!size_options.includes(size.get('size'))) {
                            size_options.push(size.get('size'))
                        }
                    }
                    const billDetails = detail.get('billDetails')
                    for (const billDetail_id of billDetails) {
                        const billDetail = await BillDetails.findById(billDetail_id)
                        const bill = await Bills.findById(billDetail.bill)
                        if (bill.type === 'N') {
                            const provider = await Users.findById(bill.user)
                            if (provider) {
                                const provider_name = provider.get('name')
                                if (!provider_options.includes(provider_name)) {
                                    provider_options.push(provider_name)
                                }
                            }
                        }
                    }
                }
            }
        }
        data.material = material_options
        data.color = color_options
        data.size = size_options
        data.origin = origin_options
        data.provider = provider_options
        data.price = price_options
        data.trademark = trademark_options
        res.status(200).json(
            {
                data: data
            }
        )
    },
    search: async (req, res) => {
        try {
            const {q, page, limit} = req.query
            const regex = new RegExp(q, 'i')
            if (page || limit) {
                const categories = await Categories.paginate({
                    name: regex
                }, {
                    page: page | 1,
                    limit: limit | 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = categories
                res.status(200).json(
                    {
                        data: docs,
                        ...others
                    }
                )
            } else {
                const categories = await Categories.find({
                    name: regex
                })
                res.status(200).json(
                    {
                        data: categories
                    }
                )
            }
        } catch (e) {
            res.status(500).json(
                {
                    message: e.message
                }
            )
        }
    },
    findAll: async (req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const categories = await Categories.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = categories

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                //**
                const categories = await Categories.find({}).sort({
                    createdAt: -1
                })
                res.status(200).json({
                    data: categories
                })
            }
        } catch (err) {
            res.status(500).json({
                status: "500",
                errorMessage: err.message || "Some error occurred while retrieving categories."
            })
        }

    },
    findById: async (req, res) => {
        try {
            const category = await Categories.findById(req.params.id).populate("products")
            if (category) {
                res.status(200).json(category)
            } else {
                res.status(404).json({
                    status: "404",
                    errorMessage: "Category not found with id " + req.params.id
                })
            }
        } catch (err) {
            res.status(500).json({
                status: "500",
                errorMessage: err.message || "Some error occurred while retrieving category."
            })
        }
    },
    findBy: async (req, res) => {
        try {
            const category_name = await Categories.findOne({
                name: req.query.search
            })
            const category_slug = await Categories.findOne({
                slug: req.query.search
            })
            console.log(category_name)
            console.log(category_slug)
            if (category_name || category_slug) {
                res.status(200).json(category_name || category_slug)
            }
        } catch (err) {
            res.status(500).json({
                status: "500",
                errorMessage:
                    err.message || "Some error occurred while retrieving categories.",
            });
        }
    },
    create: async (req, res) => {
        try {
            const category = await Categories.create(req.body);
            res.status(201).json(category);
        } catch (err) {
            res.status(500).json({
                status: "500",
                errorMessage:
                    err.message || "Some error occurred while creating the Category.",
            });
        }
    },
    update: async (req, res) => {
        try {
            const category = await Categories.findById(req.params.id);
            await category.updateOne({$set: req.body});
            if (category) res.status(200).json(category);
            else
                res.status(404).json({
                    errorMessage: "Not found",
                });
        } catch (err) {
            res.status(500).json({
                status: "500",
                errorMessage:
                    err.message || "Some error occurred while updating the Category.",
            });
        }
    },
    delete: async (req, res) => {
        try {
            const category = await Categories.findById(req.params.id);
            if (category) {
                if (category.get("products").length > 0) {
                    res.status(400).json({
                        errorMessage: "Category has products",
                    });
                } else {
                    await category.remove();
                    res.status(200).json({
                        message: "Category deleted successfully!",
                    });
                }
            }
        } catch (err) {
            res.status(500).json({
                status: "500",
                errorMessage:
                    err.message || "Some error occurred while deleting the Category.",
            });
        }
    },
}
module.exports = categoryController;
