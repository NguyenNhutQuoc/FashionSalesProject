const router = require('express').Router();

const ProductDetailsController = require('../controllers/ProductDetailController')
router.get('/:id', ProductDetailsController.findById);
router.get('/', ProductDetailsController.findAll);
router.post('/', ProductDetailsController.create);
router.put('/:id', ProductDetailsController.update);
router.delete('/:id', ProductDetailsController.delete);

module.exports = router;