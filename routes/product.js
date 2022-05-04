const router = require('express').Router();

const productController = require('../controllers/ProductController');

router.get("/", productController.findAll)
router.get("/search", productController.findBy)
router.post("/", productController.create)
router.put("/:id", productController.update)
router.delete("/:id", productController.delete)

router.get('/:slug/properties', )
router.get('/:slug/comments', productController.findAllCommentsBySlugProduct)
router.get('/slug/bill-details', )
module.exports = router;