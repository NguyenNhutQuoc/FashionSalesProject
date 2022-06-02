const {
    District,
    Province
} = require('../model/model');

const districtController = {
    findAll: async(req, res) => {
        try {
            const districts = await District.find().populate('province');
            res.status(200).json(districts);
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    },

    findAllByProvince: async(req, res) => {
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

    create: async(req, res) => {
        try {
            for (const item of req.body) {
                const district = await District.create(item)
                const province = await Province.findById(district.province)
                await Province.findByIdAndUpdate(province.get('_id'), {
                    $push: {
                        districts: district.get('_id')
                    }
                })
            }

            res.status(201).json(req.body);
        } catch (err) {
            res.status(500).json({
                message: err.message
            });
        }
    }
}

module.exports = districtController;