const {
    Coupons
} = require("../model/model");

const CouponController = {
    findALl : async (req, res) => {
        try {
            const coupons = await Coupons.find()
            res.json({
                data: coupons
            })
        } catch (err) {
            res.json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    findOne : async (req, res) => {
        try {
            const coupon = await Coupons.findById(req.params.id)
            res.json({
                data: coupon
            })
        } catch (err) {
            res.json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
    create: async (req, res) => {
        try {
            if (Array.isArray(req.body)) {
                console.log(req.body)
                const coupons = await Coupons.insertMany(req.body)
                res.json({
                    data: coupons
                })
            } else {
                const coupon = await Coupons.create(req.body)
                res.json({
                    data: coupon
                })
            }
        } catch (err) {
            res.json({
                status: 500,
                errorMessage: err.message
            })
        }
    },
}