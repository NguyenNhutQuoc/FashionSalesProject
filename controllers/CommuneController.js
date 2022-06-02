const {
    Commune,
    District
} = require('../model/model');

const subVn = require('sub-vn');
const communeController = {
    findAll: async(req, res) => {
        try {
            const communes = subVn.getWards()
            res.json(communes);
        } catch (error) {
            res.json({
                message: error
            });
        }
    },

    findAllByDistrict: async(req, res) => {
        try {
            const wards = subVn.getWardsByDistrictCode
            res.json(communes);
        } catch (error) {
            res.json({
                message: error
            });
        }
    },
}

module.exports = communeController