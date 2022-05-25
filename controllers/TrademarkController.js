const {
    Trademarks
} = require('../model/model')

const trademarkController = {
    findAll: async (req, res) => {
        try {
            if(req.query.page || req.query.limit) {
                const trademarks = await Trademarks.paginate({}, {
                    page: req.query.page,
                    limit: req.query.limit | 10,
                })
                const {docs, ...others } = trademarks
                res.status(200).json(
                    {
                        data: docs,
                        ...others
                    }
                )
            } else {
                const trademarks = await Trademarks.find({})
                res.status(200).json({
                    data: trademarks
                })
            }
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    },

    findById: async (req, res) => {
        try {
            const trademark = await Trademarks.findById(req.params.id)
            res.status(200).json({
                data: trademark
            })
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    },

    create: async (req, res) => {
        try {
            const trademark = await Trademarks.create(req.body)
            res.status(201).json({
                data: trademark
            })
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    },

    update: async (req, res) => {
        try {
            const trademark = await Trademarks.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            })
            res.status(200).json({
                data: trademark
            })
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    },

    delete: async (req, res) => {
        try {
            const trademark = await Trademarks.findById(req.params.id)
            if (trademark.get('products').length > 0) {
                res.status(400).json({
                    errorMessage: 'Cannot delete trademark with products'
                })
            } else {
                await Trademarks.findByIdAndDelete(req.params.id)
                res.status(200).json({
                    message: 'Trademark deleted'
                })
            }
        } catch (e) {
            res.status(500).json({
                message: e.message
            })
        }
    }
}

module.exports = trademarkController