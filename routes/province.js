const router = require('express').Router()

const province = require('../controllers/ProvinceController')

router.get('/', province.findAll)

module.exports = router