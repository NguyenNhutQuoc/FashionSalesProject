const router = require('express').Router();

const productController = require('../controllers/ProductController');
router.get("/", productController.findAll)
router.get("/search", productController.findBy)
router.post("/", productController.create)
router.put("/:id", productController.update)
router.delete("/:id", productController.delete)
router.get('/slug/:slug', productController.findBySlug)
router.get('/:slug/properties', productController.findAllProductDetailsBySlugProduct)
router.get('/:slug/comments', productController.findAllCommentsBySlugProduct)
router.get('/find', productController.search)
router.get('/:id', productController.findById)
module.exports = router;