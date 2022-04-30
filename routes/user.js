const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.findAll)
router.get('/search', UserController.findBy)
router.post('/', UserController.create)
router.put('/:id', UserController.update)
router.delete('/:id', UserController.delete)

module.exports = router