const { CategoriesSchema } = require("../model/model");

const categoryController = {
    findAll: async (req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const categories = await CategoriesSchema.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                })
                const {docs, ...others} = categories

                res.status(200).json({
                    data: docs,
                    ...others
                })
            } else {
                const categories = await CategoriesSchema.find({})
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
            const category = await CategoriesSchema.findById(req.params.id).populate("products")
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
            const category_name = await CategoriesSchema.findOne({
                name: req.query.search
            })
            const category_slug = await CategoriesSchema.findOne({
                slug: req.query.search
            })
            console.log(category_name)
            console.log(category_slug)
            if (category_name || category_slug) {
                res.status(200).json(category_name || category_slug)
            } else
                res.status(404).json({
                    status: "404",
                    errorMessage: "Not found"
                })
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
            const category = await CategoriesSchema.create(req.body);
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
            const category = await CategoriesSchema.findById(req.params.id);
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
            const category = await CategoriesSchema.findById(req.params.id);
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
