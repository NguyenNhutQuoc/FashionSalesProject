const route = require('express').Router();
const TrademarkController = require('../controllers/TrademarkController');

route.get('/', TrademarkController.findAll)
route.get('/find', TrademarkController.search)
route.get('/:id', TrademarkController.findById)
route.get('/:id/products',TrademarkController.findProduct)
route.post('/', TrademarkController.create)
route.put('/:id', TrademarkController.update)
route.delete('/:id', TrademarkController.delete)
module.exports = route;