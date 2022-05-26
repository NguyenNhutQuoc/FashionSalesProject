const router = require("express").Router();

const couponController = require("../controllers/CouponController");

router.get("/", couponController.findAll);
router.get("/search", couponController.findBy);
router.post("/", couponController.create);
router.put("/:id", couponController.update);
router.delete("/:id", couponController.delete);
router.get("/find", couponController.search)
router.get("/:id", couponController.findById);
module.exports = router;
