const { Coupons } = require("../model/model");

const couponController = {
    search: async(req, res) => {
        try {
            const {
                word
            } = req.query
            if (req.query.page || req.query.limit) {
                const coupons = await Coupons.paginate({
                    $or: [
                        {
                            code: {
                                $regex: word,
                                $options: "i"
                            }
                        }
                    ]
                }, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = coupons
                res.status(200).json({
                    data: docs,
                    ...others
                });
            }
            else {
                const coupons = await Coupons.find(
                    {
                        $or: [
                            {
                                code: {
                                    $regex: word,
                                    $options: "i"
                                }
                            }
                        ]
                    }
                ).sort({
                    createdAt: -1
                });
                res.status(200).json({
                    data: coupons
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message,
            });
        }
    },
    findAll: async(req, res) => {
        try {
            if (req.query.page || req.query.limit) {
                const coupons = await Coupons.paginate({}, {
                    page: req.query.page || 1,
                    limit: req.query.limit || 10,
                    sort: {
                        createdAt: -1
                    }
                })
                const {docs, ...others} = coupons
                res.status(200).json({
                    data: docs,
                    ...others
                });
            }
            else {
                const coupons = await Coupons.find().sort({
                    createdAt: -1
                });
                res.status(200).json({
                    data: coupons
                })
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message,
            });
        }
  },
    findById: async(req, res) => {
        try {
            const coupon = await Coupons.findById(req.params.id);
            if (coupon) {
                res.status(200).json({
                    data: coupon
                })
            } else {
                res.status(404).json({
                    status: 404,
                    errorMessage: "Coupon not found",
                });
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                errorMessage: err.message,
            });
        }
    },
  findBy: async (req, res) => {
    try {
      const coupon_code = await Coupons.find({ code: req.query.search });
      const coupon_percent = await Coupons.find({ percent: req.query.search });
      const coupon_dateStart = await Coupons.find({
        dateStart: req.query.search,
      });
      const coupon_dateEnd = await Coupons.find({ dateEnd: req.query.search });
      const coupon_minimumAmount = await Coupons.find({
        minimumAmount: req.query.search,
      });
      const coupon_bill = await Coupons.find({
        bill: coupon_bill ? coupon_bill.get("_id") : null,
      });
      if (
        coupon_code ||
        coupon_percent ||
        coupon_dateStart ||
        coupon_dateEnd ||
        coupon_minimumAmount ||
        coupon_bill
      ) {
        res
          .status(200)
          .json(
            coupon_code ||
              coupon_percent ||
              coupon_dateStart ||
              coupon_dateEnd ||
              coupon_minimumAmount ||
              coupon_bill
          );
      } else {
        res.status(404).json({
          status: "404",
          message: "Not found",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        errorMessage: err.message,
      });
    }
  },
  create: async (req, res) => {
    try {
      const coupon = await Coupons.create(req.body);
      res.status(201).json(coupon);
    } catch (err) {
      res.status(500).json({
        status: 500,
        errorMessage:
          err.message || "Some error occurred while creating the Coupon.",
      });
    }
  },

  update: async (req, res) => {
    try {
      const coupon = await Coupons.findById(req.params.id);
      if (coupon) {
        if (coupon.get("bills").length > 0) {
          res.status(400).json({
            errorMessage: "Coupon has bills",
          });
        } else {
          await Coupons.updateOne({ $set: req.body });
          res.status(200).json({
            message: "Coupon update successfully!",
          });
        }
      } else {
        res.status(404).json({
          status: 404,
          errorMessage: "Not found coupon",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: "500",
        errorMessage:
          err.message || "Some error occurred while updating the Coupon",
      });
    }
  },

  delete: async (req, res) => {
    try {
      const coupon = await Coupons.findById(req.params.id);
      if (coupon) {
        if (coupon.get("bills").length > 0) {
          res.status(400).json({
            errorMessage: "Coupon has bills",
          });
        } else {
          await Coupons.remove();
          res.status(200).json({
            message: "Coupon deleted successfully!",
          });
        }
      } else {
        res.status(404).json({
          status: 404,
          errorMessage: "Not found coupon",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: 500,
        errorMessage: err.message,
      });
    }
  },
};
module.exports = couponController;
