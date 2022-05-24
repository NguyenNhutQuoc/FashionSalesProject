const router = require('express').Router();

const ProductDetailsController = require('../controllers/ProductDetailController')
router.get('/:id', ProductDetailsController.findById);
router.get('/', ProductDetailsController.findAll);
router.get("/find/search",ProductDetailsController.findBy);
router.post('/', ProductDetailsController.create);
router.put('/:id', ProductDetailsController.update);
router.delete('/:id', ProductDetailsController.delete);
router.get('/:id/images', ProductDetailsController.findAllImagesByIdProduct);
router.get('/calc/import-export', ProductDetailsController.calculateQuantityImportAndExport);
module.exports = router;