const router = require('express').Router();
const userController = require('../controllers/UserController');

router.get('/find-products/:id/products', userController.findAllProductByUser)
router.get('/find-products-not-comment/:id/products', userController.findProductsNotCommentedByUser);
router.get('/email/:email', userController.findByEmail)
router.get('/', userController.findAll)
router.get('/find', userController.search)
router.get('/:id', userController.findById);
router.get('/v1/customers', userController.findCustomers);
router.get('/v1/providers', userController.findProviders)
router.get('/search', userController.findBy)
router.post('/', userController.create)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)
router.get('/:id/comments', userController.findAllCommentsByIdUser)
router.get('/:id/bills', userController.findAllBillsByIdUser)
router.get('/phones/:phone', userController.findByPhoneNumber)
router.get('/user/:id', userController.findByUserId)
router.post('/login', userController.login)
module.exports = router