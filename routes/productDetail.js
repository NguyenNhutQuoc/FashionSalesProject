const router = require('express').Router();

const ProductDetailsController = require('../controllers/ProductDetailController')

router.post('/', ProductDetailsController.create);
router.put('/:id', ProductDetailsController.update);
router.delete('/:id', ProductDetailsController.delete);

module.exports = router;