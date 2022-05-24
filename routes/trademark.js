const route = require('express').Router();
const TrademarkController = require('../controllers/TrademarkController');

route.get('/', TrademarkController.findAll)
route.get('/:id', TrademarkController.findById)
route.post('/', TrademarkController.create)
route.put('/:id', TrademarkController.update)
route.delete('/:id', TrademarkController.delete)