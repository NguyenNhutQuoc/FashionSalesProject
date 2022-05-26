const router = require('express').Router();

const productController = require('../controllers/ProductController');
router.get('/:id', productController.findById)
router.get("/", productController.findAll)
router.get("/find/search", productController.findBy)
router.get("/:id/find",productController.findBySizeColor)
router.post("/", productController.create)
router.put("/:id", productController.update)
router.delete("/:id", productController.delete)
router.get('/slug/:slug', productController.findBySlug)
router.get('/:slug/properties', productController.findAllProductDetailsBySlugProduct)
router.get('/:slug/comments', productController.findAllCommentsBySlugProduct)
module.exports = router;