const router = require('express').Router();
const billController = require('../controllers/BillController');

router.get('/statistics', billController.calculateTotalRevenue);
router.get('/find', billController.search);
router.get('/find-from-to-date', billController.findByDate);
router.get('/:id', billController.findById);
router.get('/', billController.findAll);
router.get('/search', billController.findBy);
router.get('/shipped-date', billController.findByShippedDate);
router.post('/', billController.create);
router.put('/:id', billController.update);
router.delete('/:id', billController.delete);
router.get('/:id/bill-detail', billController.findAllBillDetailsByIdBill)
router.get('/type/imports', billController.findAllImportType);
router.get('/type/exports', billController.findAllExportType);
module.exports = router