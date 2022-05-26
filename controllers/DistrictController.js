const {
    District, Province
} = require('../model/model');

const districtController = {
    findAll: async(req, res) => {
        try {
            const districts = await District.find();
            res.status(200).json(districts);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    },

    findAllByProvince: async (req, res) => {
        try {
            const province = await Province.findOne({
                name: req.query.province
            })
            const districts = await District.find({
                province: province.get('_id')
            });
            res.status(200).json(districts);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    },
}

module.exports = districtController;