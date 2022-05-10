const router = require('express').Router()

const billDetailController = require('../controllers/BillDetailController')

router.get('/', billDetailController.findAll)
router.get('/:id', billDetailController.findById)
router.get('/search', billDetailController.findBy)
router.post('/', billDetailController.create)
router.put('/:id', billDetailController.update)
router.delete('/:id', billDetailController.delete)
router.delete('/', billDetailController.deleteMany)
module.exports = router