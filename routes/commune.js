const router = require('express').Router()

const communeController = require('../controllers/CommuneController')

router.get('/', communeController.findAll)

module.exports = router