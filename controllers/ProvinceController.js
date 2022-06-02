const {
    Province
} = require('../model/model');
const location = require('sub-vn');
const subVn = require('sub-vn');
const provinceController = {
    findAll: async(req, res) => {
        try {
            const provinces = location.getProvinces();
            res.status(200).json({
                data: provinces
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                errorMessage: error.message
            });
        }
    },
}

module.exports = provinceController;