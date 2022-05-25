const {
    Commune, District
} = require('../model/model');

const communeController = {
    finAll: async (req, res) => {
        try {
            const communes = await Commune.find();
            res.json(communes);
        } catch (error) {
            res.json({
                message: error
            });
        }
    },

    findAllByDistrict: async (req, res) => {
        try {
            const district = await District.findOne({
                name: req.query.district
            })
            const communes = await Commune.find({
                district: district.get('_id')
            });
            res.json(communes);
        } catch (error) {
            res.json({
                message: error
            });
        }
    },

}