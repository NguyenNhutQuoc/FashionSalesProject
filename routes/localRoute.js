const router = require('express').Router();

const locationSearch = require('/controllers/searchController')

router.get('/', locationSearch.search)

module.exports = router;