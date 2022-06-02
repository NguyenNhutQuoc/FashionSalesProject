const router = require('express').Router()

const district = require('../controllers/DistrictController')

router.get('/', district.findAll)
module.exports = router