const {
    Province,
    District,
    Commune
} = require('../model/model');
const subVn = require('sub-vn');
const searchController = {

    search: async(req, res) => {
        const {
            province,
            district,
        } = req.query;
        if (province) {
            if (district) {
                const communes = subVn.getWardsByDistrictCode(district);
                res.status(200).json({
                    data: communes
                })
            } else {
                const districts = subVn.getDistrictsByProvinceCode(province);
                res.status(200).json({
                    data: districts
                })
            }
        } else {
            const provinces = subVn.getProvinces();
            res.json({
                data: provinces
            })
        }
    }
}

module.exports = searchController;