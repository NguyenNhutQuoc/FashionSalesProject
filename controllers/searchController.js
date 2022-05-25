const {
    Province,
    District,
    Commune
} = require('../model/model');

const searchController = {

    search: async (req, res) => {
        const {
            province,
            district,
        } = req.query;
        if (province) {
            const provinceData = await Province.findOne({
                name: province
            })
            const districts = await District.find({
                province: provinceData._id
            })
            res.json({
                data: districts
            })
        }
        if (province && district) {
            const provinceData = await Province.findOne({
                name: province
            })
            const districtData = await District.findOne({
                name: district,
                province: provinceData._id
            })
            const communes = await Commune.find({
                district: districtData._id
            })
            res.json({
                data: communes
            })
        }
    }
}

module.exports = searchController;