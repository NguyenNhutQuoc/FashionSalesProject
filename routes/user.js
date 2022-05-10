const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.get('/:id', UserController.findById);
router.get('/customers', UserController.findCustomers);
router.get('/providers', UserController.findProviders)
router.get('/', UserController.findAll)
router.get('/search', UserController.findBy)
router.post('/', UserController.create)
router.put('/:id', UserController.update)
router.delete('/:id', UserController.delete)
router.get('/:id/comments', UserController.findAllCommentsByIdUser)
router.get('/:id/bills', UserController.findAllBillsByIdUser)
module.exports = router