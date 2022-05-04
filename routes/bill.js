const router = require('express').Router();
const billController = require('../controllers/BillController');

router.get('/', billController.findAll);
router.get('/search', billController.findBy);
router.get('/date', billController.findByDate);
router.get('/shipped-date', billController.findByShippedDate);
router.post('/', billController.create);
router.put('/:id', billController.update);
router.delete('/:id', billController.delete);
router.get('/:id/bill-detail', billController.findAllBillDetailsByIdBill)
module.exports = router