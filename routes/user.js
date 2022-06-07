const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.findAll)
router.get('/find', UserController.search)
router.get('/:id', UserController.findById);
router.get('/v1/customers', UserController.findCustomers);
router.get('/v1/providers', UserController.findProviders)
router.get('/search', UserController.findBy)
router.post('/', UserController.create)
router.put('/:id', UserController.update)
router.delete('/:id', UserController.delete)
router.get('/:id/comments', UserController.findAllCommentsByIdUser)
router.get('/:id/bills', UserController.findAllBillsByIdUser)
router.get('/phones/:phone', UserController.findByPhoneNumber)
router.get('/user/:id', UserController.findByUserId)
router.get('email/:email', UserController.findByEmail)
router.post('/login', UserController.login)
module.exports = router