const Router = require('express').Router()
const actionController = require('../controllers/ActionController')

Router.post('/', actionController.create)

module.exports = Router