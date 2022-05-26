const {
    Province
} = require('../model/model');

const provinceController = {
    findAll: async (req, res) => {
        try {
            const provinces = await Province.find();
            res.status(200).json(provinces);
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            });
        }
    },

    findOne: async (req, res) => {
        try {
            const province = await Province.findById(req.params.id);
            res.status(200).json(province);
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            });
        }
    },

    create: async (req, res) => {
        try {
            const province = await Province.create(req.body);
            res.status(201).json(province);
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            });
        }
    },
}

module.exports = provinceController;